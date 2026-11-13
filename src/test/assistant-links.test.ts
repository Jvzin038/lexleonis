import { describe, expect, it } from "vitest";

import { linkifyInternalPaths } from "@/components/ai/assistantLinks";

describe("Links das respostas do Leão", () => {
  it("transforma caminhos internos soltos em links markdown", () => {
    expect(linkifyInternalPaths("Acesse /contato ou /meus-ingressos.")).toBe(
      "Acesse [/contato](/contato) ou [/meus-ingressos](/meus-ingressos).",
    );
  });

  it("não duplica links markdown nem altera links externos", () => {
    const content = "Veja [Eventos](/eventos) e https://example.com/contato";

    expect(linkifyInternalPaths(content)).toBe(content);
  });
});
