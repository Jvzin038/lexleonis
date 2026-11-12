import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/ingressos/AdminIngressos";

export const Route = createFileRoute("/painel/ingressos")({
  head: () => ({ meta: [{ title: "Ingressos • Painel Lex Leonis" }] }),
  component: Page,
});
