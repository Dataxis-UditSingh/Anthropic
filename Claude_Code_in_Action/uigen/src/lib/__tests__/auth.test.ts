// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

type CookieRecord = { name: string; value: string };
const cookieStore: {
  store: Map<string, string>;
  setCalls: Array<{ name: string; value: string; options: Record<string, unknown> }>;
  get(name: string): CookieRecord | undefined;
  set(name: string, value: string, options: Record<string, unknown>): void;
  delete(name: string): void;
} = {
  store: new Map(),
  setCalls: [],
  get(name: string): CookieRecord | undefined {
    const value: string | undefined = this.store.get(name);
    return value === undefined ? undefined : { name, value };
  },
  set(name: string, value: string, options: Record<string, unknown>): void {
    this.store.set(name, value);
    this.setCalls.push({ name, value, options });
  },
  delete(name: string): void {
    this.store.delete(name);
  },
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { createSession, getSession } from "@/lib/auth";
import { SignJWT } from "jose";

const SECRET: Uint8Array = new TextEncoder().encode("development-secret-key");

async function signWith(
  secret: Uint8Array,
  claims: Record<string, unknown>,
  expirationTime: string | number = "7d",
): Promise<string> {
  return await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTime)
    .setIssuedAt()
    .sign(secret);
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts: string[] = token.split(".");
  if (parts.length !== 3) {
    throw new Error("not a JWS compact serialization");
  }
  const base64url: string = parts[1];
  const base64: string =
    base64url.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (base64url.length % 4)) % 4);
  const json: string = Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(json) as Record<string, unknown>;
}

beforeEach(() => {
  cookieStore.store.clear();
  cookieStore.setCalls = [];
});

test("createSession sets a cookie named 'auth-token'", async () => {
  await createSession("user-1", "alice@example.com");

  expect(cookieStore.setCalls).toHaveLength(1);
  expect(cookieStore.setCalls[0].name).toBe("auth-token");
});

test("createSession stores a non-empty JWT-shaped value", async () => {
  await createSession("user-1", "alice@example.com");

  const token: string = cookieStore.setCalls[0].value;
  expect(typeof token).toBe("string");
  expect(token.split(".")).toHaveLength(3);
});

test("createSession marks the cookie httpOnly", async () => {
  await createSession("user-1", "alice@example.com");
  expect(cookieStore.setCalls[0].options.httpOnly).toBe(true);
});

test("createSession sets sameSite 'lax'", async () => {
  await createSession("user-1", "alice@example.com");
  expect(cookieStore.setCalls[0].options.sameSite).toBe("lax");
});

test("createSession sets path '/'", async () => {
  await createSession("user-1", "alice@example.com");
  expect(cookieStore.setCalls[0].options.path).toBe("/");
});

test("createSession secure is false outside production", async () => {
  await createSession("user-1", "alice@example.com");
  expect(cookieStore.setCalls[0].options.secure).toBe(false);
});

test("createSession expires roughly 7 days in the future", async () => {
  const before: number = Date.now();
  await createSession("user-1", "alice@example.com");
  const after: number = Date.now();

  const expires = cookieStore.setCalls[0].options.expires as Date;
  expect(expires).toBeInstanceOf(Date);

  const sevenDaysMs: number = 7 * 24 * 60 * 60 * 1000;
  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession encodes userId and email in the JWT payload", async () => {
  await createSession("user-42", "bob@example.com");

  const token: string = cookieStore.setCalls[0].value;
  const payload: Record<string, unknown> = decodeJwtPayload(token);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("bob@example.com");
});

test("createSession JWT carries iat and exp claims", async () => {
  const before: number = Math.floor(Date.now() / 1000);
  await createSession("user-1", "alice@example.com");
  const after: number = Math.floor(Date.now() / 1000);

  const payload: Record<string, unknown> = decodeJwtPayload(
    cookieStore.setCalls[0].value,
  );
  const iat: number = payload.iat as number;
  const exp: number = payload.exp as number;

  expect(iat).toBeGreaterThanOrEqual(before);
  expect(iat).toBeLessThanOrEqual(after);

  const sevenDaysSec: number = 7 * 24 * 60 * 60;
  expect(exp).toBeGreaterThanOrEqual(before + sevenDaysSec - 1);
  expect(exp).toBeLessThanOrEqual(after + sevenDaysSec + 1);
});

test("createSession JWT header advertises HS256", async () => {
  await createSession("user-1", "alice@example.com");

  const token: string = cookieStore.setCalls[0].value;
  const headerB64url: string = token.split(".")[0];
  const headerB64: string =
    headerB64url.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (headerB64url.length % 4)) % 4);
  const header: Record<string, unknown> = JSON.parse(
    Buffer.from(headerB64, "base64").toString("utf-8"),
  );

  expect(header.alg).toBe("HS256");
});

test("createSession produces a different token each call (fresh iat)", async () => {
  await createSession("user-1", "alice@example.com");
  const first: string = cookieStore.setCalls[0].value;

  await new Promise<void>((resolve) => setTimeout(resolve, 1100));

  await createSession("user-1", "alice@example.com");
  const second: string = cookieStore.setCalls[1].value;

  expect(second).not.toBe(first);
});

test("getSession returns null when no cookie is present", async () => {
  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null when cookie value is empty string", async () => {
  cookieStore.store.set("auth-token", "");
  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null when the token is malformed", async () => {
  cookieStore.store.set("auth-token", "not-a-jwt");
  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null when the token is signed with a different secret", async () => {
  const wrongSecret: Uint8Array = new TextEncoder().encode("some-other-secret");
  const token: string = await signWith(wrongSecret, {
    userId: "user-1",
    email: "alice@example.com",
  });
  cookieStore.store.set("auth-token", token);

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null when the token is expired", async () => {
  const token: string = await signWith(
    SECRET,
    { userId: "user-1", email: "alice@example.com" },
    Math.floor(Date.now() / 1000) - 60,
  );
  cookieStore.store.set("auth-token", token);

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns the payload for a valid token", async () => {
  const token: string = await signWith(SECRET, {
    userId: "user-9",
    email: "carol@example.com",
  });
  cookieStore.store.set("auth-token", token);

  const session = await getSession();
  expect(session).not.toBeNull();
  expect(session?.userId).toBe("user-9");
  expect(session?.email).toBe("carol@example.com");
});

test("getSession reads from the 'auth-token' cookie specifically", async () => {
  const token: string = await signWith(SECRET, {
    userId: "user-1",
    email: "alice@example.com",
  });
  cookieStore.store.set("wrong-cookie-name", token);

  const session = await getSession();
  expect(session).toBeNull();
});

test("createSession + getSession roundtrip yields the same userId and email", async () => {
  await createSession("user-roundtrip", "round@trip.com");
  const session = await getSession();

  expect(session?.userId).toBe("user-roundtrip");
  expect(session?.email).toBe("round@trip.com");
});
