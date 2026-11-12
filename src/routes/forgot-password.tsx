import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar senha • Atlética Lex Leonis" },
      { name: "description", content: "Receba um link para redefinir sua senha." },
      { property: "og:title", content: "Recuperar senha • Atlética Lex Leonis" },
      { property: "og:description", content: "Receba um link para redefinir sua senha." },
    ],
  }),
  component: Page,
});
