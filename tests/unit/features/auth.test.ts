import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/features/auth/schemas/auth-schema";

describe("Authentication Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "secretpassword",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email address", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "secretpassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid email");
      }
    });

    it("rejects short password less than 6 characters", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("6 characters");
      }
    });
  });

  describe("signupSchema", () => {
    it("accepts valid displayName, email, and password", () => {
      const result = signupSchema.safeParse({
        displayName: "Abhijeet",
        email: "abhijeet@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty displayName", () => {
      const result = signupSchema.safeParse({
        displayName: "   ",
        email: "abhijeet@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("required");
      }
    });
  });
});
