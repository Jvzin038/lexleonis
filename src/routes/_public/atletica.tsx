import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Atletica";

export const Route = createFileRoute("/_public/atletica")({
  head: () => ({
    meta: [
      { title: "A Atlética • Atlética Lex Leonis" },
      { name: "description", content: "História, missão, diretoria e símbolos da Lex Leonis." },
      { property: "og:title", content: "A Atlética • Atlética Lex Leonis" },
      { property: "og:description", content: "História, missão, diretoria e símbolos da Lex Leonis." },
    ],
  }),
  component: Page,
});
