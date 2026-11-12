import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin_/entrar")({
  beforeLoad: () => {
    throw redirect({ to: "/painel/entrar", replace: true });
  },
});
