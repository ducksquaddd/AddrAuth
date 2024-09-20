import AddrAuth from "../dist/index.esm.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const addrAuth = new AddrAuth({
  VerifySig: async (address, signature, publicKey) => {
    return true;
  },
  JWTSecret: "secret",
});

let challenge = addrAuth.generateChallenge("0x1234567890");

console.log(challenge);
