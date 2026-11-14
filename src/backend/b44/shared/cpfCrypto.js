// Criptografia dos CPFs/CNPJs guardados no banco (AES-256-GCM).
// A chave vem do segredo CPF_ENCRYPTION_KEY e nunca sai do servidor.
// Formato gravado: enc:v1:<documento mascarado>:<iv>:<tag>:<dados>, com iv, tag e dados em base64.
// O trecho mascarado deixa as telas mostrarem o documento sem decifrar nada.
import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function encryptionKey() {
  const secret = process.env.CPF_ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error("CPF_ENCRYPTION_KEY não configurada.");
  }
  return createHash("sha256").update(secret).digest();
}

export function isEncryptedCpf(value) {
  return String(value || "").startsWith(PREFIX);
}

export function maskCpf(value) {
  const text = String(value || "");
  if (!text) return "";
  if (isEncryptedCpf(text)) return text.slice(PREFIX.length).split(":")[0] || "***";
  if (text.includes("*")) return text;
  const digits = text.replace(/\D/g, "");
  if (digits.length === 11) return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  if (digits.length > 4) return `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`;
  return digits ? "***" : "";
}

// Vazio, já criptografado ou já mascarado volta como está.
export function encryptCpf(value) {
  const text = String(value || "").trim();
  if (!text || isEncryptedCpf(text) || text.includes("*")) return text;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${maskCpf(text)}:${iv.toString("base64")}:${tag.toString("base64")}:${data.toString("base64")}`;
}

// Texto que não está criptografado volta como está.
export function decryptCpf(value) {
  const text = String(value || "");
  if (!isEncryptedCpf(text)) return text;
  const [, ivB64, tagB64, dataB64] = text.slice(PREFIX.length).split(":");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}
