import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Patrocinadores";

export const Route = createFileRoute("/_public/patrocinadores")({
  head: () => ({
    meta: [
      { title: "Patrocinadores • Atlética Lex Leonis" },
      { name: "description", content: "Parceiros e patrocinadores da atlética, com benefícios para alunos." },
      { property: "og:title", content: "Patrocinadores • Atlética Lex Leonis" },
      { property: "og:description", content: "Parceiros e patrocinadores da atlética, com benefícios para alunos." },
    ],
  }),
  component: Page,
});
