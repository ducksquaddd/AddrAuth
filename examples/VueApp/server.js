import express from "express";
import addrauth from "addrauth";
import cors from "cors";
import jwt from "jsonwebtoken";
import Cosmos from "@keplr-wallet/cosmos";

// Initialize AddrAuth with a mock signature verification function
// In a real application, replace this with actual signature verification logic

// Initialize AddrAuth with Cosmos signature verification
const AddrAuth = new addrauth({
  verifySignature: async (challenge, signature, publicKey, address) => {
    const msg = Buffer.from(challenge).toString();

    const prefix = "cosmos"; // change prefix for other chains...

    // Convert the base64 encoded signature to a Uint8Array
    const signatureBuffer = Buffer.from(signature, "base64");
    const uint8Signature = new Uint8Array(signatureBuffer);

    // Convert the base64 encoded public key to a Uint8Array
    const pubKeyValueBuffer = Buffer.from(publicKey, "base64");
    const pubKeyUint8Array = new Uint8Array(pubKeyValueBuffer);

    const isValid = Cosmos.verifyADR36Amino(
      prefix,
      address,
      msg,
      pubKeyUint8Array,
      uint8Signature
    );

    return isValid;
  },
  JWTSecret: process.env.JWT_SECRET || "your_secret_here", // Use environment variable for JWT secret
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
  const { token, signature, publicKey, address } = req.body;
  try {
    // Verify the challenge and get a JWT if successful
    let data = AddrAuth.verifyChallenge(token, signature, publicKey, address);
    res.json(data);
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
