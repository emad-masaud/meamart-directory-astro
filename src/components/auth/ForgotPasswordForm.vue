<template>
  <form @submit.prevent="handleForgotPassword" class="space-y-4">
    <!-- Email Input or Verification Code -->
    <div v-if="!verificationSent">
      <label for="forgot-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.emailLabel || 'Email Address' }}
      </label>
      <input
        id="forgot-email"
        name="email"
        v-model="form.email"
        type="email"
        :placeholder="ui.emailPlaceholder || 'your@email.com'"
        required
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ ui.resetEmailHelp || 'We will send a verification code to your email' }}
      </p>
    </div>

    <!-- Verification Code Input -->
    <div v-else-if="!passwordReset">
      <div class="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200 mb-4">
        {{ ui.codeEmailSent || 'Verification code sent to' }} {{ maskEmail(form.email) }}
      </div>
      <label for="reset-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.codeLabel || 'Verification Code' }}
      </label>
      <input
        id="reset-code"
        name="code"
        v-model="form.code"
        type="text"
        :placeholder="ui.codePlaceholder || '000000'"
        required
        maxlength="6"
        pattern="[0-9]{6}"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-center text-sm tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ ui.codeHelp || 'Check your email for the 6-digit code' }}
      </p>
      <button
        type="button"
        @click="resendCode"
        :disabled="resendCountdown > 0"
        class="mt-2 text-xs text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
      >
        {{ resendCountdown > 0 ? `${ui.resendIn || 'Resend in'} ${resendCountdown}s` : ui.resendCode || 'Resend code' }}
      </button>
    </div>

    <!-- New Password Input -->
    <div v-else>
      <label for="reset-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.newPasswordLabel || 'New Password' }}
      </label>
      <div class="relative mt-1">
        <input
          id="reset-password"
          name="password"
          v-model="form.newPassword"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="ui.passwordPlaceholder || 'Enter new password'"
          required
          minlength="8"
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
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ ui.passwordHelp || 'At least 8 characters' }}
      </p>

      <label for="reset-password-confirm" class="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.confirmPasswordLabel || 'Confirm Password' }}
      </label>
      <div class="relative mt-1">
        <input
          id="reset-password-confirm"
          name="passwordConfirm"
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          :placeholder="ui.confirmPasswordPlaceholder || 'Re-enter password'"
          required
          class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg v-if="showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
      <p v-if="passwordMismatch" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ ui.passwordMismatch || 'Passwords do not match' }}
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div v-if="success && passwordReset" class="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
      {{ ui.resetSuccess || 'Password reset successfully! Redirecting to login...' }}
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
    >
      <span v-if="!isLoading">
        {{ !verificationSent ? ui.sendCode || 'Send Code' : !passwordReset ? ui.verifyCode || 'Verify Code' : ui.resetPassword || 'Reset Password' }}
      </span>
      <span v-else class="inline-flex items-center gap-2">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        {{ ui.loading || 'Processing...' }}
      </span>
    </button>

    <!-- Back to Login -->
    <p class="text-center text-sm text-gray-600 dark:text-gray-400">
      <a href="/login" class="text-blue-600 hover:underline dark:text-blue-400">
        {{ ui.backToLogin || 'Back to login' }}
      </a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { getClientTranslations, onLocaleChange } from "@util/clientTranslations";

interface ForgotPasswordForm {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const form = ref<ForgotPasswordForm>({
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
});

const isLoading = ref(false);
const error = ref("");
const success = ref(false);
const verificationSent = ref(false);
const passwordReset = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const resendCountdown = ref(0);

let countdownInterval: NodeJS.Timeout | null = null;

const translations = ref(getClientTranslations());
const t = computed(() => translations.value.t);
const ui = computed(() => t.value.forgotPassword || {});

onLocaleChange(() => {
  translations.value = getClientTranslations();
});

const passwordMismatch = computed(() => {
  if (!form.value.newPassword || !form.value.confirmPassword) return false;
  return form.value.newPassword !== form.value.confirmPassword;
});

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  return `${localPart.substring(0, 2)}***@${domain}`;
};

const startResendCountdown = () => {
  resendCountdown.value = 60;
  countdownInterval = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      clearInterval(countdownInterval!);
      countdownInterval = null;
    }
  }, 1000);
};

const resendCode = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const apiUrl = (path: string) => `${apiBase}${path}`;

    const response = await fetch(apiUrl("/api/auth/forgot-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.value.email,
        resend: true,
      }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(ui.value.errorGeneric || "Server error. Please try again later.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || ui.value.errorGeneric || "Failed to resend code");
    }

    startResendCountdown();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = async () => {
  error.value = "";
  isLoading.value = true;

  try {
    const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const apiUrl = (path: string) => `${apiBase}${path}`;

    if (!verificationSent.value) {
      // Step 1: Request password reset code
      const email = form.value.email.trim().toLowerCase();

      if (!email) {
        throw new Error(ui.value.errorEmailRequired || "Email is required");
      }

      const response = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(ui.value.errorGeneric || "Server error. Please try again later.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || ui.value.errorUserNotFound || "User not found");
      }

      verificationSent.value = true;
      startResendCountdown();
    } else if (!passwordReset.value) {
      // Step 2: Verify code
      const code = form.value.code.trim();

      if (!code || code.length !== 6) {
        throw new Error(ui.value.errorInvalidCode || "Invalid verification code");
      }

      const response = await fetch(apiUrl("/api/auth/verify-reset-code"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.value.email,
          code: code,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(ui.value.errorGeneric || "Server error. Please try again later.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || ui.value.errorInvalidCode || "Invalid or expired code");
      }

      passwordReset.value = true;
    } else {
      // Step 3: Set new password
      if (passwordMismatch.value) {
        throw new Error(ui.value.errorPasswordMismatch || "Passwords do not match");
      }

      const newPassword = form.value.newPassword;

      if (!newPassword || newPassword.length < 8) {
        throw new Error(ui.value.errorPasswordLength || "Password must be at least 8 characters");
      }

      const response = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.value.email,
          code: form.value.code,
          newPassword: newPassword,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(ui.value.errorGeneric || "Server error. Please try again later.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || ui.value.errorGeneric || "Failed to reset password");
      }

      success.value = true;
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
};

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>
