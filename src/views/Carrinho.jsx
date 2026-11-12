import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { Loader2, MapPin, Minus, Plus, ShoppingBag, Store, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHero from '@/components/site/PageHero';
import EmptyState from '@/components/site/EmptyState';
import StorePixPaymentPanel from '@/components/site/StorePixPaymentPanel';
import usePageMeta from '@/hooks/usePageMeta';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/format';

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function maskCep(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function maskCpf(value) {
  const d = String(value || '').replace(/\D/g, '').slice(0, 14);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length <= 12) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export default function Carrinho() {
  usePageMeta('Carrinho', 'Revise seu pedido dos produtos oficiais da Atlética Lex Leonis.');
  const { items, total, updateQuantity, remove, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [fulfillment, setFulfillment] = useState('pickup');
  const [address, setAddress] = useState({
    zip: '', street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [pixData, setPixData] = useState(null);

  const updateAddress = (field, value) => setAddress((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    if (items.length === 0) return 'Adicione produtos ao carrinho.';
    if (phone.replace(/\D/g, '').length < 10) return 'Informe um telefone com DDD.';
    if (cpf.replace(/\D/g, '').length < 11) return 'Informe o CPF/CNPJ do comprador.';
    if (fulfillment === 'delivery') {
      if (address.zip.replace(/\D/g, '').length < 8) return 'Informe o CEP completo.';
      if (!address.street) return 'Informe a rua/avenida.';
      if (!address.number) return 'Informe o número.';
      if (!address.neighborhood) return 'Informe o bairro.';
      if (!address.city) return 'Informe a cidade.';
      if (!address.state) return 'Selecione o estado.';
    }
    return '';
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('createStoreOrder', {
        items: items.map((item) => ({
          product_id: item.product_id,
          size: item.size,
          variation: item.variation,
          quantity: item.quantity,
          custom_name: item.custom_name || '',
          custom_number: item.custom_number || '',
        })),
        phone,
        buyer_cpf: cpf,
        note,
        fulfillment_method: fulfillment,
        shipping_zip: fulfillment === 'delivery' ? address.zip : '',
        shipping_street: fulfillment === 'delivery' ? address.street : '',
        shipping_number: fulfillment === 'delivery' ? address.number : '',
        shipping_complement: fulfillment === 'delivery' ? address.complement : '',
        shipping_neighborhood: fulfillment === 'delivery' ? address.neighborhood : '',
        shipping_city: fulfillment === 'delivery' ? address.city : '',
        shipping_state: fulfillment === 'delivery' ? address.state : '',
      });
      const data = response.data || {};
      if (data.error) {
        setError(data.error);
        return;
      }
      setOrder(data.order || null);
      setPixData({
        pix_qr_code: data.pix_qr_code || '',
        pix_copy_paste: data.pix_copy_paste || '',
        pix_expires_at: data.pix_expires_at || '',
      });
      clear();
    } catch (submitError) {
      setError(
        submitError?.response?.data?.error ||
          'Não foi possível registrar o pedido agora. Tente novamente em instantes.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Pix payment screen
  if (order && pixData) {
    return (
      <div>
        <PageHero eyebrow="Loja oficial" title="Pagamento do pedido" subtitle="Pague o Pix para confirmar sua compra." />
        <section className="site-container py-12">
          <div className="mx-auto max-w-xl">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
              <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-deep">
                Pedido {order.order_number}
              </p>
              <p className="mt-2 text-slate-600">
                {order.items_count} item(ns) · {formatCurrency(order.total_amount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {fulfillment === 'delivery' ? 'Entrega no endereço informado' : 'Retirada na atlética'}
              </p>
            </div>
            <StorePixPaymentPanel
              orderId={order.id}
              initialPix={pixData}
              onConfirmed={() => {}}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Loja oficial"
        title="Meu carrinho"
        subtitle="Revise os itens, escolha entrega ou retirada e pague com Pix."
      />

      <section className="site-container py-12">
        {items.length === 0 ? (
          <EmptyState
            title="Seu carrinho está vazio"
            message="Explore a loja oficial e adicione os produtos da atlética."
            actionLabel="Ir para a loja"
            actionTo="/loja"
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F4F4F6]">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">LL</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-sm uppercase tracking-tight text-brand-deep">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.size ? `Tamanho ${item.size} • ` : ''}
                      {item.preorder ? 'Encomenda' : 'Pronta entrega'}
                    </p>
                    {(item.custom_name || item.custom_number) && (
                      <p className="mt-1 text-xs font-medium text-brand-primary">
                        {item.custom_number ? `Nº ${item.custom_number}` : 'Nº aleatório'}
                        {item.custom_name ? ` — ${item.custom_name}` : ''}
                      </p>
                    )}
                    <p className="mt-2 font-mono text-sm text-brand-deep">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      aria-label={`Remover ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Resumo do pedido</p>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p className="flex justify-between">
                    <span>Itens</span>
                    <span className="font-mono">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </p>
                  <p className="flex justify-between border-t border-slate-100 pt-3 text-base font-semibold text-brand-deep">
                    <span>Total</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                  </p>
                </div>

                {/* Entrega ou Retirada */}
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Forma de entrega</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillment('pickup')}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                        fulfillment === 'pickup'
                          ? 'border-brand-primary bg-brand-soft text-brand-deep'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Store className="h-4 w-4" /> Retirada
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillment('delivery')}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                        fulfillment === 'delivery'
                          ? 'border-brand-primary bg-brand-soft text-brand-deep'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <MapPin className="h-4 w-4" /> Entrega
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {fulfillment === 'pickup'
                      ? 'Retirar na sede da atlética — o endereço será informado na confirmação.'
                      : 'Informe o endereço completo para envio dos produtos.'}
                  </p>
                </div>

                {/* Endereço (apenas para entrega) */}
                {fulfillment === 'delivery' && (
                  <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <Label htmlFor="cep" className="text-xs text-slate-500">CEP</Label>
                        <Input
                          id="cep"
                          value={address.zip}
                          onChange={(e) => updateAddress('zip', maskCep(e.target.value))}
                          placeholder="00000-000"
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="rua" className="text-xs text-slate-500">Rua / Avenida</Label>
                        <Input
                          id="rua"
                          value={address.street}
                          onChange={(e) => updateAddress('street', e.target.value)}
                          placeholder="Rua das Palmeiras"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="numero" className="text-xs text-slate-500">Número</Label>
                        <Input
                          id="numero"
                          value={address.number}
                          onChange={(e) => updateAddress('number', e.target.value)}
                          placeholder="123"
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="complemento" className="text-xs text-slate-500">Complemento</Label>
                        <Input
                          id="complemento"
                          value={address.complement}
                          onChange={(e) => updateAddress('complement', e.target.value)}
                          placeholder="Apto, bloco… (opcional)"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bairro" className="text-xs text-slate-500">Bairro</Label>
                      <Input
                        id="bairro"
                        value={address.neighborhood}
                        onChange={(e) => updateAddress('neighborhood', e.target.value)}
                        placeholder="Centro"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Label htmlFor="cidade" className="text-xs text-slate-500">Cidade</Label>
                        <Input
                          id="cidade"
                          value={address.city}
                          onChange={(e) => updateAddress('city', e.target.value)}
                          placeholder="São Paulo"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado" className="text-xs text-slate-500">UF</Label>
                        <select
                          id="estado"
                          value={address.state}
                          onChange={(e) => updateAddress('state', e.target.value)}
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                        >
                          <option value="">—</option>
                          {UF_OPTIONS.map((uf) => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dados do comprador */}
                <div className="mt-5 space-y-4">
                  <div>
                    <Label htmlFor="telefone-carrinho" className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Telefone / WhatsApp
                    </Label>
                    <Input
                      id="telefone-carrinho"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(00) 00000-0000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf-carrinho" className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      CPF / CNPJ do comprador
                    </Label>
                    <Input
                      id="cpf-carrinho"
                      value={cpf}
                      onChange={(event) => setCpf(maskCpf(event.target.value))}
                      placeholder="000.000.000-00"
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-slate-400">Necessário para gerar a cobrança Pix.</p>
                  </div>
                  <div>
                    <Label htmlFor="observacao" className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Observações do pedido
                    </Label>
                    <Textarea
                      id="observacao"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Tamanho alternativo, nome para estampa…"
                      className="mt-2"
                    />
                  </div>
                </div>

                {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

                {isAuthenticated ? (
                  <Button
                    onClick={submit}
                    disabled={submitting}
                    className="mt-6 w-full rounded-full bg-brand-gold py-6 text-sm font-bold text-brand-ink hover:bg-brand-gold/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando cobrança Pix…
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="mr-2 h-4 w-4" /> Pagar com Pix
                      </>
                    )}
                  </Button>
                ) : (
                  <Link
                    to={`/login?returnTo=${encodeURIComponent('/carrinho')}`}
                    className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-primary py-3.5 text-sm font-semibold text-white"
                  >
                    Entrar para finalizar
                  </Link>
                )}

                <p className="mt-4 text-xs leading-relaxed text-slate-400">
                  Ao confirmar, a cobrança Pix é gerada. O pedido é confirmado automaticamente após o
                  pagamento — nunca por clicar em um botão.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}