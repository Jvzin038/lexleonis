import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminDashboard";

export const Route = createFileRoute("/painel/")({
  head: () => ({ meta: [{ title: "Painel • Painel Lex Leonis" }] }),
  component: Page,
});
