import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha • Atlética Lex Leonis" },
      { name: "description", content: "Defina uma nova senha para sua conta." },
      { property: "og:title", content: "Nova senha • Atlética Lex Leonis" },
      { property: "og:description", content: "Defina uma nova senha para sua conta." },
    ],
  }),
  component: Page,
});
