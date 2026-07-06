import { createHmac } from "crypto";
import { describe, it, expect } from "vitest";
import { createPaystackClient } from "../paystack";

const SECRET = "sk_test_smoke_secret";
const client = createPaystackClient(SECRET);

const sign = (body: string, secret: string = SECRET) =>
  createHmac("sha512", secret).update(body).digest("hex");

describe("verifyWebhookSignature", () => {
  it("accepts a correctly signed body", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } });
    expect(client.verifyWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a signature made with the wrong secret", () => {
    const body = JSON.stringify({ event: "charge.success" });
    expect(client.verifyWebhookSignature(body, sign(body, "sk_test_wrong"))).toBe(false);
  });

  it("rejects when the body was tampered with after signing", () => {
    const signature = sign(JSON.stringify({ amount: 1000 }));
    expect(client.verifyWebhookSignature(JSON.stringify({ amount: 100000 }), signature)).toBe(false);
  });

  it("rejects malformed or truncated hex without throwing", () => {
    const body = "{}";
    expect(client.verifyWebhookSignature(body, "not-hex-at-all")).toBe(false);
    expect(client.verifyWebhookSignature(body, sign(body).slice(0, 64))).toBe(false);
    expect(client.verifyWebhookSignature(body, "")).toBe(false);
  });

  it("fails closed (throws) when the client has no secret", () => {
    const unset = createPaystackClient("");
    expect(() => unset.verifyWebhookSignature("{}", sign("{}"))).toThrow("paystack_secret_unset");
  });
});
