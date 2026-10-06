import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { env, isWorkspacePreview } from "@/lib/env.server";

const SIGN_KEYS = [
  "Uid",
  "KeyId",
  "Amount",
  "FirstName",
  "LastName",
  "Phone",
  "Email",
  "Street",
  "City",
  "State",
  "Country",
  "PostalCode",
  "TransactionId",
  "Custom1",
] as const;

const WEBHOOK_KEYS = ["PaymentId", "Amount", "StatusId", "VisaId", "TransactionId", "Custom1"] as const;

export type SkipCashCreate = {
  amount: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  transactionId: string;
  returnUrl: string;
  webhookUrl: string;
};

export type SkipCashPayment = {
  id: string;
  statusId: number;
  payUrl: string;
  transactionId?: string;
};

export function skipcashReady() {
  return Boolean(env("SKIPCASH_KEY_ID") && env("SKIPCASH_KEY_SECRET")) && !isWorkspacePreview();
}

export function publicOrigin() {
  const authUrl = env("BETTER_AUTH_URL") || env("APP_URL");
  if (authUrl) return authUrl.replace(/\/$/, "");
  const vercel = env("VERCEL_PROJECT_PRODUCTION_URL") || env("VERCEL_URL");
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://127.0.0.1:8080";
}

function baseUrl() {
  return env("SKIPCASH_ENV") === "production"
    ? "https://api.skipcash.app"
    : "https://skipcashtest.azurewebsites.net";
}

function hmac(message: string, secret: string) {
  return createHmac("sha256", secret).update(message).digest("base64");
}

function signBody(body: Record<string, string>, secret: string) {
  const combined = SIGN_KEYS.filter((k) => body[k])
    .map((k) => `${k}=${body[k]}`)
    .join(",");
  return hmac(combined, secret);
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

function letters(value: string, fallback: string) {
  const clean = value.replace(/[^A-Za-z\u0600-\u06FF ]+/g, " ").trim();
  return (clean || fallback).slice(0, 60);
}

export function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: letters(parts[0] || "Customer", "Customer"),
    lastName: letters(parts.slice(1).join(" ") || "Eleven", "Eleven"),
  };
}

export function normalizePhone(raw: string) {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (plus) return `+${digits}`.slice(0, 15);
  if (digits.startsWith("974")) return `+${digits}`.slice(0, 15);
  if (digits.length === 8) return `+974${digits}`.slice(0, 15);
  return (digits.startsWith("00") ? `+${digits.slice(2)}` : digits).slice(0, 15);
}

export function statusFromSkipCash(statusId: number): "paid" | "canceled" | "failed" | "pending" {
  if (statusId === 2) return "paid";
  if (statusId === 3) return "canceled";
  if (statusId === 4 || statusId === 5) return "failed";
  return "pending";
}

export async function createSkipCashPayment(input: SkipCashCreate): Promise<SkipCashPayment> {
  const keyId = env("SKIPCASH_KEY_ID");
  const secret = env("SKIPCASH_KEY_SECRET");
  if (!keyId || !secret) throw new Error("SkipCash is not configured");

  const body: Record<string, string> = {
    Uid: randomUUID(),
    KeyId: keyId,
    Amount: input.amount.toFixed(2),
    FirstName: input.firstName,
    LastName: input.lastName,
    Phone: normalizePhone(input.phone),
    Email: input.email.slice(0, 255),
    Street: input.street.slice(0, 28),
    City: input.city.slice(0, 12),
    Country: "QA",
    TransactionId: input.transactionId.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40),
    Custom1: input.transactionId.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40),
    Subject: "11-11 Doha",
    Description: "eleven-eleven order",
    ReturnUrl: input.returnUrl,
    WebhookUrl: input.webhookUrl,
  };

  const signed: Record<string, string> = {};
  for (const k of SIGN_KEYS) if (body[k]) signed[k] = body[k];

  const res = await fetch(`${baseUrl()}/api/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: signBody(signed, secret),
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    resultObj?: { id?: string; statusId?: number; payUrl?: string; transactionId?: string };
    errorMessage?: string;
    hasError?: boolean;
    validationErrors?: unknown;
  };
  if (!res.ok || json.hasError || !json.resultObj?.id || !json.resultObj.payUrl) {
    const extra = Array.isArray(json.validationErrors) ? json.validationErrors.join(", ") : "";
    throw new Error(json.errorMessage || extra || "SkipCash could not start this payment");
  }
  return {
    id: json.resultObj.id,
    statusId: Number(json.resultObj.statusId ?? 0),
    payUrl: json.resultObj.payUrl,
    transactionId: json.resultObj.transactionId,
  };
}

export async function getSkipCashPayment(id: string): Promise<SkipCashPayment | null> {
  const clientId = env("SKIPCASH_CLIENT_ID") || env("SKIPCASH_KEY_ID");
  if (!clientId) return null;
  const res = await fetch(`${baseUrl()}/api/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: clientId },
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => ({}))) as {
    resultObj?: { id?: string; statusId?: number; payUrl?: string; transactionId?: string };
  };
  if (!json.resultObj?.id) return null;
  return {
    id: json.resultObj.id,
    statusId: Number(json.resultObj.statusId ?? 0),
    payUrl: json.resultObj.payUrl ?? "",
    transactionId: json.resultObj.transactionId,
  };
}

export function verifySkipCashWebhook(raw: Record<string, unknown>, authorization: string) {
  const secret = env("SKIPCASH_WEBHOOK_KEY") || env("SKIPCASH_WEBHOOK_SECRET");
  if (!secret || !authorization) return false;
  const pick = (name: string) => {
    const hit = Object.keys(raw).find((k) => k.toLowerCase() === name.toLowerCase());
    return hit == null || raw[hit] == null || raw[hit] === "" ? "" : String(raw[hit]);
  };
  const combined = WEBHOOK_KEYS.map((k) => {
    const v = pick(k);
    return v ? `${k}=${v}` : "";
  })
    .filter(Boolean)
    .join(",");
  return safeEqual(hmac(combined, secret), authorization);
}

export function parseSkipCashWebhook(raw: Record<string, unknown>) {
  const pick = (...names: string[]) => {
    for (const name of names) {
      const hit = Object.keys(raw).find((k) => k.toLowerCase() === name.toLowerCase());
      if (hit != null && raw[hit] != null && raw[hit] !== "") return String(raw[hit]);
    }
    return "";
  };
  return {
    paymentId: pick("PaymentId", "id"),
    statusId: Number(pick("StatusId", "statusId") || 0),
    transactionId: pick("TransactionId", "Custom1"),
  };
}
