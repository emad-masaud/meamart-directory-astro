<template>
  <div class="space-y-6">
    <!-- Filters & Sort -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <!-- Search -->
        <div class="relative">
          <Icon name="tabler:search" class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث عن إعلان..."
            class="rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <!-- Category Filter -->
        <select
          v-model="selectedCategory"
          class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">جميع الفئات</option>
          <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

        <!-- Price Range -->
        <select
          v-model="priceRange"
          class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">جميع الأسعار</option>
          <option value="0-1000">0 - 1,000</option>
          <option value="1000-5000">1,000 - 5,000</option>
          <option value="5000-10000">5,000 - 10,000</option>
          <option value="10000+">10,000+</option>
        </select>
      </div>

      <!-- Sort -->
      <select
        v-model="sortBy"
        class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="newest">الأحدث أولاً</option>
        <option value="price-asc">السعر: من الأقل للأعلى</option>
        <option value="price-desc">السعر: من الأعلى للأقل</option>
        <option value="featured">الإعلانات المميزة أولاً</option>
      </select>
    </div>

    <!-- Results Count -->
    <div class="text-sm text-gray-600 dark:text-gray-400">
      <span v-if="loading">جاري التحميل...</span>
      <span v-else-if="filteredListings.length === 0">لا توجد إعلانات تطابق البحث</span>
      <span v-else>
        عرض {{ paginatedListings.length }} من {{ filteredListings.length }} إعلان
      </span>
    </div>

    <!-- Listings Grid -->
    <div v-if="!loading && paginatedListings.length > 0" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UserListingCard
        v-for="listing in paginatedListings"
        :key="listing.id"
        :listing="listing"
        :username="username"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && filteredListings.length === 0"
      class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
    >
      <Icon name="tabler:inbox" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-50">لا توجد إعلانات</h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        جرّب تغيير معايير البحث أو الفلاتر
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && totalPages > 1"
      class="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-800"
    >
      <button
        @click="previousPage"
        :disabled="currentPage === 1"
        class="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Icon name="tabler:chevron-right" class="h-4 w-4" />
        السابق
      </button>

      <div class="flex items-center gap-2">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="currentPage = page"
          :class="{
            'bg-blue-600 text-white': currentPage === page,
            'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800': currentPage !== page,
          }"
          class="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        التالي
        <Icon name="tabler:chevron-left" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Icon } from "astro-icon/components";
import UserListingCard from "./UserListingCard.astro";

interface Listing {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  currency?: string;
  location?: string;
  image_url?: string;
  featured?: boolean;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  condition?: string;
  phone_number?: string;
}

const props = defineProps<{
  username: string;
}>();

const listings = ref<Listing[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("");
const priceRange = ref("");
const sortBy = ref("newest");
const currentPage = ref(1);
const itemsPerPage = 12;

// Fetch listings on mount
onMounted(async () => {
  try {
    const response = await fetch(`/api/users/${props.username}/listings`);
    if (!response.ok) throw new Error("Failed to fetch listings");

    const data = await response.json();
    listings.value = data.listings || [];
  } catch (error) {
    console.error("Error fetching listings:", error);
  } finally {
    loading.value = false;
  }
});

// Get unique categories for filter
const uniqueCategories = computed(() => {
  const categories = new Set(
    listings.value.filter((l) => l.category).map((l) => l.category)
  );
  return Array.from(categories).sort();
});

// Filter listings based on search, category, price
const filteredListings = computed(() => {
  let filtered = [...listings.value];

  // Search by title or description
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        (l.title && l.title.toLowerCase().includes(query)) ||
        (l.description && l.description.toLowerCase().includes(query))
    );
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((l) => l.category === selectedCategory.value);
  }

  // Filter by price range
  if (priceRange.value) {
    const [min, max] = priceRange.value.split("-").map(Number);
    filtered = filtered.filter((l) => {
      if (!l.price) return false;
      if (max === 0) return l.price >= min; // For "10000+" case
      return l.price >= min && l.price <= max;
    });
  }

  // Sort
  if (sortBy.value === "price-asc") {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy.value === "price-desc") {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy.value === "featured") {
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  // "newest" is already in order from API

  return filtered;
});

// Paginate filtered listings
const totalPages = computed(() => Math.ceil(filteredListings.value.length / itemsPerPage));

const paginatedListings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredListings.value.slice(start, start + itemsPerPage);
});

// Display page numbers (show max 5)
const displayedPages = computed(() => {
  const pages: number[] = [];
  const maxDisplay = 5;

  if (totalPages.value <= maxDisplay) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const half = Math.floor(maxDisplay / 2);
    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(totalPages.value, start + maxDisplay - 1);

    if (end - start < maxDisplay - 1) {
      start = Math.max(1, end - maxDisplay + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Reset to page 1 when filters change
const resetPagination = () => {
  currentPage.value = 1;
};

// Watch for filter changes
import { watch } from "vue";
watch([searchQuery, selectedCategory, priceRange, sortBy], resetPagination);
</script>
