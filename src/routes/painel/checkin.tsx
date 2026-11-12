import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/admin/AdminCheckin";

export const Route = createFileRoute("/painel/checkin")({
  head: () => ({ meta: [{ title: "Portaria • Painel Lex Leonis" }] }),
  component: Page,
});
