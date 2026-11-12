import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Loja";

export const Route = createFileRoute("/_public/loja")({
  head: () => ({
    meta: [
      { title: "Loja • Atlética Lex Leonis" },
      { name: "description", content: "Produtos oficiais da Atlética Lex Leonis." },
      { property: "og:title", content: "Loja • Atlética Lex Leonis" },
      { property: "og:description", content: "Produtos oficiais da Atlética Lex Leonis." },
    ],
  }),
  component: Page,
});
