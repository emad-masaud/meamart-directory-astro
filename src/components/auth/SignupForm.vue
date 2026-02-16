<template>
  <form @submit.prevent="handleSignup" class="space-y-4">
    <!-- Username -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        اسم المستخدم
      </label>
      <div class="mt-1 flex items-center gap-2">
        <span class="text-gray-600 dark:text-gray-400">@</span>
        <input
          v-model="form.username"
          type="text"
          placeholder="username"
          required
          pattern="[a-z0-9_-]+"
          title="أحرف إنجليزية صغيرة وأرقام وشرطة فقط"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <p v-if="usernameError" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ usernameError }}
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        متجرك سيكون متاح على: meamart.com/@{{ form.username }}
      </p>
    </div>

    <!-- Display Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        اسم المتجر
      </label>
      <input
        v-model="form.displayName"
        type="text"
        placeholder="اسم متجرك أو شركتك"
        required
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>

    <!-- Email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        البريد الإلكتروني
      </label>
      <input
        v-model="form.email"
        type="email"
        placeholder="email@example.com"
        required
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        سنستخدمه فقط لإرسال رسائل مهمة حول متجرك
      </p>
    </div>

    <!-- Country -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          الدولة
        </label>
        <select
          v-model="form.country"
          required
          class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">اختر الدولة</option>
          <option value="AE">الإمارات العربية المتحدة</option>
          <option value="SA">المملكة العربية السعودية</option>
          <option value="KW">الكويت</option>
          <option value="QA">قطر</option>
          <option value="BH">البحرين</option>
          <option value="OM">عمان</option>
          <option value="EG">مصر</option>
          <option value="JO">الأردن</option>
          <option value="LB">لبنان</option>
          <option value="SY">سوريا</option>
          <option value="IQ">العراق</option>
          <option value="YE">اليمن</option>
          <option value="DZ">الجزائر</option>
          <option value="MA">المغرب</option>
          <option value="TN">تونس</option>
          <option value="LY">ليبيا</option>
          <option value="SD">السودان</option>
          <option value="PK">باكستان</option>
          <option value="IN">الهند</option>
          <option value="BD">بنغلاديش</option>
          <option value="MY">ماليزيا</option>
          <option value="SG">سنغافورة</option>
          <option value="US">الولايات المتحدة</option>
          <option value="GB">المملكة المتحدة</option>
          <option value="DE">ألمانيا</option>
          <option value="FR">فرنسا</option>
        </select>
      </div>

      <!-- City -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          المدينة
        </label>
        <input
          v-model="form.city"
          type="text"
          placeholder="دبي، الرياض، إلخ"
          class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- WhatsApp Number -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        رقم WhatsApp
      </label>
      <div class="mt-1 flex items-center gap-2">
        <span class="text-gray-600 dark:text-gray-400">+</span>
        <input
          v-model="form.whatsappNumber"
          type="tel"
          placeholder="971501234567"
          required
          pattern="[0-9]{10,15}"
          title="أدخل رقم بدون +، من 10 إلى 15 رقم"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        رقم العملاء سيتواصلون معك عليه مباشرة عبر WhatsApp
      </p>
    </div>

    <!-- Bio -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        معلومات عن متجرك (اختياري)
      </label>
      <textarea
        v-model="form.bio"
        placeholder="وصف قصير عن متجرك أو خدماتك..."
        rows="3"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      ></textarea>
    </div>

    <!-- Terms Agreement -->
    <div class="flex items-start gap-2">
      <input
        v-model="form.agreeToTerms"
        type="checkbox"
        id="terms"
        required
        class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label for="terms" class="text-xs text-gray-600 dark:text-gray-400">
        أوافق على
        <a href="/terms" class="text-blue-600 hover:underline dark:text-blue-400">
          شروط الخدمة
        </a>
        و
        <a href="/privacy" class="text-blue-600 hover:underline dark:text-blue-400">
          سياسة الخصوصية
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
      ✅ تم إنشاء متجرك بنجاح! جاري التحويل...
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading || !form.agreeToTerms"
      class="w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
    >
      <span v-if="!isLoading">إنشاء المتجر الآن</span>
      <span v-else class="inline-flex items-center gap-2">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
        جاري الإنشاء...
      </span>
    </button>

    <!-- Login Link -->
    <p class="text-center text-sm text-gray-600 dark:text-gray-400">
      هل لديك متجر بالفعل؟
      <a href="/login" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">
        تسجيل الدخول
      </a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface SignupForm {
  username: string;
  displayName: string;
  email: string;
  country: string;
  city: string;
  whatsappNumber: string;
  bio: string;
  agreeToTerms: boolean;
}

const form = ref<SignupForm>({
  username: "",
  displayName: "",
  email: "",
  country: "",
  city: "",
  whatsappNumber: "",
  bio: "",
  agreeToTerms: false,
});

const isLoading = ref(false);
const error = ref("");
const success = ref(false);
const usernameError = ref("");

const validateUsername = async (username: string) => {
  if (!username) {
    usernameError.value = "";
    return;
  }

  // Check format
  if (!/^[a-z0-9_-]+$/.test(username)) {
    usernameError.value = "أحرف إنجليزية صغيرة وأرقام وشرطة فقط";
    return;
  }

  // Check length
  if (username.length < 3 || username.length > 20) {
    usernameError.value = "يجب أن يكون من 3 إلى 20 حرف";
    return;
  }

  // Check availability on server
  try {
    const response = await fetch(`/api/auth/check-username?username=${username}`);
    const data = await response.json();

    if (!data.available) {
      usernameError.value = "هذا الاسم مستخدم بالفعل";
    } else {
      usernameError.value = "";
    }
  } catch (err) {
    console.error("Error checking username:", err);
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

    // Submit signup
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form.value),
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
    error.value = err.message || "حدث خطأ ما. حاول مجدداً";
  } finally {
    isLoading.value = false;
  }
};

// Watch username changes
import { watch } from "vue";
watch(() => form.value.username, validateUsername, { debounce: 500 });
</script>
