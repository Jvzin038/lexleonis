import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/SejaPatrocinador";

export const Route = createFileRoute("/_public/seja-patrocinador")({
  head: () => ({
    meta: [
      { title: "Seja patrocinador • Atlética Lex Leonis" },
      { name: "description", content: "Apoie a Atlética Lex Leonis e alcance os estudantes de Direito." },
      { property: "og:title", content: "Seja patrocinador • Atlética Lex Leonis" },
      { property: "og:description", content: "Apoie a Atlética Lex Leonis e alcance os estudantes de Direito." },
    ],
  }),
  component: Page,
});
