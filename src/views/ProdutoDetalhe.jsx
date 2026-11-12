import React, { useEffect, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import usePageMeta from '@/hooks/usePageMeta';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/lib/cart';

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [size, setSize] = useState('');
  const [variation, setVariation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const { add } = useCart();

  usePageMeta(product?.name, product?.description);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const found = await base44.entities.Product.get(id);
        if (!mounted) return;
        setProduct(found);
        setSize(found?.sizes?.[0] || '');
        setVariation(found?.variations?.[0] || '');
      } catch (error) {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="site-container py-24 text-center">
        <h1 className="font-heading text-2xl uppercase text-brand-deep">Produto não encontrado</h1>
        <Link
          to="/loja"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a loja
        </Link>
      </div>
    );
  }

  const price = Number(product.promo_price ?? product.price ?? 0);
  const hasPromo = product.promo_price != null && Number(product.promo_price) < Number(product.price || 0);
  const soldOut = !product.preorder && Number(product.stock || 0) <= 0;
  const images = product.images?.length ? product.images : [''];

  return (
    <div className="site-container py-10">
      <Link to="/loja" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-deep">
        <ArrowLeft className="h-4 w-4" /> Voltar para a loja
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl bg-[#F4F4F6]">
            {images[activeImage] ? (
              <Image src={images[activeImage]} alt={product.name} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-brand-soft">
                <span className="font-heading text-sm uppercase tracking-[0.3em] text-brand-deep/40">
                  Lex Leonis
                </span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-[#F4F4F6] ${
                    activeImage === index ? 'border-brand-primary' : 'border-transparent'
                  }`}
                >
                  <Image src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              {product.category}
            </span>
          )}
          <h1 className="mt-3 font-heading text-2xl uppercase leading-tight tracking-tight text-brand-deep sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold text-brand-deep">{formatCurrency(price)}</span>
            {hasPromo && (
              <span className="font-mono text-base text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {product.preorder && (
            <p className="mt-3 inline-flex rounded-full bg-brand-deep px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-brand-gold">
              Produto por encomenda
            </p>
          )}

          {product.description && (
            <div className="site-prose mt-6 text-slate-600">
              {String(product.description)
                .split('\n')
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-7">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Tamanho / variação</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={`min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      size === option
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-slate-200 text-brand-deep hover:border-brand-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variations?.length > 0 && (
            <div className="mt-7">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                {product.variation_label || 'Cor / modelo'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variations.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVariation(option)}
                    className={`min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      variation === option
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-slate-200 text-brand-deep hover:border-brand-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.customizable && (
            <div className="mt-7 rounded-2xl border border-brand-gold/40 bg-brand-soft/50 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-deep">
                Personalização da camisa
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Escolha o número e o nome que vão estampados. Se não informar o número, a atlética atribui um número
                aleatório.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="custom-number" className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Número da camisa
                  </label>
                  <input
                    id="custom-number"
                    type="number"
                    min={0}
                    max={99}
                    value={customNumber}
                    onChange={(e) => setCustomNumber(e.target.value)}
                    placeholder="Aleatório"
                    className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="custom-name" className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Nome na camisa
                  </label>
                  <input
                    id="custom-name"
                    type="text"
                    maxLength={20}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex.: Silva"
                    className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-11 w-11 items-center justify-center text-brand-deep"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-mono text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(20, value + 1))}
                className="flex h-11 w-11 items-center justify-center text-brand-deep"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-slate-500">
              {soldOut
                ? 'Sem estoque no momento'
                : product.preorder
                  ? 'Encomenda com retirada na atlética'
                  : `${Number(product.stock || 0)} em estoque`}
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              disabled={soldOut}
              onClick={() => {
                add(product, size, quantity, variation, customName, customNumber);
                setAdded(true);
              }}
              className="rounded-full bg-brand-primary px-7 py-6 text-sm font-semibold hover:bg-brand-deep"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {soldOut ? 'Produto esgotado' : 'Adicionar ao carrinho'}
            </Button>
            <Link
              to="/carrinho"
              className="inline-flex items-center rounded-full border border-brand-deep px-7 py-3 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-deep hover:text-white"
            >
              Ir para o carrinho
            </Link>
          </div>

          {added && (
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <Check className="h-4 w-4" /> Produto adicionado ao carrinho.
            </p>
          )}

          <div className="mt-8 rounded-2xl bg-brand-soft p-5 text-sm text-slate-600">
            <p className="font-semibold text-brand-deep">Como funciona a compra</p>
            <p className="mt-2">
              Os pedidos são registrados no site e ficam com status pendente até a confirmação da diretoria. A retirada
              é feita na atlética, em horário divulgado nos canais oficiais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}