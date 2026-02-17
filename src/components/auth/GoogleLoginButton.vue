<template>
  <button
    type="button"
    @click="handleGoogleLogin"
    :disabled="isLoading"
    class="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
  >
    <svg v-if="!isLoading" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"
        fill="currentColor"
      />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="8" fill="white" font-weight="bold">
        G
      </text>
    </svg>
    <span v-if="!isLoading">{{ label || 'Sign in with Google' }}</span>
    <span v-else class="inline-flex items-center gap-2">
      <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-200"></span>
      {{ loadingLabel || 'Signing in...' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  label?: string;
  loadingLabel?: string;
}

defineProps<Props>();

const isLoading = ref(false);

const handleGoogleLogin = () => {
  isLoading.value = true;

  // Generate the redirect URI
  const protocol = window.location.protocol;
  const host = window.location.host;
  const redirectUri = `${protocol}//${host}/api/auth/google/callback`;

  // Fetch the Google auth URL from the server
  const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const apiUrl = `${apiBase}/api/auth/google/url`;

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ redirectUri }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        console.error("Failed to get Google auth URL");
        isLoading.value = false;
      }
    })
    .catch((error) => {
      console.error("Error initiating Google login:", error);
      isLoading.value = false;
    });
};
</script>
