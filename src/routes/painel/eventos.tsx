import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminEventos";

export const Route = createFileRoute("/painel/eventos")({
  head: () => ({ meta: [{ title: "Eventos • Painel Lex Leonis" }] }),
  component: Page,
});
