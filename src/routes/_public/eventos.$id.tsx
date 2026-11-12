import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/EventoDetalhe";

export const Route = createFileRoute("/_public/eventos/$id")({
  head: () => ({
    meta: [
      { title: "Evento • Atlética Lex Leonis" },
      { name: "description", content: "Detalhes do evento, lotes de ingressos e inscrição." },
      { property: "og:title", content: "Evento • Atlética Lex Leonis" },
      { property: "og:description", content: "Detalhes do evento, lotes de ingressos e inscrição." },
    ],
  }),
  component: Page,
});
