import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminConfiguracoes";

export const Route = createFileRoute("/painel/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações • Painel Lex Leonis" }] }),
  component: Page,
});
