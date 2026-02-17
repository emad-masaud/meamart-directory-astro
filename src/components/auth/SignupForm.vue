<template>
  <form @submit.prevent="handleSignup" class="space-y-4">
    <!-- Username -->
    <div>
      <label for="signup-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.usernameLabel }}
      </label>
      <div class="mt-1 flex items-center gap-2">
        <span class="text-gray-600 dark:text-gray-400">@</span>
        <input
          id="signup-username"
          name="username"
          v-model="form.username"
          type="text"
          :placeholder="ui.usernamePlaceholder"
          required
          pattern="[a-z0-9_\-]+"
          :title="ui.usernameInvalid"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <p v-if="usernameError" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ usernameError }}
      </p>
      <p v-else-if="usernameWarning" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
        {{ usernameWarning }}
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ formatString(ui.usernameHelp, form.username || "—") }}
      </p>
    </div>

    <!-- Display Name -->
    <div>
      <label for="signup-display-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.displayNameLabel }}
      </label>
      <input
        id="signup-display-name"
        name="displayName"
        v-model="form.displayName"
        type="text"
        :placeholder="ui.displayNamePlaceholder"
        required
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>

    <!-- Email -->
    <div>
      <label for="signup-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.emailLabel }}
      </label>
      <input
        id="signup-email"
        name="email"
        v-model="form.email"
        type="email"
        :placeholder="ui.emailPlaceholder"
        required
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ ui.emailHelp }}
      </p>
    </div>

    <!-- Country -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="signup-country" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ ui.countryLabel }}
        </label>
        <select
          id="signup-country"
          name="country"
          v-model="form.country"
          required
          class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">{{ ui.countryPlaceholder }}</option>
          <option v-for="country in countryOptions" :key="country.code" :value="country.code">
            {{ country.label }}
          </option>
        </select>
      </div>

      <!-- City -->
      <div>
        <label for="signup-city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ ui.cityLabel }}
        </label>
        <input
          id="signup-city"
          name="city"
          v-model="form.city"
          type="text"
          :placeholder="ui.cityPlaceholder"
          class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- WhatsApp Number -->
    <div>
      <label for="signup-whatsapp" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.whatsappLabel }}
      </label>
      <div class="mt-1 grid grid-cols-[140px_1fr] gap-2">
        <div>
          <label for="signup-whatsapp-code" class="sr-only">{{ ui.whatsappCodeLabel }}</label>
          <select
            id="signup-whatsapp-code"
            name="whatsappCountryCode"
            v-model="form.whatsappCountryCode"
            required
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option v-for="country in countryOptions" :key="country.code" :value="country.dial">
              +{{ country.dial }} ({{ country.label }})
            </option>
          </select>
        </div>
        <div>
          <label for="signup-whatsapp" class="sr-only">{{ ui.whatsappLabel }}</label>
          <input
            id="signup-whatsapp"
            name="whatsappLocalNumber"
            v-model="form.whatsappLocalNumber"
            type="tel"
            :placeholder="ui.whatsappPlaceholder"
            required
            pattern="[0-9]{6,12}"
            :title="ui.whatsappInvalid"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ ui.whatsappHelp }}
      </p>
    </div>

    <!-- Bio -->
    <div>
      <label for="signup-bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.bioLabel }}
      </label>
      <textarea
        id="signup-bio"
        name="bio"
        v-model="form.bio"
        :placeholder="ui.bioPlaceholder"
        rows="3"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      ></textarea>
    </div>

    <!-- Password -->
    <div>
      <label for="signup-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.passwordLabel || 'Password' }}
      </label>
      <div class="relative mt-1">
        <input
          id="signup-password"
          name="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="ui.passwordPlaceholder || 'Enter your password'"
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
    </div>

    <!-- Confirm Password -->
    <div>
      <label for="signup-password-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ ui.passwordConfirmLabel || 'Confirm Password' }}
      </label>
      <div class="relative mt-1">
        <input
          id="signup-password-confirm"
          name="passwordConfirm"
          v-model="form.passwordConfirm"
          :type="showConfirmPassword ? 'text' : 'password'"
          :placeholder="ui.passwordConfirmPlaceholder || 'Re-enter your password'"
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

    <!-- Terms Agreement -->
    <div class="flex items-start gap-2">
      <input
        id="terms"
        name="agreeToTerms"
        v-model="form.agreeToTerms"
        type="checkbox"
        required
        class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label for="terms" class="text-xs text-gray-600 dark:text-gray-400">
        {{ ui.termsPrefix }}
        <a href="/terms" class="text-blue-600 hover:underline dark:text-blue-400">
          {{ ui.termsService }}
        </a>
        {{ ui.termsAnd }}
        <a href="/privacy" class="text-blue-600 hover:underline dark:text-blue-400">
          {{ ui.termsPrivacy }}
        </a>
      </label>
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
      {{ ui.successMessage }}
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading || !form.agreeToTerms"
      class="w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
    >
      <span v-if="!isLoading">{{ ui.submitLabel }}</span>
      <span v-else class="inline-flex items-center gap-2">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        {{ ui.submitLoading }}
      </span>
    </button>

    <!-- Login Link -->
    <p class="text-center text-sm text-gray-600 dark:text-gray-400">
      {{ ui.loginPrompt }}
      <a href="/login" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">
        {{ ui.loginLink || 'Log in' }}
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
        :label="ui.signInWithGoogle || 'Sign up with Google'"
        :loadingLabel="ui.signingUp || 'Signing up...'"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getClientTranslations, onLocaleChange } from "@util/clientTranslations";
