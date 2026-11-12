import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Carrinho";

export const Route = createFileRoute("/_public/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho • Atlética Lex Leonis" },
      { name: "description", content: "Revise seu carrinho e finalize o pedido." },
      { property: "og:title", content: "Carrinho • Atlética Lex Leonis" },
      { property: "og:description", content: "Revise seu carrinho e finalize o pedido." },
    ],
  }),
  component: Page,
});
