import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/MinhaArea";

export const Route = createFileRoute("/_student/minha-area")({
  head: () => ({
    meta: [
      { title: "Minha área • Atlética Lex Leonis" },
      { name: "description", content: "Seus dados, inscrições, pedidos e ingressos." },
      { property: "og:title", content: "Minha área • Atlética Lex Leonis" },
      { property: "og:description", content: "Seus dados, inscrições, pedidos e ingressos." },
    ],
  }),
  component: Page,
});
