# AddrAuth (Address Authentication)

## Overview

AddrAuth is a lightweight, flexible authentication package designed for blockchain applications. It provides a secure and efficient way to verify wallet ownership across multiple chains and wallet types, enabling easy implementation of gated access in "decentralized" applications.

## Features

- **Multi-chain support**: Compatible with various blockchain networks
- **Wallet adapters**: Works seamlessly with multiple wallet types (Not yet implemented, but coming soon!)
- **Challenge-response authentication**: Ensures secure verification of wallet ownership
- **JWT integration**: Provides persistent authentication sessions
- **Open-source**: Easily customizable and extendable

## How It Works

AddrAuth implements a simple yet powerful authentication flow:

1. **Challenge Generation**: The server creates a unique challenge for the client.
2. **Signature Request**: The client signs the challenge using their wallet.
3. **Verification**: The server verifies the signature to authenticate the user.
4. **JWT Issuance**: Upon successful verification, a JWT is issued for persistent authentication.

## Installation

Install AddrAuth using npm or yarn:

```bash
npm install addrauth
# or
yarn add addrauth
```

## Usage

Here's a basic example of how to use AddrAuth:

```javascript
import AddrAuth from "addrauth";

// Initialize AddrAuth
const addrAuth = new AddrAuth({
  verifySignature: yourSignatureVerificationFunction, // Adapter helpers are still in development
  JWTSecret: "your-secret-key",
  challengeExpiresIn: "10m", // How long the challenge is valid for, default is 10 minutes
  JWTExpiresIn: "100d", // After the user has authenticated, how long the persistent JWT is valid for, default is 100 days
});

// Generate a challenge (Returns challenge and JWT)
// Address should be sent from the client to the server
const { challenge, JWT } = addrAuth.generateChallenge(userAddress);

// Verify a challenge (Returns persistent JWT and address)
const { JWT: authToken, address } = addrAuth.verifyChallenge(
  JWT,
  signature,
  publicKey,
  address,
  included // included is an optional object that can be used to store additional data in the JWT
);

// Verify a JWT (Returns JWT payload if valid)
const payload = addrAuth.verifyJWT(authToken);
```

For more detailed examples, including server-side implementation and frontend integration, please refer to the [examples](https://github.com/ducksquaddd/AddrAuth/tree/main/examples/) folder in the repository.

## API Reference

### `AddrAuth` Class

#### Constructor

```javascript
new AddrAuth({
  verifySignature: Function,
  JWTSecret: string,
  challengeExpiresIn?: string,
  JWTExpiresIn?: string
})
```

#### Methods

- `generateChallenge(address: string): { challenge: string, JWT: string }`
- `verifyChallenge(token: string, signature: string, publicKey: string, address: string, included?: Object): { JWT: string, address: string }`
- `verifyJWT(token: string): Object`

## Contributing

Contributions to AddrAuth are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with clear, descriptive messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

## License

AddrAuth is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/ducksquaddd/AddrAuth/issues) on GitHub.
