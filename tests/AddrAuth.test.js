import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AddrAuth from "../src/index";
import jwt from "jsonwebtoken";
import crypto from "crypto";

vi.mock("jsonwebtoken");
vi.mock("crypto");

describe("AddrAuth", () => {
  let addrAuth;
  const mockVerifySignature = vi.fn();
  const mockJWTSecret = "test-secret";

  beforeEach(() => {
    addrAuth = new AddrAuth({
      verifySignature: mockVerifySignature,
      JWTSecret: mockJWTSecret,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create an instance with default values", () => {
      expect(addrAuth.verifySignature).toBe(mockVerifySignature);
      expect(addrAuth.JWTSecret).toBe(mockJWTSecret);
      expect(addrAuth.challengeExpiresIn).toBe("10m");
      expect(addrAuth.JWTExpiresIn).toBe("100d");
    });

    it("should throw TypeError for invalid parameters", () => {
      expect(
        () =>
          new AddrAuth({
            verifySignature: "not a function",
            JWTSecret: mockJWTSecret,
          })
      ).toThrow(TypeError);
      expect(
        () =>
          new AddrAuth({ verifySignature: mockVerifySignature, JWTSecret: 123 })
      ).toThrow(TypeError);
    });
  });

  describe("generateChallenge", () => {
    it("should generate a challenge and JWT", () => {
      crypto.randomBytes.mockReturnValue(Buffer.from("random"));
      jwt.sign.mockReturnValue("mocked-jwt");
      const result = addrAuth.generateChallenge("test-address");
      expect(result).toHaveProperty("challenge");
      expect(result).toHaveProperty("JWT", "mocked-jwt");
    });

    it("should throw TypeError for invalid address", () => {
      expect(() => addrAuth.generateChallenge(123)).toThrow(TypeError);
    });
  });

  describe("verifyChallenge", () => {
    beforeEach(() => {
      jwt.verify.mockReturnValue({
        challenge: "test-challenge",
        address: "test-address",
      });
      mockVerifySignature.mockReturnValue(true);
      jwt.sign.mockReturnValue("new-jwt");
    });

    it("should verify challenge and return new JWT", () => {
      const result = addrAuth.verifyChallenge(
        "token",
        "signature",
        "publicKey",
        "address",
        { test: "payload" }
      );
      expect(result).toEqual({ JWT: "new-jwt", address: "test-address" });
    });

    it("should throw error for invalid signature", () => {
      mockVerifySignature.mockReturnValue(false);
      expect(() =>
        addrAuth.verifyChallenge("token", "signature", "publicKey", "address")
      ).toThrow("Invalid signature");
    });

    it("should throw TypeError for invalid parameters", () => {
      expect(() =>
        addrAuth.verifyChallenge(123, "signature", "publicKey", "address")
      ).toThrow(TypeError);
      expect(() =>
        addrAuth.verifyChallenge("token", 123, "publicKey", "address")
      ).toThrow(TypeError);
      expect(() =>
        addrAuth.verifyChallenge("token", "signature", 123, "address")
      ).toThrow(TypeError);
      expect(() =>
        addrAuth.verifyChallenge("token", "signature", "publicKey", 123)
      ).toThrow(TypeError);
      expect(() =>
        addrAuth.verifyChallenge(
          "token",
          "signature",
          "publicKey",
          "address",
          123
        )
      ).toThrow(TypeError);
    });
  });

  describe("verifyJWT", () => {
    it("should verify JWT and return decoded payload", () => {
      const mockPayload = { address: "test-address" };
      jwt.verify.mockReturnValue(mockPayload);
      const result = addrAuth.verifyJWT("token");
      expect(result).toEqual(mockPayload);
    });

    it("should throw error for invalid token", () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error("Invalid token");
        error.name = "JsonWebTokenError";
        throw error;
      });
      expect(() => addrAuth.verifyJWT("invalid-token")).toThrow(
        "Invalid token"
      );
    });

    it("should throw TypeError for invalid token type", () => {
      expect(() => addrAuth.verifyJWT(123)).toThrow(TypeError);
    });

    it("should throw error for expired token", () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error("Token expired");
        error.name = "TokenExpiredError";
        throw error;
      });
      expect(() => addrAuth.verifyJWT("expired-token")).toThrow(
        "Token expired"
      );
    });

    it("should throw the original error for unexpected errors", () => {
      const unexpectedError = new Error("Unexpected error");
      jwt.verify.mockImplementation(() => {
        throw unexpectedError;
      });
      expect(() => addrAuth.verifyJWT("token")).toThrow(unexpectedError);
    });
  });

  describe("_signJWT", () => {
    it("should sign JWT with correct parameters", () => {
      addrAuth._signJWT({ test: "payload" }, "1h");
      expect(jwt.sign).toHaveBeenCalledWith(
        { test: "payload" },
        mockJWTSecret,
        { expiresIn: "1h" }
      );
    });

    it("should throw TypeError for invalid parameters", () => {
      expect(() => addrAuth._signJWT("not an object", "1h")).toThrow(TypeError);
      expect(() => addrAuth._signJWT({ test: "payload" }, 123)).toThrow(
        TypeError
      );
    });
  });
});
