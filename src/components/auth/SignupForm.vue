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
      <span class="font-semibold text-gray-500 dark:text-gray-400">
        {{ ui.loginComingSoon }}
      </span>
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getClientTranslations, onLocaleChange } from "@util/clientTranslations";

interface SignupForm {
  username: string;
  displayName: string;
  email: string;
  country: string;
  city: string;
  whatsappCountryCode: string;
  whatsappLocalNumber: string;
  bio: string;
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
  agreeToTerms: false,
});

const isLoading = ref(false);
const error = ref("");
const success = ref(false);
const usernameError = ref("");
const usernameWarning = ref("");

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

  // Check availability on server
  try {
    const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
    if (!response.ok) {
      usernameError.value = "";
      usernameWarning.value = ui.value.usernameCheckFailed;
      return;
    }
    const data = await response.json();

    if (data.available === false) {
      usernameError.value = ui.value.usernameTaken;
      usernameWarning.value = "";
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

    const username = form.value.username.trim().toLowerCase();
    const countryCode = form.value.whatsappCountryCode.replace(/\D/g, "");
    const localNumber = form.value.whatsappLocalNumber.replace(/\D/g, "");
    const whatsappNumber = `${countryCode}${localNumber}`;

    // Submit signup
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form.value,
        username,
        whatsappNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "فشل إنشاء المتجر");
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
