import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminDiretoria";

export const Route = createFileRoute("/painel/diretoria")({
  head: () => ({ meta: [{ title: "Diretoria • Painel Lex Leonis" }] }),
  component: Page,
});
