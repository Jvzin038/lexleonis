import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Eventos";

export const Route = createFileRoute("/_public/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos • Atlética Lex Leonis" },
      { name: "description", content: "Agenda de eventos, festas e jogos da Atlética Lex Leonis, com ingressos online." },
      { property: "og:title", content: "Eventos • Atlética Lex Leonis" },
      { property: "og:description", content: "Agenda de eventos, festas e jogos da Atlética Lex Leonis, com ingressos online." },
    ],
  }),
  component: Page,
});
