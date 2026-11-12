import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminMomentos";

export const Route = createFileRoute("/painel/momentos")({
  head: () => ({ meta: [{ title: "Momentos • Painel Lex Leonis" }] }),
  component: Page,
});
