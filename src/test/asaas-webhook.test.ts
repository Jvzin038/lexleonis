import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyAsaasWebhookOrigin } from "@/backend/b44/shared/asaasPix";

function requestWithToken(token?: string) {
  const headers = new Headers();
  if (token !== undefined) headers.set("asaas-access-token", token);
  return new Request("https://example.com/api/public/asaas-webhook", { method: "POST", headers });
}

describe("Validação do webhook do Asaas", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("recusa quando ASAAS_WEBHOOK_TOKEN não está configurado, mesmo com a carteira no corpo", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "");
    vi.stubEnv("ASAAS_WALLET_ID", "wallet-publicada");

    expect(verifyAsaasWebhookOrigin(requestWithToken("qualquer"))).toBe(false);
  });

  it("recusa token incorreto mesmo quando a carteira do corpo é igual à configurada", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "token-correto");
    vi.stubEnv("ASAAS_WALLET_ID", "wallet-publicada");

    expect(verifyAsaasWebhookOrigin(requestWithToken("token-errado"))).toBe(false);
  });

  it("recusa uma requisição sem o header asaas-access-token", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "token-correto");

    expect(verifyAsaasWebhookOrigin(requestWithToken())).toBe(false);
  });

  it("aceita somente o header igual ao ASAAS_WEBHOOK_TOKEN configurado", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "token-correto");

    expect(verifyAsaasWebhookOrigin(requestWithToken("token-correto"))).toBe(true);
  });
});
