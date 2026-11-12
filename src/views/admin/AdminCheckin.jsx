import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ScanLine,
  Search,
  XCircle,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PermissionGate from '@/components/admin/PermissionGate';
import EmptyState from '@/components/site/EmptyState';
import jsQR from 'jsqr';
import { formatDateTime } from '@/lib/format';
import { TICKET_STATE } from '@/lib/orderStatus';

const RESULT_STYLES = {
  ok: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  duplicate: 'border-amber-300 bg-amber-50 text-amber-900',
  invalid: 'border-red-300 bg-red-50 text-red-800',
  cancelled: 'border-red-300 bg-red-50 text-red-800',
  refunded: 'border-red-300 bg-red-50 text-red-800',
  expired: 'border-red-300 bg-red-50 text-red-800',
  wrong_event: 'border-red-300 bg-red-50 text-red-800',
  not_paid: 'border-red-300 bg-red-50 text-red-800',
  not_open: 'border-amber-300 bg-amber-50 text-amber-900',
  error: 'border-red-300 bg-red-50 text-red-800',
};

function Stat({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white',
    ok: 'bg-emerald-50',
    warn: 'bg-amber-50',
  };
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 ${tones[tone]}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl text-brand-deep">{value}</p>
    </div>
  );
}

export default function AdminCheckin() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [code, setCode] = useState('');
  const [search, setSearch] = useState('');
  const [participants, setParticipants] = useState([]);
  const [result, setResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [loadingGate, setLoadingGate] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const loadEvents = useCallback(async () => {
    const page = await base44.entities.Event.filter(
      { status: { $in: ['published', 'sold_out', 'finished'] } },
      { sort: '-start_date', limit: 200 },
    );
    const items = page?.items || [];
    setEvents(items);
    return items;
  }, []);

  const loadGate = useCallback(
    async (id = eventId, term = '') => {
      if (!id) return;
      setLoadingGate(true);
      try {
        const response = await base44.functions.invoke('gateStats', { event_id: id, search: term });
        setStats(response.data?.stats || null);
        setEntries(response.data?.last_entries || []);
        setParticipants(response.data?.participants || []);
      } catch (error) {
        setStats(null);
        setEntries([]);
      } finally {
        setLoadingGate(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    (async () => {
      const items = await loadEvents();
      const upcoming = items.find((event) => event.status !== 'finished');
      const first = upcoming || items[0];
      if (first) {
        setEventId(first.id);
        loadGate(first.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScan = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => stopScan, []);

  const validate = async (value) => {
    const ticketCode = String(value || '').trim();
    if (!ticketCode) return;
    setValidating(true);
    try {
      const response = await base44.functions.invoke('checkinTicket', { code: ticketCode, event_id: eventId });
      setResult({
        kind: response.data?.result || 'ok',
        message: response.data?.message,
        ticket: response.data?.ticket,
      });
      setCode('');
    } catch (error) {
      const payload = error?.response?.data || {};
      setResult({
        kind: payload.result || 'invalid',
        message: payload.message || payload.error || 'Não foi possível validar este ingresso.',
        ticket: payload.ticket,
      });
    } finally {
      setValidating(false);
      loadGate();
    }
  };

  const startScan = async () => {
    setScanMessage('');
    if (!eventId) {
      setScanMessage('Selecione o evento antes de abrir a câmera.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanMessage(
        'Este aparelho ou navegador não oferece acesso à câmera. Use a consulta manual pelo código do ingresso.',
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      streamRef.current = stream;
      setScanning(true);
    } catch (error) {
      setScanMessage('Não foi possível acessar a câmera. Verifique a permissão do navegador.');
      stopScan();
    }
  };

  useEffect(() => {
    if (!scanning) return undefined;
    const video = videoRef.current;
    if (!video || !streamRef.current) return undefined;

    video.srcObject = streamRef.current;
    video.play().catch(() => {});

    // Leitura nativa quando disponível (Android/Chrome) e decodificador universal como alternativa
    const detector = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    const readFrame = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return null;
      const maxSide = 640;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const found = jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
      return found?.data || null;
    };

    let cancelled = false;
    let lastScan = 0;
    const tick = async (timestamp = 0) => {
      if (cancelled || !videoRef.current || !streamRef.current) return;
      let value = null;
      try {
        if (detector) {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length) value = codes[0].rawValue;
        } else if (timestamp - lastScan >= 90) {
          lastScan = timestamp;
          value = readFrame();
        }
      } catch (error) {
        value = null;
      }
      if (value) {
        stopScan();
        validate(value);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const selectedEvent = events.find((event) => event.id === eventId);

  return (
    <PermissionGate permission="checkin" title="Controle de entrada">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Controle de entrada</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              A validação acontece no servidor: existência do ingresso, evento, pagamento, validade e uso anterior. O
              mesmo ingresso nunca é liberado duas vezes, mesmo com dois aparelhos lendo ao mesmo tempo.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={loadingGate}
            onClick={() => loadGate()}
            className="h-11 w-full rounded-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingGate ? 'animate-spin' : ''}`} /> Atualizar indicadores
          </Button>
        </div>

        <div className="mt-6">
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Evento em operação</Label>
          <select
            value={eventId}
            onChange={(event) => {
              setEventId(event.target.value);
              setParticipants([]);
              setSearch('');
              setResult(null);
              loadGate(event.target.value);
            }}
            className="mt-2 h-11 w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Selecione o evento…</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} — {event.start_date}
              </option>
            ))}
          </select>
          {selectedEvent && (
            <p className="mt-2 text-xs text-slate-500">
              {selectedEvent.location_name} · {selectedEvent.start_time || '--:--'} às{' '}
              {selectedEvent.end_time || '--:--'}
            </p>
          )}
        </div>

        {!eventId ? (
          <div className="mt-8">
            <EmptyState
              title="Selecione o evento"
              message="A portaria precisa do evento selecionado para conferir se cada ingresso pertence à festa que está sendo fiscalizada."
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="Emitidos" value={stats?.issued ?? 0} />
              <Stat label="Entradas confirmadas" value={stats?.used ?? 0} tone="ok" />
              <Stat label="Ainda não utilizados" value={stats?.valid ?? 0} tone="warn" />
              <Stat label="Expirados" value={stats?.expired ?? 0} />
              <Stat label="Validações recusadas" value={stats?.refusals ?? 0} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">
                  Leitura de ingresso
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    onClick={startScan}
                    disabled={scanning}
                    className="h-12 w-full rounded-full bg-brand-deep sm:w-auto"
                  >
                    <Camera className="mr-2 h-4 w-4" /> {scanning ? 'Câmera ativa…' : 'Abrir câmera e ler QR Code'}
                  </Button>
                  {scanning && (
                    <Button variant="outline" onClick={stopScan} className="h-12 w-full rounded-full sm:w-auto">
                      Encerrar leitura
                    </Button>
                  )}
                </div>

                {scanMessage && (
                  <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {scanMessage}
                  </p>
                )}

                {scanning && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <video
                      ref={videoRef}
                      className="h-[46vh] max-h-80 min-h-[220px] w-full bg-black object-cover sm:h-64 lg:h-80"
                      muted
                      playsInline
                    />
                  </div>
                )}

                <div className="mt-6">
                  <Label htmlFor="codigo-ingresso" className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Código do ingresso (digitação manual)
                  </Label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="codigo-ingresso"
                      value={code}
                      onChange={(event) => setCode(event.target.value.toUpperCase())}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') validate(code);
                      }}
                      placeholder="LLXXXXXXXXXX"
                      autoComplete="off"
                      autoCapitalize="characters"
                      className="h-12 font-mono sm:flex-1"
                    />
                    <Button
                      onClick={() => validate(code)}
                      disabled={validating || !code}
                      className="h-12 w-full rounded-full bg-brand-gold text-brand-ink hover:bg-brand-gold/90 sm:w-auto"
                    >
                      {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validar'}
                    </Button>
                  </div>
                </div>

                {result && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mt-6 rounded-2xl border p-5 ${RESULT_STYLES[result.kind] || RESULT_STYLES.error}`}
                  >
                    <div className="flex items-start gap-3">
                      {result.kind === 'ok' ? (
                        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
                      ) : (
                        <XCircle className="mt-0.5 h-6 w-6 shrink-0" />
                      )}
                      <div>
                        <p className="font-heading text-sm uppercase tracking-[0.14em]">
                          {result.kind === 'ok' ? 'Entrada liberada' : 'Entrada não liberada'}
                        </p>
                        <p className="mt-1 text-sm">{result.message}</p>
                        {result.ticket && (
                          <dl className="mt-3 space-y-1 text-xs">
                            <div className="flex gap-2">
                              <dt className="text-slate-500">Titular:</dt>
                              <dd>{result.ticket.holder_name || '—'}</dd>
                            </div>
                            {result.ticket.participant_cpf && (
                              <div className="flex gap-2">
                                <dt className="text-slate-500">CPF:</dt>
                                <dd>{result.ticket.participant_cpf}</dd>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <dt className="text-slate-500">Evento:</dt>
                              <dd>{result.ticket.event_title}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="text-slate-500">Tipo:</dt>
                              <dd>{result.ticket.ticket_type_name}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="text-slate-500">Situação:</dt>
                              <dd>{TICKET_STATE[result.ticket.status] || result.ticket.status}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="text-slate-500">Pagamento:</dt>
                              <dd>{TICKET_STATE[result.ticket.payment_status] || result.ticket.payment_status || '—'}</dd>
                            </div>
                            {result.ticket.checked_in_at && (
                              <div className="flex gap-2">
                                <dt className="text-slate-500">Entrada:</dt>
                                <dd>{formatDateTime(result.ticket.checked_in_at)}</dd>
                              </div>
                            )}
                          </dl>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">
                    Buscar participante
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Use quando a câmera falhar: procure pelo nome do titular ou pelo código do ingresso.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') loadGate(eventId, search);
                      }}
                      placeholder="Nome ou código"
                      className="h-12 sm:flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => loadGate(eventId, search)}
                      aria-label="Buscar participante"
                      className="h-12 w-full rounded-full sm:w-auto"
                    >
                      <Search className="h-4 w-4" />
                      <span className="ml-2 sm:hidden">Buscar</span>
                    </Button>
                  </div>
                  {participants.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {participants.map((ticket) => (
                        <li
                          key={ticket.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                        >
                          <span>
                            <span className="font-medium text-brand-deep">{ticket.holder_name}</span>
                            <span className="ml-2 font-mono text-xs text-slate-500">{ticket.code}</span>
                          </span>
                          <span className="text-xs text-slate-500">
                            {TICKET_STATE[ticket.status] || ticket.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">
                    Últimas leituras
                  </p>
                  {entries.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Nenhuma leitura registrada neste evento ainda.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {entries.map((entry) => (
                        <li key={entry.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-2">
                          <span className="font-mono text-xs">{entry.ticket_code}</span>
                          <span className="text-xs text-slate-600">{entry.holder_name || '—'}</span>
                          <span className="text-xs text-slate-500">
                            {TICKET_STATE[entry.result] || entry.result}
                            {entry.result === 'ok' ? ' · liberado' : ''}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(entry.created_date).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <ScanLine className="h-3.5 w-3.5" /> Cada leitura registra operador, data e hora.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGate>
  );
}