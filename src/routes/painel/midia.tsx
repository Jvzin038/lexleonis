import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminMidia";

export const Route = createFileRoute("/painel/midia")({
  head: () => ({ meta: [{ title: "Mídia • Painel Lex Leonis" }] }),
  component: Page,
});
