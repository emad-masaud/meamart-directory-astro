<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <!-- Username -->
    <div>
      <label for="login-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.usernameLabel || 'Username' }}
      </label>
      <div class="mt-1 flex items-center gap-2">
        <span class="text-gray-600 dark:text-gray-400">@</span>
        <input
          id="login-username"
          name="username"
          v-model="form.username"
          type="text"
          :placeholder="ui.usernamePlaceholder || 'your-username'"
          required
          pattern="[a-z0-9_\-]+"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- Password -->
    <div>
      <div class="flex items-center justify-between">
        <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ ui.passwordLabel || 'Password' }}
        </label>
        <a href="/forgot-password" class="text-xs text-blue-600 hover:underline dark:text-blue-400">
          {{ ui.forgotPassword || 'Forgot password?' }}
        </a>
      </div>
      <div class="relative mt-1">
        <input
          id="login-password"
          name="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="ui.passwordPlaceholder || 'Enter your password'"
          required
          class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div
      v-if="success"
      class="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
    >
      {{ ui.loginSuccess || 'Login successful! Redirecting...' }}
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
    >
      <span v-if="!isLoading">{{ ui.loginButton || 'Login' }}</span>
      <span v-else class="inline-flex items-center gap-2">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        {{ ui.loginLoading || 'Logging in...' }}
      </span>
    </button>

    <!-- Signup Link -->
    <p class="text-center text-sm text-gray-600 dark:text-gray-400">
      {{ ui.signupPrompt || "Don't have an account?" }}
      <a href="/signup" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">
        {{ ui.signupLink || 'Sign up' }}
      </a>
    </p>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          {{ ui.orContinueWith || 'Or continue with' }}
        </span>
      </div>
    </div>

    <!-- Social Login -->
    <div class="grid grid-cols-1 gap-3">
      <GoogleLoginButton
        :label="ui.signInWithGoogle || 'Sign in with Google'"
        :loadingLabel="ui.signingIn || 'Signing in...'"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { getClientTranslations, onLocaleChange } from "@util/clientTranslations";
import GoogleLoginButton from "./GoogleLoginButton.vue";

interface LoginForm {
  username: string;
  password: string;
}

const form = ref<LoginForm>({
  username: "",
  password: "",
});

const isLoading = ref(false);
const error = ref("");
const success = ref(false);
const showPassword = ref(false);

const translations = ref(getClientTranslations());
const t = computed(() => translations.value.t);
const ui = computed(() => t.value.login || {});

onLocaleChange(() => {
  translations.value = getClientTranslations();
});

const handleLogin = async () => {
  error.value = "";
  success.value = false;
  isLoading.value = true;

  try {
    const username = form.value.username.trim().toLowerCase();
    const password = form.value.password;

    if (!username || !password) {
      throw new Error(ui.value.errorRequired || "Username and password are required");
    }

    const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const apiUrl = (path: string) => `${apiBase}${path}`;

    const response = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(ui.value.errorGeneric || "Server error. Please try again later.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || ui.value.errorInvalid || "Invalid username or password");
    }

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem("meamart_token", data.token);
      localStorage.setItem("meamart_username", data.username);
      localStorage.setItem("meamart_displayName", data.displayName);
    }

    success.value = true;

    // Redirect to profile after 1 second
    setTimeout(() => {
      window.location.href = `/@${data.username}`;
    }, 1000);
  } catch (err: any) {
    error.value = err.message || ui.value.errorGeneric || "Login failed";
  } finally {
    isLoading.value = false;
  }
};
</script>