import GoogleLoginButton from "./GoogleLoginButton.vue";

interface SignupForm {
  username: string;
  displayName: string;
  email: string;
  country: string;
  city: string;
  whatsappCountryCode: string;
  whatsappLocalNumber: string;
  bio: string;
  password: string;
  passwordConfirm: string;
  agreeToTerms: boolean;
}

const form = ref<SignupForm>({
  username: "",
  displayName: "",
  email: "",
  country: "",
  city: "",
  whatsappCountryCode: "971",
  whatsappLocalNumber: "",
  bio: "",
  password: "",
  passwordConfirm: "",
  agreeToTerms: false,
});

const isLoading = ref(false);
const error = ref("");
const success = ref(false);
const usernameError = ref("");
const usernameWarning = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordMismatch = computed(() => {
  if (!form.value.password || !form.value.passwordConfirm) return false;
  return form.value.password !== form.value.passwordConfirm;
});

const translations = ref(getClientTranslations());
const t = computed(() => translations.value.t);
const formatString = translations.value.formatString;
const ui = computed(() => t.value.signup);
const currentLocale = ref(translations.value.locale);

onLocaleChange(() => {
  const next = getClientTranslations();
  translations.value = next;
  currentLocale.value = next.locale;
});

const countryOptions = computed(() => {
  const isArabic = currentLocale.value === "ar";
  return [
    { code: "AE", dial: "971", label: isArabic ? "الإمارات" : "UAE" },
    { code: "SA", dial: "966", label: isArabic ? "السعودية" : "Saudi Arabia" },
    { code: "KW", dial: "965", label: isArabic ? "الكويت" : "Kuwait" },
    { code: "QA", dial: "974", label: isArabic ? "قطر" : "Qatar" },
    { code: "BH", dial: "973", label: isArabic ? "البحرين" : "Bahrain" },
    { code: "OM", dial: "968", label: isArabic ? "عُمان" : "Oman" },
    { code: "EG", dial: "20", label: isArabic ? "مصر" : "Egypt" },
    { code: "JO", dial: "962", label: isArabic ? "الأردن" : "Jordan" },
    { code: "LB", dial: "961", label: isArabic ? "لبنان" : "Lebanon" },
    { code: "IQ", dial: "964", label: isArabic ? "العراق" : "Iraq" },
    { code: "YE", dial: "967", label: isArabic ? "اليمن" : "Yemen" },
    { code: "MA", dial: "212", label: isArabic ? "المغرب" : "Morocco" },
    { code: "TN", dial: "216", label: isArabic ? "تونس" : "Tunisia" },
    { code: "DZ", dial: "213", label: isArabic ? "الجزائر" : "Algeria" },
    { code: "LY", dial: "218", label: isArabic ? "ليبيا" : "Libya" },
    { code: "SD", dial: "249", label: isArabic ? "السودان" : "Sudan" },
    { code: "US", dial: "1", label: isArabic ? "الولايات المتحدة" : "United States" },
    { code: "GB", dial: "44", label: isArabic ? "المملكة المتحدة" : "United Kingdom" },
  ];
});

