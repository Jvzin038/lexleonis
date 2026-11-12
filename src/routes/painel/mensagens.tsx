import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminMensagens";

export const Route = createFileRoute("/painel/mensagens")({
  head: () => ({ meta: [{ title: "Mensagens • Painel Lex Leonis" }] }),
  component: Page,
});
