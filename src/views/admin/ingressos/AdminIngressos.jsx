import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PermissionGate from '@/components/admin/PermissionGate';
import TicketOrdersPanel from '@/components/admin/tickets/TicketOrdersPanel';
import IssuedTicketsPanel from '@/components/admin/tickets/IssuedTicketsPanel';

const TAB_CLASS =
  'rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white';

export default function AdminIngressos() {
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [sweeping, setSweeping] = useState(false);

  const loadEvents = useCallback(async () => {
    const page = await base44.entities.Event.filter({}, { sort: '-start_date', limit: 300 });
    setEvents(page?.items || []);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const refreshValidity = async () => {
    setSweeping(true);
    setFeedback('');
    try {
      const response = await base44.functions.invoke('expireTickets', {});
      const expired = response.data?.expired || 0;
      setFeedback(
        expired > 0
          ? `${expired} ingresso(s) não utilizado(s) foram marcados como expirados.`
          : 'Nenhum ingresso precisava de atualização de validade agora.',
      );
    } catch (error) {
      setFeedback(error?.response?.data?.error || 'Não foi possível atualizar a validade agora.');
    } finally {
      setSweeping(false);
    }
  };

  return (
    <PermissionGate permission="ingressos" title="Ingressos e pedidos">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Ingressos e pedidos</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Pedidos de ingresso registrados no site, conferência de pagamento, emissão com QR Code e consulta dos
              ingressos emitidos.
            </p>
          </div>
          <Button
            onClick={refreshValidity}
            disabled={sweeping}
            variant="outline"
            className="h-11 w-full rounded-full sm:w-auto"
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            {sweeping ? 'Atualizando…' : 'Atualizar validade'}
          </Button>
        </div>

        {feedback && (
          <p className="mt-4 rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand-deep">{feedback}</p>
        )}

        <Tabs defaultValue="pedidos" className="mt-8">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="pedidos" className={TAB_CLASS}>
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="emitidos" className={TAB_CLASS}>
              Ingressos emitidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="mt-8">
            <TicketOrdersPanel events={events} />
          </TabsContent>

          <TabsContent value="emitidos" className="mt-8">
            <IssuedTicketsPanel events={events} />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
}