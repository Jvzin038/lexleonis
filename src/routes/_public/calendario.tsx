import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Calendario";

export const Route = createFileRoute("/_public/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário • Atlética Lex Leonis" },
      { name: "description", content: "Calendário completo de eventos e partidas da atlética." },
      { property: "og:title", content: "Calendário • Atlética Lex Leonis" },
      { property: "og:description", content: "Calendário completo de eventos e partidas da atlética." },
    ],
  }),
  component: Page,
});
