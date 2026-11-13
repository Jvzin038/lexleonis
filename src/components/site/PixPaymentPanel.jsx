import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { AlertCircle, CheckCircle2, Clock, Copy, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function PixPaymentPanel({ registrationId, initialPix, onConfirmed }) {
  const [status, setStatus] = useState('pending');
  const [tickets, setTickets] = useState([]);
  const [pix, setPix] = useState(initialPix || {});
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [expiresIn, setExpiresIn] = useState(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await base44.functions.invoke('checkPixStatus', {
        action: 'check',
        registration_id: registrationId,
      });
      const data = response.data || {};

      if (data.status === 'confirmed') {
        setStatus('confirmed');
        setTickets(data.tickets || []);
        onConfirmed?.(data.tickets);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      if (data.status === 'expired') {
        setStatus('expired');
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      if (data.pix_qr_code && data.pix_qr_code !== pix.pix_qr_code) {
        setPix((current) => ({
          pix_qr_code: data.pix_qr_code,
          pix_copy_paste: data.pix_copy_paste,
          pix_expires_at: data.pix_expires_at,
          reservation_expires_at: data.reservation_expires_at || current.reservation_expires_at,
        }));
      }
    } catch (err) {
      // keep polling
    }
  }, [registrationId, pix.pix_qr_code, onConfirmed]);

  const startPolling = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(checkStatus, 5000);
  }, [checkStatus]);

  const regenerate = async () => {
    setRegenerating(true);
    setError('');
    try {
      const response = await base44.functions.invoke('checkPixStatus', {
        action: 'regenerate',
        registration_id: registrationId,
      });
      const data = response.data || {};
      if (data.status === 'pending') {
        setPix((current) => ({
          pix_qr_code: data.pix_qr_code,
          pix_copy_paste: data.pix_copy_paste,
          pix_expires_at: data.pix_expires_at,
          reservation_expires_at: data.reservation_expires_at || current.reservation_expires_at,
        }));
        setStatus('pending');
        startPolling();
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Não foi possível gerar uma nova cobrança.');
    } finally {
      setRegenerating(false);
    }
  };

  const copyCode = () => {
    const code = pix.pix_copy_paste || '';
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    startPolling();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [startPolling]);

  // A reserva do ingresso (30 min) vence antes do QR Code do Asaas, então o
  // prazo mostrado é o menor dos dois.
  const deadline = [pix.pix_expires_at, pix.reservation_expires_at]
    .map((value) => (value ? new Date(value).getTime() : NaN))
    .filter((time) => Number.isFinite(time))
    .reduce((min, time) => Math.min(min, time), Infinity);

  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    const update = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setExpiresIn(null);
        if (status === 'pending') setStatus('expired');
        if (countdownRef.current) clearInterval(countdownRef.current);
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setExpiresIn(
        hours > 0
          ? `${hours}h${String(mins).padStart(2, '0')}`
          : `${mins}:${String(secs).padStart(2, '0')}`,
      );
    };
    update();
    countdownRef.current = setInterval(update, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [deadline, status]);

  if (status === 'confirmed') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <CheckCircle2 className="h-8 w-8 text-emerald-700" />
        <p className="mt-3 font-heading text-sm uppercase tracking-[0.16em] text-emerald-900">
          Pagamento confirmado!
        </p>
        <p className="mt-2 text-sm text-emerald-900/85">
          {tickets.length} ingresso(s) emitido(s) com QR Code individual. Apresente na entrada do evento.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/meus-ingressos"
            className="inline-flex rounded-full bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ver meus ingressos
          </Link>
          <Link
            to="/eventos"
            className="inline-flex rounded-full border border-brand-deep px-5 py-2.5 text-sm font-semibold text-brand-deep"
          >
            Ver outros eventos
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <AlertCircle className="h-8 w-8 text-amber-700" />
        <p className="mt-3 font-heading text-sm uppercase tracking-[0.16em] text-amber-900">
          Cobrança expirada
        </p>
        <p className="mt-2 text-sm text-amber-900/85">
          O prazo para pagamento acabou. Gere uma nova cobrança para continuar com a compra.
        </p>
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <Button
          onClick={regenerate}
          disabled={regenerating}
          className="mt-5 rounded-full bg-brand-primary"
        >
          {regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando…
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Gerar cobrança Pix
            </>
          )}
        </Button>
      </div>
    );
  }

  if (pix.invoice_url) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-primary" />
          <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
            Pagamento com cartão
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Finalize o pagamento na página segura do Asaas, aberta em uma nova aba. Os dados do cartão são
          digitados lá, nunca neste site.
        </p>
        <a
          href={pix.invoice_url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-gold px-5 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-gold/90"
        >
          <CreditCard className="mr-2 h-4 w-4" /> Abrir página de pagamento
        </a>
        {expiresIn && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Reserva expira em {expiresIn}
          </p>
        )}
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-soft p-3 text-xs leading-relaxed text-brand-deep">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          <span>Aguardando a aprovação do cartão… Esta página atualiza sozinha quando o pagamento for confirmado.</span>
        </div>
      </div>
    );
  }

  const qrSrc = pix.pix_qr_code
    ? pix.pix_qr_code.startsWith('http')
      ? pix.pix_qr_code
      : `data:image/png;base64,${pix.pix_qr_code}`
    : '';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-brand-primary" />
        <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
          Pagamento via Pix
        </p>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        Escaneie o QR Code abaixo com o app do seu banco ou copie o código Pix para pagar.
      </p>

      <div className="mt-5 flex flex-col items-center gap-4">
        {qrSrc ? (
          <div className="rounded-2xl border-2 border-brand-deep/10 bg-white p-4">
            <img src={qrSrc} alt="QR Code Pix" className="h-52 w-52" />
          </div>
        ) : (
          <div className="flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        )}

        {expiresIn && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Expira em {expiresIn}
          </p>
        )}
      </div>

      {pix.pix_copy_paste && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Código Pix copia e cola</p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              value={pix.pix_copy_paste}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-600"
              onClick={(e) => e.target.select()}
            />
            <Button
              type="button"
              onClick={copyCode}
              variant="outline"
              className="shrink-0 rounded-lg"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" /> Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-soft p-3 text-xs leading-relaxed text-brand-deep">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        <span>
          Aguardando confirmação do pagamento… A página atualiza automaticamente. Você também pode
          conferir seus ingressos em <Link to="/meus-ingressos" className="font-semibold underline">Meus Ingressos</Link>.
        </span>
      </div>
    </div>
  );
}
