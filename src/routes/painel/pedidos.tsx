import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminPedidos";

export const Route = createFileRoute("/painel/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos • Painel Lex Leonis" }] }),
  component: Page,
});
