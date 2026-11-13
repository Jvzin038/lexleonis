import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyAsaasWebhookOrigin } from "@/backend/b44/shared/asaasPix";

const WALLET_PAYLOAD = { account: { id: "wallet-publicada" } };

function requestWithToken(token?: string) {
  return new Request("https://example.com/api/public/asaas-webhook", {
    method: "POST",
    headers: token === undefined ? undefined : { "asaas-access-token": token },
  });
}

describe("Validação do webhook do Asaas", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("recusa quando ASAAS_WEBHOOK_TOKEN não está configurado, mesmo com a carteira no corpo", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "");
    vi.stubEnv("ASAAS_WALLET_ID", "wallet-publicada");

    expect(verifyAsaasWebhookOrigin(requestWithToken("qualquer"), WALLET_PAYLOAD)).toBe(false);
  });

  it("recusa token incorreto mesmo quando a carteira do corpo é igual à configurada", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "token-correto");
    vi.stubEnv("ASAAS_WALLET_ID", "wallet-publicada");

    expect(verifyAsaasWebhookOrigin(requestWithToken("token-errado"), WALLET_PAYLOAD)).toBe(false);
  });

  it("recusa uma requisição sem o header asaas-access-token", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "token-correto");

    expect(verifyAsaasWebhookOrigin(requestWithToken(), WALLET_PAYLOAD)).toBe(false);
  });

  it("aceita somente o header igual ao ASAAS_WEBHOOK_TOKEN configurado", () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "token-correto");

    expect(verifyAsaasWebhookOrigin(requestWithToken("token-correto"), WALLET_PAYLOAD)).toBe(true);
  });
});
