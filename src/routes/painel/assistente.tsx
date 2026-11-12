import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminAssistente";

export const Route = createFileRoute("/painel/assistente")({
  head: () => ({ meta: [{ title: "Assistente de IA • Painel Lex Leonis" }] }),
  component: Page,
});
