import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminSite";

export const Route = createFileRoute("/painel/site")({
  head: () => ({ meta: [{ title: "Personalizar site • Painel Lex Leonis" }] }),
  component: Page,
});
