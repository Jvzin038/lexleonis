import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminUsuarios";

export const Route = createFileRoute("/painel/usuarios")({
  head: () => ({ meta: [{ title: "Usuários • Painel Lex Leonis" }] }),
  component: Page,
});
