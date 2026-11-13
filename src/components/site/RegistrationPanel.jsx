import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Ticket,
  UserCheck,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/site';
import { formatCurrency, formatDate, todayIso } from '@/lib/format';
import PixPaymentPanel from '@/components/site/PixPaymentPanel';
import ParticipantForm from '@/components/site/ParticipantForm';
import BuyerForm from '@/components/site/BuyerForm';
import CheckoutSteps from '@/components/site/CheckoutSteps';
import OrderSummary from '@/components/site/OrderSummary';

function availableQuantity(ticketType) {
  const total = Number(ticketType.quantity_total || 0);
  if (total <= 0) return null;
  return Math.max(0, total - Number(ticketType.quantity_sold || 0));
}

function salesWindowOpen(ticketType) {
  const today = todayIso();
  if (ticketType.sales_start && String(ticketType.sales_start).slice(0, 10) > today) return false;
  if (ticketType.sales_end && String(ticketType.sales_end).slice(0, 10) < today) return false;
  return true;
}

export default function RegistrationPanel({ event, ticketTypes, onRegistered }) {
  const { settings } = useSite();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState('select');
  const [selectedId, setSelectedId] = useState(() => ticketTypes[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [buyer, setBuyer] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    cpf: '',
  });
  const [participants, setParticipants] = useState([]);
  const [buyerIsParticipant, setBuyerIsParticipant] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);
  const [waitlistDone, setWaitlistDone] = useState(null);

  const selected = useMemo(
    () => ticketTypes.find((item) => item.id === selectedId) || null,
    [ticketTypes, selectedId],
  );

  const navigate = useNavigate();
  // Depois do pagamento confirmado, leva o aluno sozinho para os ingressos.
  useEffect(() => {
    if (step !== 'done' || !done?.pix_confirmed) return undefined;
    const timer = setTimeout(() => navigate('/meus-ingressos'), 4000);
    return () => clearTimeout(timer);
  }, [step, done, navigate]);

  const isClosed = ['cancelled', 'finished', 'sold_out'].includes(event.status);
  const waitlist = event.registration_mode === 'waitlist';
  const requirePhone = settings.require_phone_on_order !== false;
  const participantConfig = {
    require_cpf: event.require_participant_cpf === true,
    require_email: event.require_participant_email === true,
    require_phone: event.require_participant_phone === true,
  };

  const unitPrice = waitlist ? 0 : Number(selected?.price || 0);
  const totalPrice = unitPrice * (waitlist ? 1 : quantity);
  const isFree = Boolean(selected?.is_free) || unitPrice === 0;

  // --- Guards ---

  if (isClosed && !waitlist) {
    const labels = {
      cancelled: 'Evento cancelado',
      finished: 'Evento encerrado',
      sold_out: 'Ingressos esgotados',
    };
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">{labels[event.status]}</p>
        <p className="mt-2 text-sm text-slate-600">
          {event.status === 'cancelled'
            ? 'Este evento foi cancelado pela organização. Em caso de dúvidas, fale com a diretoria.'
            : event.status === 'finished'
              ? 'Este evento já aconteceu. Confira a galeria de momentos e os próximos eventos.'
              : 'A carga de ingressos foi encerrada. Acompanhe as próximas edições.'}
        </p>
        <Link to="/eventos" className="mt-5 inline-flex rounded-full bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white">
          Ver outros eventos
        </Link>
      </div>
    );
  }

  if (event.registration_mode === 'none') return null;

  if (event.registration_mode === 'external') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Inscrição externa</p>
        <p className="mt-2 text-sm text-slate-600">
          As inscrições deste evento são feitas em um canal externo indicado pela organização.
        </p>
        {event.registration_url && (
          <a href={event.registration_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white">
            Abrir inscrição
          </a>
        )}
      </div>
    );
  }

  if (waitlistDone) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <CheckCircle2 className="h-7 w-7 text-emerald-700" />
        <p className="mt-3 font-heading text-sm uppercase tracking-[0.16em] text-emerald-900">
          Você entrou na lista de espera
        </p>
        <p className="mt-2 text-sm text-emerald-900/80">
          Código: <span className="font-mono font-semibold">{waitlistDone}</span>
        </p>
        <p className="mt-3 text-sm text-emerald-900/80">
          Avisaremos quando uma vaga for liberada. Acompanhe na sua área do aluno.
        </p>
        <Link to="/minha-area" className="mt-5 inline-flex rounded-full bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white">
          Abrir minha área
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Ticket className="h-6 w-6 text-brand-primary" />
        <p className="mt-3 font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
          {waitlist ? 'Entrar na lista de espera' : 'Garanta seu ingresso'}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Entre com sua conta para comprar os ingressos e receber o QR Code digital de entrada.
        </p>
        <Link
          to={`/login?returnTo=${encodeURIComponent(`/eventos/${event.id}`)}`}
          className="mt-5 inline-flex rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white"
        >
          Entrar ou criar conta
        </Link>
      </div>
    );
  }

  // --- Waitlist submit ---
  const enterWaitlist = async () => {
    setError('');
    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('createTicketOrder', {
        event_id: event.id,
        waitlist: true,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        buyer_phone: buyer.phone,
      });
      const data = response.data || {};
      setWaitlistDone(data.order?.code || data.order_number || '');
      onRegistered?.();
    } catch (submitError) {
      setError(submitError?.response?.data?.error || 'Não foi possível registrar sua inscrição agora.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step transitions ---
  const goToParticipants = () => {
    setError('');
    if (!selected) {
      setError('Selecione um lote de ingresso.');
      return;
    }
    if (availableQuantity(selected) === 0) {
      setError('Este lote está esgotado.');
      return;
    }
    if (!salesWindowOpen(selected)) {
      setError('As vendas deste lote não estão abertas neste momento.');
      return;
    }
    const maxPerBuyer = Number(selected.max_per_buyer || 10);
    if (quantity > maxPerBuyer) {
      setError(`O limite é de ${maxPerBuyer} ingresso(s) por pessoa neste lote.`);
      return;
    }
    setParticipants(
      Array.from({ length: quantity }, (_, i) =>
        participants[i] || { name: '', cpf: '', email: '', phone: '' },
      ),
    );
    setStep('participants');
  };

  const toggleBuyerIsParticipant = (checked) => {
    setBuyerIsParticipant(checked);
    if (checked) {
      setParticipants((prev) => {
        const next = [...prev];
        next[0] = {
          name: buyer.name || '',
          cpf: buyer.cpf || '',
          email: buyer.email || '',
          phone: buyer.phone || '',
        };
        return next;
      });
    }
  };

  const updateParticipant = (index, data) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? data : p)));
  };

  const goToReview = () => {
    setError('');
    if (!buyer.name || buyer.name.trim().length < 3) {
      setError('Informe o nome do responsável pela compra.');
      return;
    }
    if (!buyer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
      setError('Informe um e-mail válido para o responsável pela compra.');
      return;
    }
    if (requirePhone && buyer.phone.replace(/\D/g, '').length < 10) {
      setError('Informe um telefone com DDD para o responsável pela compra.');
      return;
    }
    if (!isFree && buyer.cpf.replace(/\D/g, '').length < 11) {
      setError('Informe o CPF/CNPJ do comprador para gerar a cobrança Pix.');
      return;
    }
    for (let i = 0; i < participants.length; i += 1) {
      const p = participants[i] || {};
      if (!p.name || p.name.trim().length < 3) {
        setError(`Informe o nome do participante ${i + 1}.`);
        return;
      }
      if (participantConfig.require_cpf && (!p.cpf || p.cpf.replace(/\D/g, '').length < 11)) {
        setError(`Informe o CPF do participante ${i + 1}.`);
        return;
      }
      if (participantConfig.require_email && (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))) {
        setError(`Informe um e-mail válido do participante ${i + 1}.`);
        return;
      }
      if (participantConfig.require_phone && (!p.phone || p.phone.replace(/\D/g, '').length < 10)) {
        setError(`Informe o telefone do participante ${i + 1}.`);
        return;
      }
    }
    setStep('review');
  };

  const confirm = async (method = 'pix') => {
    setError('');
    setSubmitting(true);
    // A aba é aberta já no clique para o navegador não bloquear o pop-up.
    const payWindow = method === 'card' ? window.open('', '_blank') : null;
    try {
      const payload = {
        event_id: event.id,
        ticket_type_id: selected?.id || '',
        quantity,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        buyer_phone: buyer.phone,
        buyer_cpf: buyer.cpf,
        payment_method: method,
        participants: participants.map((p) => ({
          name: p.name || '',
          cpf: p.cpf || '',
          email: p.email || '',
          phone: p.phone || '',
        })),
      };
      const response = await base44.functions.invoke('createTicketOrder', payload);
      const data = response.data || {};
      onRegistered?.();

      if (data.card) {
        setRegistrationId(data.order?.id || '');
        setPixData({
          invoice_url: data.invoice_url,
          reservation_expires_at: data.reservation_expires_at,
        });
        if (payWindow && data.invoice_url) payWindow.location.href = data.invoice_url;
        else payWindow?.close();
        setStep('pix');
      } else if (data.pix) {
        setRegistrationId(data.order?.id || '');
        setPixData({
          pix_qr_code: data.pix_qr_code,
          pix_copy_paste: data.pix_copy_paste,
          pix_expires_at: data.pix_expires_at,
          reservation_expires_at: data.reservation_expires_at,
        });
        setStep('pix');
      } else {
        setDone(data);
        setStep('done');
      }
    } catch (submitError) {
      payWindow?.close();
      setError(submitError?.response?.data?.error || 'Não foi possível registrar o pedido agora. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render steps ---

  if (step === 'pix' && registrationId) {
    return (
      <div className="space-y-4">
        <CheckoutSteps current="pix" free={isFree} />
        <PixPaymentPanel
          registrationId={registrationId}
          initialPix={pixData}
          onConfirmed={() => {
            setStep('done');
            setDone({ pix_confirmed: true, order_number: registrationId });
          }}
        />
      </div>
    );
  }

  if (step === 'done' && done) {
    return (
      <div className="space-y-4">
        <CheckoutSteps current="done" free={isFree} />
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-700" />
          <p className="mt-3 font-heading text-sm uppercase tracking-[0.16em] text-emerald-900">
            {isFree ? 'Inscrição confirmada!' : 'Pagamento confirmado!'}
          </p>
          <p className="mt-2 text-sm text-emerald-900/85">
            {isFree
              ? 'Seu ingresso digital foi emitido e já está disponível na área do aluno, com QR Code de entrada.'
              : `${quantity} ingresso(s) emitido(s) com QR Code individual. Apresente cada um na entrada do evento.`}
          </p>
          <p className="mt-2 text-sm text-emerald-900/85">
            Pedido: <span className="font-mono font-semibold">{done.order_number}</span>
          </p>
          {done.pix_confirmed && (
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-900">
              <Loader2 className="h-4 w-4 animate-spin" /> Levando você para seus ingressos…
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/meus-ingressos" className="rounded-full bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white">
              Ver meus ingressos
            </Link>
            <Link to="/eventos" className="rounded-full border border-brand-deep px-5 py-2.5 text-sm font-semibold text-brand-deep">
              Ver outros eventos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-4">
        <CheckoutSteps current="review" free={isFree} />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Revisão da compra</p>
          <p className="mt-1 text-xs text-slate-500">
            Confira todos os dados antes de gerar a cobrança. Você pode voltar para corrigir qualquer informação.
          </p>

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Evento</dt>
              <dd className="text-right font-medium text-brand-deep">{event.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Data</dt>
              <dd className="text-brand-deep">{formatDate(event.start_date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Lote</dt>
              <dd className="text-brand-deep">{selected?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Quantidade</dt>
              <dd className="text-brand-deep">{quantity}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Unitário</dt>
              <dd className="text-brand-deep">{isFree ? 'Gratuito' : formatCurrency(unitPrice)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-2 text-base font-semibold text-brand-deep">
              <dt>Total</dt>
              <dd>{isFree ? 'Gratuito' : formatCurrency(totalPrice)}</dd>
            </div>
          </dl>

          <div className="mt-5 rounded-xl bg-brand-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">Comprador</p>
            <p className="mt-1.5 text-sm text-brand-deep">{buyer.name}</p>
            <p className="text-sm text-slate-600">{buyer.email} · {buyer.phone || 'Sem telefone'}</p>
            {buyer.cpf && <p className="text-xs text-slate-500">CPF: {buyer.cpf}</p>}
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Participantes</p>
            <div className="mt-2 space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="rounded-lg border border-slate-100 p-3 text-sm">
                  <p className="font-medium text-brand-deep">
                    {i + 1}. {p.name || '—'}
                  </p>
                  {p.cpf && <p className="text-xs text-slate-500">CPF: {p.cpf}</p>}
                  {p.email && <p className="text-xs text-slate-500">{p.email}</p>}
                  {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-xl bg-brand-soft p-3 text-xs leading-relaxed text-brand-deep">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isFree
                ? 'Ao confirmar, os ingressos individuais serão emitidos imediatamente com QR Code de entrada.'
                : 'Ao confirmar, a cobrança (Pix ou cartão) será gerada. O ingresso é emitido apenas após a confirmação do pagamento pelo servidor — nunca por clicar em um botão.'}
            </span>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={() => confirm('pix')}
              disabled={submitting}
              className="rounded-full bg-brand-gold px-6 text-brand-ink hover:bg-brand-gold/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando…
                </>
              ) : isFree ? (
                'Confirmar inscrição'
              ) : (
                'Pagar com Pix'
              )}
            </Button>
            {!isFree && (
              <Button
                variant="outline"
                onClick={() => confirm('card')}
                disabled={submitting}
                className="rounded-full border-brand-deep px-6 text-brand-deep"
              >
                <CreditCard className="mr-2 h-4 w-4" /> Pagar com cartão
              </Button>
            )}
            <Button variant="outline" onClick={() => setStep('participants')} disabled={submitting} className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar e editar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'participants' && !waitlist) {
    return (
      <div className="space-y-4">
        <CheckoutSteps current="participants" free={isFree} />
        <OrderSummary event={event} ticketType={selected} quantity={quantity} compact />

        <BuyerForm buyer={buyer} onChange={setBuyer} requirePhone={requirePhone} requireCpf={!isFree} />

        {quantity >= 1 && (
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <input
              type="checkbox"
              checked={buyerIsParticipant}
              onChange={(e) => toggleBuyerIsParticipant(e.target.checked)}
              className="h-4 w-4 accent-brand-primary"
            />
            <span className="flex items-center gap-2 text-brand-deep">
              <UserCheck className="h-4 w-4 text-brand-primary" />
              Eu sou o Participante 1 (usar meus dados)
            </span>
          </label>
        )}

        {participants.map((participant, index) => (
          <ParticipantForm
            key={index}
            index={index}
            total={participants.length}
            participant={participant}
            onChange={(data) => updateParticipant(index, data)}
            config={participantConfig}
          />
        ))}

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button onClick={goToReview} disabled={submitting} className="rounded-full bg-brand-gold px-6 text-brand-ink hover:bg-brand-gold/90">
            Revisar compra <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setStep('select')} disabled={submitting} className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </div>
    );
  }

  // --- Step: select (default) ---
  return (
    <div className="space-y-4">
      <CheckoutSteps current="select" free={isFree} />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
          {waitlist ? 'Lista de espera' : 'Ingressos e inscrições'}
        </p>

        {!waitlist && ticketTypes.length === 0 && (
          <div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <span>Os lotes de ingresso deste evento ainda não foram publicados.</span>
          </div>
        )}

        {!waitlist && ticketTypes.length > 0 && (
          <div className="mt-5 space-y-3">
            {ticketTypes.map((ticketType) => {
              const available = availableQuantity(ticketType);
              const soldOut = available === 0;
              const closed = !salesWindowOpen(ticketType);
              const disabled = soldOut || closed;
              return (
                <button
                  key={ticketType.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedId(ticketType.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selectedId === ticketType.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-slate-200 hover:border-brand-primary/40'
                  } ${disabled ? 'cursor-not-allowed opacity-55' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-heading text-sm uppercase tracking-tight text-brand-deep">{ticketType.name}</p>
                      {ticketType.description && (
                        <p className="mt-1 text-xs text-slate-500">{ticketType.description}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {soldOut
                          ? 'Esgotado'
                          : closed
                            ? `Vendas de ${formatDate(ticketType.sales_start)} a ${formatDate(ticketType.sales_end)}`
                            : available !== null
                              ? `${available} disponível(is)`
                              : 'Disponível'}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-brand-deep">
                      {Number(ticketType.price || 0) === 0 ? 'Gratuito' : formatCurrency(ticketType.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {waitlist && (
          <p className="mt-3 text-sm text-slate-600">
            As vagas estão esgotadas. Entre na lista de espera e avisaremos quando uma vaga for liberada.
          </p>
        )}

        {!waitlist && (
          <div className="mt-5">
            <Label htmlFor="quantidade" className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Quantidade
            </Label>
            <Input
              id="quantidade"
              type="number"
              min={1}
              max={Number(selected?.max_per_buyer || 10)}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
              className="mt-2 h-11"
            />
            {selected && (
              <p className="mt-1 text-xs text-slate-400">
                Limite de {Number(selected.max_per_buyer || 10)} ingresso(s) por pessoa neste lote.
              </p>
            )}
          </div>
        )}

        {!waitlist && selected && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft p-4 text-sm">
            <span className="text-slate-600">Total</span>
            <span className="font-mono text-lg font-semibold text-brand-deep">
              {totalPrice === 0 ? 'Gratuito' : formatCurrency(totalPrice)}
            </span>
          </div>
        )}

        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

        <Button
          onClick={waitlist ? enterWaitlist : goToParticipants}
          disabled={submitting || (!waitlist && ticketTypes.length === 0)}
          className="mt-5 w-full rounded-full bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando…
            </>
          ) : waitlist ? (
            'Entrar na lista de espera'
          ) : (
            <>
              Continuar para os dados dos participantes <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Ao continuar você concorda com o uso dos seus dados para a organização do evento, conforme a política de
          privacidade da atlética. O ingresso é emitido apenas após a confirmação do pagamento.
        </p>
      </div>
    </div>
  );
}
