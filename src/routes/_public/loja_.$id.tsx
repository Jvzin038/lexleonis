import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/ProdutoDetalhe";

export const Route = createFileRoute("/_public/loja_/$id")({
  head: () => ({
    meta: [
      { title: "Produto • Atlética Lex Leonis" },
      { name: "description", content: "Detalhes do produto da loja oficial." },
      { property: "og:title", content: "Produto • Atlética Lex Leonis" },
      { property: "og:description", content: "Detalhes do produto da loja oficial." },
    ],
  }),
  component: Page,
});
