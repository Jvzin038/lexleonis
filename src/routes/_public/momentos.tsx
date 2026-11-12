import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Momentos";

export const Route = createFileRoute("/_public/momentos")({
  head: () => ({
    meta: [
      { title: "Momentos • Atlética Lex Leonis" },
      { name: "description", content: "Galeria de fotos dos eventos e jogos da Lex Leonis." },
      { property: "og:title", content: "Momentos • Atlética Lex Leonis" },
      { property: "og:description", content: "Galeria de fotos dos eventos e jogos da Lex Leonis." },
    ],
  }),
  component: Page,
});
