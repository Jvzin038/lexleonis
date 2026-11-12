import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminPaginas";

export const Route = createFileRoute("/painel/paginas")({
  head: () => ({ meta: [{ title: "Páginas • Painel Lex Leonis" }] }),
  component: Page,
});
