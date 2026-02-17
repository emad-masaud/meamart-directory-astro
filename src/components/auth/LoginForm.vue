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
      <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.passwordLabel || 'Password' }}
      </label>
      <input
        id="login-password"
        name="password"
        v-model="form.password"
        type="password"
        :placeholder="ui.passwordPlaceholder || 'Enter your password'"
        required
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
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
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { getClientTranslations, onLocaleChange } from "@util/clientTranslations";

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
