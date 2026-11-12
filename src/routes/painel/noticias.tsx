import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminNoticias";

export const Route = createFileRoute("/painel/noticias")({
  head: () => ({ meta: [{ title: "Notícias • Painel Lex Leonis" }] }),
  component: Page,
});
