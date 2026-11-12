import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Contato";

export const Route = createFileRoute("/_public/contato")({
  head: () => ({
    meta: [
      { title: "Contato • Atlética Lex Leonis" },
      { name: "description", content: "Fale com a Atlética Lex Leonis." },
      { property: "og:title", content: "Contato • Atlética Lex Leonis" },
      { property: "og:description", content: "Fale com a Atlética Lex Leonis." },
    ],
  }),
  component: Page,
});
