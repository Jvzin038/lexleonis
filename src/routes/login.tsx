import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar • Atlética Lex Leonis" },
      { name: "description", content: "Entre na sua conta da Atlética Lex Leonis." },
      { property: "og:title", content: "Entrar • Atlética Lex Leonis" },
      { property: "og:description", content: "Entre na sua conta da Atlética Lex Leonis." },
    ],
  }),
  component: Page,
});
