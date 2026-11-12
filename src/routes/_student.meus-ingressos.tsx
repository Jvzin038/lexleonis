import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/MeusIngressos";

export const Route = createFileRoute("/_student/meus-ingressos")({
  head: () => ({
    meta: [
      { title: "Meus ingressos • Atlética Lex Leonis" },
      { name: "description", content: "Seus ingressos com QR Code para a entrada." },
      { property: "og:title", content: "Meus ingressos • Atlética Lex Leonis" },
      { property: "og:description", content: "Seus ingressos com QR Code para a entrada." },
    ],
  }),
  component: Page,
});
