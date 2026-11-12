import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Noticias";

export const Route = createFileRoute("/_public/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias • Atlética Lex Leonis" },
      { name: "description", content: "Notícias e comunicados da Atlética Lex Leonis." },
      { property: "og:title", content: "Notícias • Atlética Lex Leonis" },
      { property: "og:description", content: "Notícias e comunicados da Atlética Lex Leonis." },
    ],
  }),
  component: Page,
});
