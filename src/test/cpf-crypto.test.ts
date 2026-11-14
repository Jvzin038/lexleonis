import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { decryptCpf, encryptCpf, isEncryptedCpf, maskCpf } from "@/backend/b44/shared/cpfCrypto";

describe("Criptografia de CPF", () => {
  beforeEach(() => {
    vi.stubEnv("CPF_ENCRYPTION_KEY", "chave-de-teste-com-tamanho-suficiente");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("grava o CPF criptografado, sem os dígitos abertos, e decifra de volta", () => {
    const stored = encryptCpf("123.456.789-09");
    expect(isEncryptedCpf(stored)).toBe(true);
    expect(stored).not.toContain("12345678909");
    expect(stored).not.toContain("123.456.789-09");
    expect(decryptCpf(stored)).toBe("123.456.789-09");
  });

  it("mostra só a versão mascarada a partir do valor criptografado", () => {
    expect(maskCpf(encryptCpf("123.456.789-09"))).toBe("***.456.789-**");
  });

  it("não criptografa duas vezes nem altera valores vazios ou mascarados", () => {
    const stored = encryptCpf("123.456.789-09");
    expect(encryptCpf(stored)).toBe(stored);
    expect(encryptCpf("")).toBe("");
    expect(encryptCpf("***.456.789-**")).toBe("***.456.789-**");
  });

  it("recusa decifrar com outra chave", () => {
    const stored = encryptCpf("123.456.789-09");
    vi.stubEnv("CPF_ENCRYPTION_KEY", "outra-chave-completamente-diferente");
    expect(() => decryptCpf(stored)).toThrow();
  });

  it("não grava CPF aberto quando a chave não está configurada", () => {
    vi.stubEnv("CPF_ENCRYPTION_KEY", "");
    expect(() => encryptCpf("123.456.789-09")).toThrow("CPF_ENCRYPTION_KEY");
  });
});
