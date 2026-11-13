import { createClientFromRequest } from "../sdk.js";
import { makeOrderNumber } from "../shared/ticketRules.js";
import { createAsaasPixPayment, createAsaasCardPayment, cancelAsaasPayment } from "../shared/asaasPix.js";
const RESERVATION_MINUTES = 30;
function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}
function slice(value, max) {
  return String(value || "").trim().slice(0, max);
}
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Entre na sua conta para finalizar o pedido." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
    const phone = slice(body.phone, 40);
    const note = slice(body.note, 500);
    const buyerCpf = slice(body.buyer_cpf, 20);
    const paymentMethod = body.payment_method === "card" ? "card" : "pix";
    const fulfillmentMethod = String(body.fulfillment_method || "pickup") === "delivery" ? "delivery" : "pickup";
    const shippingZip = slice(body.shipping_zip, 12);
    const shippingStreet = slice(body.shipping_street, 120);
    const shippingNumber = slice(body.shipping_number, 20);
    const shippingComplement = slice(body.shipping_complement, 60);
    const shippingNeighborhood = slice(body.shipping_neighborhood, 80);
    const shippingCity = slice(body.shipping_city, 80);
    const shippingState = slice(body.shipping_state, 2).toUpperCase();
    if (incoming.length === 0) {
      return Response.json({ error: "Adicione ao menos um produto ao pedido." }, { status: 400 });
    }
    const settingsPage = await base44.asServiceRole.entities.SiteSettings.list({
      sort: "-updated_date",
      limit: 1
    });
    const settings = settingsPage?.items?.[0] || {};
    if (settings.require_phone_on_order !== false && phone.replace(/\D/g, "").length < 10) {
      return Response.json({ error: "Informe um telefone com DDD para o contato pelo WhatsApp." }, { status: 400 });
    }
    if (fulfillmentMethod === "delivery") {
      if (!shippingZip || onlyDigits(shippingZip).length < 8) {
        return Response.json({ error: "Informe o CEP completo para entrega." }, { status: 400 });
      }
      if (!shippingStreet) {
        return Response.json({ error: "Informe a rua/avenida para entrega." }, { status: 400 });
      }
      if (!shippingNumber) {
        return Response.json({ error: "Informe o número do endereço para entrega." }, { status: 400 });
      }
      if (!shippingNeighborhood) {
        return Response.json({ error: "Informe o bairro para entrega." }, { status: 400 });
      }
      if (!shippingCity) {
        return Response.json({ error: "Informe a cidade para entrega." }, { status: 400 });
      }
      if (!shippingState || shippingState.length !== 2) {
        return Response.json({ error: "Informe a UF (estado) para entrega." }, { status: 400 });
      }
    }
    if (onlyDigits(buyerCpf).length < 11) {
      return Response.json({ error: "Informe o CPF/CNPJ do comprador para gerar a cobrança Pix." }, { status: 400 });
    }
    const reserved = [];
    const items = [];
    let total = 0;
    for (const raw of incoming) {
      const productId = String(raw?.product_id || "").trim();
      const quantity = Math.max(1, Math.floor(Number(raw?.quantity || 1)));
      const size = slice(raw?.size, 20);
      const variation = slice(raw?.variation, 40);
      const customName = slice(raw?.custom_name, 20);
      let customNumber = slice(raw?.custom_number, 3);
      const product = await base44.asServiceRole.entities.Product.get(productId).catch(() => null);
      if (!product || product.status !== "published") {
        return Response.json({ error: "Um dos produtos não está mais disponível na loja." }, { status: 409 });
      }
      if (size && Array.isArray(product.sizes) && product.sizes.length > 0 && !product.sizes.includes(size)) {
        return Response.json({ error: `Tamanho indisponível para ${product.name}.` }, { status: 409 });
      }
      if (variation && Array.isArray(product.variations) && product.variations.length > 0 && !product.variations.includes(variation)) {
        return Response.json({ error: `Variação indisponível para ${product.name}.` }, { status: 409 });
      }
      const trackStock = product.preorder !== true;
      if (trackStock) {
        const available = Number(product.stock || 0);
        if (available < quantity) {
          for (const entry of reserved) {
            await base44.asServiceRole.entities.Product.updateMany({ id: entry.product_id }, { $inc: { stock: entry.quantity } });
          }
          return Response.json({
            error: available > 0 ? `Restam ${available} unidade(s) de ${product.name}.` : `${product.name} está sem estoque no momento.`
          }, { status: 409 });
        }
        await base44.asServiceRole.entities.Product.updateMany({ id: product.id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
        const after = await base44.asServiceRole.entities.Product.get(product.id).catch(() => null);
        reserved.push({ product_id: product.id, quantity });
        if (Number(after?.stock || 0) < 0) {
          for (const entry of reserved) {
            await base44.asServiceRole.entities.Product.updateMany({ id: entry.product_id }, { $inc: { stock: entry.quantity } });
          }
          return Response.json({ error: `O estoque de ${product.name} acabou de ser reservado por outro pedido.` }, { status: 409 });
        }
      }
      if (product.customizable && !customNumber) {
        customNumber = String(Math.floor(Math.random() * 99) + 1);
      }
      const unitPrice = Number(product.promo_price ?? product.price ?? 0);
      total += unitPrice * quantity;
      items.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || "",
        size,
        variation,
        custom_name: product.customizable ? customName : "",
        custom_number: product.customizable ? customNumber : "",
        quantity,
        unit_price: unitPrice,
        track_stock: trackStock
      });
    }
    const label = items.map((item) => {
      const variation = [item.size, item.variation].filter(Boolean).join(" / ");
      const custom = [item.custom_number && `Nº ${item.custom_number}`, item.custom_name].filter(Boolean).join(" ");
      const detail = [variation, custom].filter(Boolean).join(" · ");
      return `${item.quantity}x ${item.product_name}${detail ? ` (${detail})` : ""}`;
    }).join(", ");
    const orderNumber = makeOrderNumber("LOJ");
    const reservationExpiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString();
    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      user_id: user.id,
      user_name: user.full_name || "",
      user_email: user.email || "",
      contact_phone: phone,
      buyer_cpf: buyerCpf,
      items_label: label,
      items_count: items.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: total,
      fulfillment_method: fulfillmentMethod,
      shipping_zip: fulfillmentMethod === "delivery" ? shippingZip : "",
      shipping_street: fulfillmentMethod === "delivery" ? shippingStreet : "",
      shipping_number: fulfillmentMethod === "delivery" ? shippingNumber : "",
      shipping_complement: fulfillmentMethod === "delivery" ? shippingComplement : "",
      shipping_neighborhood: fulfillmentMethod === "delivery" ? shippingNeighborhood : "",
      shipping_city: fulfillmentMethod === "delivery" ? shippingCity : "",
      shipping_state: fulfillmentMethod === "delivery" ? shippingState : "",
      status: "awaiting_payment",
      payment_status: "pending",
      payment_method: paymentMethod,
      payment_provider: "asaas",
      stock_released: false,
      pickup_note: note,
      reservation_expires_at: reservationExpiresAt
    });
    const createdItems = await base44.asServiceRole.entities.OrderItem.bulkCreate(items.map((item) => ({ ...item, order_id: order.id, order_number: orderNumber, user_id: user.id })));
    await base44.asServiceRole.entities.AdminLog.create({
      action: `Pedido da loja registrado pelo site (${paymentMethod === "card" ? "cartão" : "Pix"})`,
      module: "Pedidos da loja",
      record_label: orderNumber,
      user_email: user.email || "",
      user_name: user.full_name || "",
      details: `${label} — ${fulfillmentMethod === "delivery" ? "Entrega" : "Retirada"}`
    });
    try {
      if (paymentMethod === "card") {
        const card = await createAsaasCardPayment({
          amount: total,
          registrationId: order.id,
          description: `Loja Lex Leonis — Pedido ${orderNumber}`,
          buyerName: user.full_name || "Comprador",
          buyerEmail: user.email || "",
          buyerCpf,
          buyerPhone: phone,
          successUrl: `${new URL(req.url).origin}/minha-area`
        });
        await base44.asServiceRole.entities.Order.update(order.id, { asaas_payment_id: card.id });
        return Response.json({
          order,
          items: createdItems,
          order_number: orderNumber,
          card: true,
          invoice_url: card.invoice_url,
          payment_intent_id: card.id,
          reservation_expires_at: reservationExpiresAt
        }, { status: 201 });
      }
      const pix = await createAsaasPixPayment({
        amount: total,
        registrationId: order.id,
        description: `Loja Lex Leonis — Pedido ${orderNumber}`,
        buyerName: user.full_name || "Comprador",
        buyerEmail: user.email || "",
        buyerCpf,
        buyerPhone: phone
      });
      await base44.asServiceRole.entities.Order.update(order.id, {
        asaas_payment_id: pix.id,
        pix_qr_code: pix.pix_qr_code,
        pix_copy_paste: pix.pix_copy_paste,
        pix_expires_at: pix.pix_expires_at
      });
      return Response.json({
        order,
        items: createdItems,
        order_number: orderNumber,
        pix: true,
        pix_qr_code: pix.pix_qr_code,
        pix_copy_paste: pix.pix_copy_paste,
        pix_expires_at: pix.pix_expires_at,
        payment_intent_id: pix.id,
        reservation_expires_at: reservationExpiresAt
      }, { status: 201 });
    } catch (pixError) {
      for (const entry of reserved) {
        await base44.asServiceRole.entities.Product.updateMany({ id: entry.product_id }, { $inc: { stock: entry.quantity } });
      }
      await base44.asServiceRole.entities.Order.update(order.id, {
        status: "cancelled",
        payment_status: "cancelled",
        stock_released: true
      });
      return Response.json({ error: `Não foi possível gerar a cobrança: ${pixError.message}` }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
