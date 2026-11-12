import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/NoticiaDetalhe";

export const Route = createFileRoute("/_public/noticias_/$id")({
  head: () => ({
    meta: [
      { title: "Notícia • Atlética Lex Leonis" },
      { name: "description", content: "Notícia da Atlética Lex Leonis." },
      { property: "og:title", content: "Notícia • Atlética Lex Leonis" },
      { property: "og:description", content: "Notícia da Atlética Lex Leonis." },
    ],
  }),
  component: Page,
});
