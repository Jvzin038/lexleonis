import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminFinanceiro";

export const Route = createFileRoute("/painel/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro • Painel Lex Leonis" }] }),
  component: Page,
});
