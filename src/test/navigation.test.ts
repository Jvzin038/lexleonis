import { describe, expect, it } from "vitest";

import { DEFAULT_NAV_ITEMS, getNavItems } from "@/lib/navigation";

describe("Navegação padrão", () => {
  it("usa os dez caminhos padrão quando a posição não tem itens cadastrados", () => {
    const items = getNavItems([], "main");

    expect(items.map((item) => item.path)).toEqual([
      "/",
      "/atletica",
      "/eventos",
      "/calendario",
      "/esportes",
      "/loja",
      "/noticias",
      "/momentos",
      "/patrocinadores",
      "/contato",
    ]);
    expect(items).toHaveLength(DEFAULT_NAV_ITEMS.length);
    expect(items.every((item) => item.location === "main")).toBe(true);
  });

  it("mantém a prioridade dos itens cadastrados pela diretoria", () => {
    const configured = [
      { id: "custom", label: "Diretoria", path: "/diretoria", location: "main", order: 1 },
    ];

    expect(getNavItems(configured, "main")).toEqual(configured);
  });
});
