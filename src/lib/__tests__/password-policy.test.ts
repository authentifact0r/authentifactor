import { describe, it, expect } from "vitest";
import { checkPassword, passwordSchema, PASSWORD_MIN, PASSWORD_MAX_BYTES } from "../password-policy";

describe("checkPassword", () => {
  it("accepts a strong password", () => {
    expect(checkPassword("Correct-Horse-42")).toBeNull();
  });

  it("rejects passwords under the 12-char minimum", () => {
    expect(checkPassword("Ab1!short")).toMatch(`${PASSWORD_MIN} characters`);
  });

  it("rejects passwords over 72 BYTES (bcrypt limit), counting multibyte chars", () => {
    // 25 × "€" = 75 bytes in UTF-8 but only 25 chars — must be rejected by bytes, not length
    const multibyte = "€".repeat(25);
    expect(checkPassword(multibyte)).toMatch(`${PASSWORD_MAX_BYTES} bytes`);
  });

  it("rejects long passwords with fewer than 3 character classes", () => {
    expect(checkPassword("alllowercaseonly")).toMatch("3 of");
    expect(checkPassword("alllowercase123")).toMatch("3 of"); // only 2 classes
  });

  it("accepts exactly 3 character classes at exactly 12 chars", () => {
    expect(checkPassword("abcdefg1234!")).toBeNull(); // lower + digit + symbol, 12 chars
  });
});

describe("passwordSchema (zod parity with checkPassword)", () => {
  it("agrees with checkPassword on accept and reject", () => {
    const cases = ["Correct-Horse-42", "short1!", "alllowercaseonly", "€".repeat(25), "abcdefg1234!"];
    for (const pw of cases) {
      const zodOk = passwordSchema.safeParse(pw).success;
      const fnOk = checkPassword(pw) === null;
      expect(zodOk).toBe(fnOk);
    }
  });
});
