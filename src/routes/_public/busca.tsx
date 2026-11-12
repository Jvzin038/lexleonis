import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Busca";

export const Route = createFileRoute("/_public/busca")({
  head: () => ({
    meta: [
      { title: "Busca • Atlética Lex Leonis" },
      { name: "description", content: "Busque eventos, notícias, produtos e modalidades." },
      { property: "og:title", content: "Busca • Atlética Lex Leonis" },
      { property: "og:description", content: "Busque eventos, notícias, produtos e modalidades." },
    ],
  }),
  component: Page,
});
