<template>
  <div
    :class="[
      'overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md',
      listing.featured
        ? 'border-primary-300 bg-primary-50 dark:border-primary-900 dark:bg-primary-950'
        : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
    ]"
  >
    <div class="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
      <img
        v-if="listing.image_url"
        :src="listing.image_url"
        :alt="listing.title"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full items-center justify-center text-xs text-gray-400">
        No image
      </div>

      <div
        v-if="listing.featured"
        class="absolute right-2 top-2 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow"
      >
        Featured
      </div>

      <div
        v-if="listing.condition"
        class="absolute left-2 top-2 rounded-full bg-gray-900/70 px-3 py-1 text-xs font-semibold text-white"
      >
        {{ conditionLabel }}
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1">
          <a
            :href="detailsUrl"
            class="font-semibold text-gray-900 hover:text-primary-600 dark:text-gray-50"
          >
            {{ listing.title }}
          </a>
          <p v-if="metaLine" class="text-xs text-gray-500 dark:text-gray-400">
            {{ metaLine }}
          </p>
        </div>
      </div>

      <p v-if="listing.description" class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
        {{ listing.description }}
      </p>

      <div class="mt-3 flex flex-wrap gap-1">
        <span
          v-if="listing.category"
          class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          {{ listing.category }}
        </span>
        <span
          v-if="listing.color"
          class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        >
          {{ listing.color }}
        </span>
      </div>

      <div class="mt-4 border-t border-gray-200 pt-3 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div v-if="listing.price" class="text-lg font-bold text-primary-600 dark:text-primary-400">
            {{ listing.price }}
            <span v-if="listing.currency" class="ml-1 text-xs">{{ listing.currency }}</span>
          </div>
          <div v-if="listing.city" class="text-xs text-gray-500 dark:text-gray-400">
            {{ listing.city }}
          </div>
        </div>
      </div>

      <div v-if="listing.phone_number" class="mt-3 text-xs text-gray-600 dark:text-gray-400">
        <a
          :href="whatsappUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400"
        >
          تواصل
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Listing {
  id?: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  image_url?: string;
  city?: string;
  phone_number?: string;
  featured?: boolean;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  color?: string;
}

const props = defineProps<{
  listing: Listing;
  username: string;
}>();

const detailsUrl = computed(() =>
  props.listing.id ? `/@${props.username}/listing/${props.listing.id}` : "#"
);

const metaLine = computed(() =>
  [props.listing.brand, props.listing.model, props.listing.year]
    .filter(Boolean)
    .join(" • ")
);

const conditionLabel = computed(() => {
  if (props.listing.condition === "new") return "جديد";
  if (props.listing.condition === "used") return "مستعمل";
  return props.listing.condition;
});

const whatsappUrl = computed(() => {
  const phone = String(props.listing.phone_number ?? "").replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(
    `أتواصل معك بخصوص: ${props.listing.title}`
  )}`;
});
</script>
