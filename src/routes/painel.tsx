import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel • Atlética Lex Leonis" },
      { name: "description", content: "Painel administrativo da Atlética Lex Leonis." },
      { property: "og:title", content: "Painel • Atlética Lex Leonis" },
      { property: "og:description", content: "Painel administrativo da Atlética Lex Leonis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute unauthenticatedElement={<Navigate to="/painel/entrar" replace />}>
      <AdminLayout />
    </ProtectedRoute>
  ),
});
