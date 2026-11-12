import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Pagina";

export const Route = createFileRoute("/_public/pagina/$slug")({
  head: () => ({
    meta: [
      { title: "Página • Atlética Lex Leonis" },
      { name: "description", content: "Página institucional da Atlética Lex Leonis." },
      { property: "og:title", content: "Página • Atlética Lex Leonis" },
      { property: "og:description", content: "Página institucional da Atlética Lex Leonis." },
    ],
  }),
  component: Page,
});
