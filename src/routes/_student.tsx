import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Navigate } from "@/lib/router-compat";

export const Route = createFileRoute("/_student")({
  component: () => <ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />,
});
