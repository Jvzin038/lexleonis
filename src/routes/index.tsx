import { createFileRoute } from "@tanstack/react-router";
import PublicLayout from "@/components/layout/PublicLayout";
import Page from "@/views/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlética Lex Leonis" },
      { name: "description", content: "Portal oficial da Atlética Lex Leonis — eventos, ingressos, esportes, loja e a vida da atlética do curso de Direito." },
      { property: "og:title", content: "Atlética Lex Leonis" },
      { property: "og:description", content: "Portal oficial da Atlética Lex Leonis — eventos, ingressos, esportes, loja e a vida da atlética do curso de Direito." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <Page />
    </PublicLayout>
  ),
});
