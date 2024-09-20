import jwt from "jsonwebtoken";
import crypto from "crypto";

class AddrAuth {
  /**
   * Constructor for AddrAuth class
   * @param {Object} config - Configuration object
   * @param {Function} config.verifySignature - Function to verify signature
   * @param {string} config.JWTSecret - Secret key for JWT
   * @param {string} [config.challengeExpiresIn="10m"] - Expiration time for challenge JWT
   * @param {string} [config.JWTExpiresIn="100d"] - Expiration time for authentication JWT
   */
  constructor({
    verifySignature,
    JWTSecret,
    challengeExpiresIn = "10m",
    JWTExpiresIn = "100d",
  }) {
    if (typeof verifySignature !== "function") {
      throw new TypeError("verifySignature must be a function");
    }
    if (typeof JWTSecret !== "string") {
      throw new TypeError("JWTSecret must be a string");
    }
    if (typeof challengeExpiresIn !== "string") {
      throw new TypeError("challengeExpiresIn must be a string");
    }
    if (typeof JWTExpiresIn !== "string") {
      throw new TypeError("JWTExpiresIn must be a string");
    }

    this.verifySignature = verifySignature;
    this.JWTSecret = JWTSecret;
    this.challengeExpiresIn = challengeExpiresIn;
    this.JWTExpiresIn = JWTExpiresIn;
  }

  /**
   * Generates a challenge for a given address
   * @param {string} address - The address to generate a challenge for
   * @returns {Object} An object containing the challenge and a JWT
   */
  generateChallenge(address) {
    if (typeof address !== "string") {
      throw new TypeError("address must be a string");
    }

    const challenge = this._createChallengeString();
    const JWT = this._signJWT({ address, challenge }, this.challengeExpiresIn);
    return { challenge, JWT };
  }

  /**
   * Verifies a challenge signature and issues a new JWT if valid
   * @param {string} token - The challenge JWT
   * @param {string} signature - The signature to verify
   * @param {string} publicKey - The public key to use for verification
   * @param {string} address - The address to verify
   * @param {object} [included={}] - Additional data to include in the JWT
   * @returns {Object} An object containing a new JWT and the address
   */
  verifyChallenge(token, signature, publicKey, address, included = {}) {
    if (typeof token !== "string")
      throw new TypeError("token must be a string");
    if (typeof signature !== "string")
      throw new TypeError("signature must be a string");
    if (typeof publicKey !== "string")
      throw new TypeError("publicKey must be a string");
    if (typeof address !== "string")
      throw new TypeError("address must be a string");
    if (typeof options !== "object")
      throw new TypeError("included must be an object");

    try {
      const decoded = jwt.verify(token, this.JWTSecret);
      const isValid = this.verifySignature(
        decoded.challenge,
        signature,
        publicKey,
        address
      );

      if (!isValid) {
        throw new Error("Invalid signature");
      }

      const JWT = this._signJWT(
        {
          address: decoded.address,
          challengeThatWasPresented: decoded.challenge,
          signedChallenge: signature,
          included: {
            ...included,
          },
        },
        this.JWTExpiresIn
      );

      return { JWT, address: decoded.address };
    } catch (error) {
      this._handleJWTError(error);
    }
  }

  /**
   * Verifies a JWT
   * @param {string} token - The JWT to verify
   * @returns {Object} The decoded JWT payload if valid
   */
  verifyJWT(token) {
    if (typeof token !== "string") {
      throw new TypeError("token must be a string");
    }

    try {
      return jwt.verify(token, this.JWTSecret);
    } catch (error) {
      this._handleJWTError(error);
    }
  }

  /**
   * Creates a challenge string
   * @private
   * @returns {string} A unique challenge string
   */
  _createChallengeString() {
    const randomChallenge = crypto.randomBytes(32).toString("hex");
    return `${randomChallenge}\n\nThis is a unique challenge to verify that you own this wallet\nIf this is being sent to you do NOT sign it`;
  }

  /**
   * Signs a JWT
   * @private
   * @param {Object} payload - The payload to include in the JWT
   * @param {string} expiresIn - The expiration time for the JWT
   * @returns {string} A signed JWT
   */
  _signJWT(payload, expiresIn) {
    if (typeof payload !== "object")
      throw new TypeError("payload must be an object");
    if (typeof expiresIn !== "string")
      throw new TypeError("expiresIn must be a string");

    return jwt.sign(payload, this.JWTSecret, { expiresIn });
  }

  /**
   * Handles JWT errors
   * @private
   * @param {Error} error - The error to handle
   * @throws {Error} A more specific error based on the type of JWT error
   */
  _handleJWTError(error) {
    if (!(error instanceof Error)) {
      throw new TypeError("error must be an instance of Error");
    }

    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else {
      throw error;
    }
  }
}

export default AddrAuth;
