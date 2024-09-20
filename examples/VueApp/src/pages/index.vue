<template>
  <div>
    <h1>Connect Wallet (AddrAuth Example)</h1>
    <!-- Show connect button if not connected, otherwise show success message -->
    <button v-if="!isConnected" @click="connectWallet">Connect Wallet</button>
    <div v-else>
      <h2>Wallet Connected Successfully!</h2>
      <p>You can now access the protected route.</p>
      <button @click="goToProtectedRoute">Go to Protected Route</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

// Define chain ID as a variable
const chainId = ref("cosmoshub-4");

// Track connection status
const isConnected = ref(false);

async function connectWallet() {
  console.log("Connecting Wallet");

  // Check if Keplr is installed
  if (!window.keplr) {
    alert("Please install Keplr extension");
    return;
  }

  try {
    // Enable Keplr for the specified chain
    await window.keplr.enable(chainId.value);
    await generateAndSignChallenge();
    isConnected.value = true;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet. Please try again.");
  }
}

// Function to generate and sign challenge
async function generateAndSignChallenge() {
  try {
    // Get the user's key from Keplr
    const key = await window.keplr.getKey(chainId.value);
    console.log("User address:", key.bech32Address);

    // Generate challenge from server
    const challengeRes = await fetch("http://localhost:3000/addrauth/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: key.bech32Address }),
    });
    const challenge = await challengeRes.json();

    // Sign the challenge using Keplr
    const signature = await window.keplr.signArbitrary(
      chainId.value,
      key.bech32Address,
      challenge.challenge
    );

    // Verify the signature with the server
    const verifyRes = await fetch(
      "http://localhost:3000/addrauth/verifyChallenge",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: challenge.JWT,
          signature: signature.signature,
          publicKey: btoa(String.fromCharCode.apply(null, key.pubKey)),
          address: key.bech32Address,
        }),
      }
    );
    const verifyResult = await verifyRes.json();

    // Store the address and JWT in local storage
    localStorage.setItem("AddrAuthJWT", verifyResult.JWT);
    localStorage.setItem("AddrAuthAddress", verifyResult.address);
  } catch (error) {
    console.error("Error in generate and sign challenge:", error);
    throw error; // Rethrow the error to be caught in the calling function
  }
}

// Function to navigate to the protected route
function goToProtectedRoute() {
  router.push("/protected"); // Adjust this path to match your route configuration
}
</script>
