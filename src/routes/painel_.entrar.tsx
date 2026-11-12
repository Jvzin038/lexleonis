import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminLogin";

export const Route = createFileRoute("/painel_/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar no painel • Atlética Lex Leonis" },
      { name: "description", content: "Acesso da diretoria ao painel da atlética." },
      { property: "og:title", content: "Entrar no painel • Atlética Lex Leonis" },
      { property: "og:description", content: "Acesso da diretoria ao painel da atlética." },
    ],
  }),
  component: Page,
});
