<!-- You would probably want to add some middleware to handle auth against many routes -->

<template>
	<div v-if="isLoading">
		<h1>Loading...</h1>
	</div>
	<div v-else-if="canAccess">
		<h1>Protected Route</h1>
		<p>Welcome! You have access to this protected content.</p>
		<!-- Add your protected content here -->
	</div>
	<div v-else>
		<h1>Access Denied</h1>
		<p>You do not have permission to view this page.</p>
		<button @click="redirectToLogin">Go to Login</button>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const canAccess = ref(false);
const isLoading = ref(true);

onMounted(async () => {
	await checkAccess();
});

async function checkAccess() {
	const JWT = localStorage.getItem('AddrAuthJWT');

	if (!JWT) {
		isLoading.value = false;
		canAccess.value = false;
		return;
	}

	try {
		const verificationRequest = await fetch('http://localhost:3000/addrauth/verifyJWT', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ jwt: JWT }),
		});

		if (!verificationRequest.ok) {
			throw new Error('Verification request failed');
		}

		const verificationResult = await verificationRequest.json();
		canAccess.value = verificationResult.valid;
	} catch (error) {
		console.error('Verification error:', error);
		canAccess.value = false;
	} finally {
		isLoading.value = false;
	}
}

function redirectToLogin() {
	router.push('/');
}
</script>
