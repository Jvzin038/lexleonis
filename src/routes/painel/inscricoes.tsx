import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminInscricoes";

export const Route = createFileRoute("/painel/inscricoes")({
  head: () => ({ meta: [{ title: "Inscrições • Painel Lex Leonis" }] }),
  component: Page,
});
