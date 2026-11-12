import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Criar conta • Atlética Lex Leonis" },
      { name: "description", content: "Crie sua conta para comprar ingressos e produtos." },
      { property: "og:title", content: "Criar conta • Atlética Lex Leonis" },
      { property: "og:description", content: "Crie sua conta para comprar ingressos e produtos." },
    ],
  }),
  component: Page,
});