const validateUsername = async (username: string) => {
  if (!username) {
    usernameError.value = "";
    usernameWarning.value = "";
    return;
  }

  const normalized = username.trim().toLowerCase();
  if (normalized !== username) {
    form.value.username = normalized;
  }

  // Check format
  if (!/^[a-z0-9_-]+$/.test(username)) {
    usernameError.value = ui.value.usernameInvalid;
    usernameWarning.value = "";
    return;
  }

  // Check length
  if (username.length < 3 || username.length > 20) {
    usernameError.value = ui.value.usernameLength;
    usernameWarning.value = "";
    return;
  }

  const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const apiUrl = (path: string) => `${apiBase}${path}`;

  // Check availability on server
  try {
    const response = await fetch(
      apiUrl(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
    );
    if (!response.ok) {
      usernameError.value = "";
      usernameWarning.value = ui.value.usernameCheckFailed;
      return;
    }
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      usernameError.value = "";
      usernameWarning.value = ui.value.usernameCheckFailed;
      return;
    }
    
    const data = await response.json();

    if (data.available === false) {
      if (data.reason === "taken") {
        usernameError.value = ui.value.usernameTaken;
        usernameWarning.value = "";
      } else {
        usernameError.value = "";
        usernameWarning.value = ui.value.usernameCheckFailed;
      }
    } else if (data.available === true) {
      usernameError.value = "";
      usernameWarning.value = "";
    }
  } catch (err) {
    console.error("Error checking username:", err);
    usernameError.value = "";
    usernameWarning.value = ui.value.usernameCheckFailed;
  }
};

const handleSignup = async () => {
  error.value = "";
  success.value = false;
  isLoading.value = true;

  try {
    // Validate username availability
    if (usernameError.value) {
      throw new Error(usernameError.value);
    }

    // Validate password match
    if (form.value.password !== form.value.passwordConfirm) {
      throw new Error(ui.value.passwordMismatch || "Passwords do not match");
    }

    if (form.value.password.length < 8) {
      throw new Error(ui.value.passwordTooShort || "Password must be at least 8 characters");
    }

    const username = form.value.username.trim().toLowerCase();
    const countryCode = form.value.whatsappCountryCode.replace(/\D/g, "");
    const localNumber = form.value.whatsappLocalNumber.replace(/\D/g, "");
    const whatsappNumber = `${countryCode}${localNumber}`;

    const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const apiUrl = (path: string) => `${apiBase}${path}`;

    // Submit signup
    const response = await fetch(apiUrl("/api/auth/signup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        displayName: form.value.displayName,
        email: form.value.email,
        country: form.value.country,
        city: form.value.city,
        whatsappNumber,
        bio: form.value.bio,
        password: form.value.password,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(ui.value.errorGeneric || "Server error. Please try again later.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "فشل إنشاء المتجر");
    }

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem("meamart_token", data.token);
      localStorage.setItem("meamart_username", username);
    }

    success.value = true;

    // Redirect to profile after 2 seconds
    setTimeout(() => {
      window.location.href = `/@${form.value.username}`;
    }, 2000);
  } catch (err: any) {
    error.value = err.message || ui.value.errorGeneric;
  } finally {
    isLoading.value = false;
  }
};

watch(() => form.value.country, (next) => {
  const match = countryOptions.value.find((country) => country.code === next);
  if (match) {
    form.value.whatsappCountryCode = match.dial;
  }
});

// Watch username changes
watch(() => form.value.username, validateUsername, { debounce: 500 });
</script>
