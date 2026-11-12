import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminEsportes";

export const Route = createFileRoute("/painel/esportes")({
  head: () => ({ meta: [{ title: "Esportes • Painel Lex Leonis" }] }),
  component: Page,
});
