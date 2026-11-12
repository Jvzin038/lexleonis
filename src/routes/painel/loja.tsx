import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminLoja";

export const Route = createFileRoute("/painel/loja")({
  head: () => ({ meta: [{ title: "Loja • Painel Lex Leonis" }] }),
  component: Page,
});
