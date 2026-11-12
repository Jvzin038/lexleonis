import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/ModalidadeDetalhe";

export const Route = createFileRoute("/_public/esportes/$id")({
  head: () => ({
    meta: [
      { title: "Modalidade • Atlética Lex Leonis" },
      { name: "description", content: "Elenco, jogos e classificação da modalidade." },
      { property: "og:title", content: "Modalidade • Atlética Lex Leonis" },
      { property: "og:description", content: "Elenco, jogos e classificação da modalidade." },
    ],
  }),
  component: Page,
});
