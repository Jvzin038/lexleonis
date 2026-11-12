import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/Esportes";

export const Route = createFileRoute("/_public/esportes")({
  head: () => ({
    meta: [
      { title: "Esportes • Atlética Lex Leonis" },
      { name: "description", content: "Modalidades esportivas, elencos, partidas e tabelas da atlética." },
      { property: "og:title", content: "Esportes • Atlética Lex Leonis" },
      { property: "og:description", content: "Modalidades esportivas, elencos, partidas e tabelas da atlética." },
    ],
  }),
  component: Page,
});
