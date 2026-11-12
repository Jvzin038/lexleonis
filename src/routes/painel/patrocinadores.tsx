import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminPatrocinadores";

export const Route = createFileRoute("/painel/patrocinadores")({
  head: () => ({ meta: [{ title: "Patrocinadores • Painel Lex Leonis" }] }),
  component: Page,
});
