import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Faq";

export const Route = createFileRoute("/_public/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes • Atlética Lex Leonis" },
      { name: "description", content: "Dúvidas sobre ingressos, eventos, loja e a atlética." },
      { property: "og:title", content: "Perguntas frequentes • Atlética Lex Leonis" },
      { property: "og:description", content: "Dúvidas sobre ingressos, eventos, loja e a atlética." },
    ],
  }),
  component: Page,
});
