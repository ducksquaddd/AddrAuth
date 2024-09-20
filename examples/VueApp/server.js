import express from "express";
import addrauth from "./dist/index.esm.js";
import cors from "cors";
import jwt from "jsonwebtoken";

// Initialize AddrAuth with CosmJS signature verification
const AddrAuth = new addrauth({
  verifySignature: async (challenge, signature, publicKey) => {
    console.log("Verifying signature using CosmJS...");
    try {
      // Convert the public key to a Secp256k1Pubkey object
      const pubkey = new Secp256k1Pubkey(Buffer.from(publicKey, "base64"));

      // Verify the signature
      const result = verifyADR36Amino(
        "cosmos", // Replace with your chain's bech32 prefix
        challenge.address,
        challenge.challenge,
        pubkey,
        Buffer.from(signature.signature, "base64")
      );

      return result;
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  },
  JWTSecret: "your_secret_here", // In a real app, use an environment variable for this
});

const app = express();

// Set up middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    methods: ["GET", "POST"], // Allow only GET and POST requests
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);
app.use(express.json()); // Parse JSON request bodies

// Route to generate a challenge
app.post("/addrauth/create", (req, res) => {
  const { address } = req.body;
  // Generate a challenge for the given address
  let challenge = AddrAuth.generateChallenge(address);
  res.json(challenge);
});

// Route to verify a challenge
app.post("/addrauth/verifyChallenge", (req, res) => {
  const { token, signature, publicKey } = req.body;
  try {
    console.log(token, signature, publicKey);
    // Verify the challenge and get a JWT if successful
    let { JWT, address } = AddrAuth.verifyChallenge(
      token,
      signature,
      publicKey
    );
    res.json({ JWT, address });
  } catch (error) {
    handleError(res, error);
  }
});

// Route to verify a JWT
app.post("/addrauth/verifyJWT", (req, res) => {
  const { jwt } = req.body;
  try {
    // Verify the JWT
    let verified = AddrAuth.verifyJWT(jwt);
    if (!verified) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true });
  } catch (error) {
    handleError(res, error);
  }
});

// Helper function to handle errors
function handleError(res, error) {
  console.error(error);
  if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ error: "Invalid token" });
  } else if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ error: "Token expired" });
  }
  res.status(500).json({ error: "Internal Server Error" });
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
