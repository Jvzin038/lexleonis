import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/AlbumDetalhe";

export const Route = createFileRoute("/_public/momentos/$id")({
  head: () => ({
    meta: [
      { title: "Álbum • Atlética Lex Leonis" },
      { name: "description", content: "Fotos do álbum da Atlética Lex Leonis." },
      { property: "og:title", content: "Álbum • Atlética Lex Leonis" },
      { property: "og:description", content: "Fotos do álbum da Atlética Lex Leonis." },
    ],
  }),
  component: Page,
});
