<script setup lang="ts">
definePageMeta({ layout: 'auth' })

onMounted(async () => {
  try {
    await $fetch('/api/auth/me')
    await navigateTo('/dashboard')
  } catch {
    await navigateTo('/auth')
  }
})
</script>

<template>
  <div class="flex items-center justify-center py-20">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-purple-600 text-4xl" />
  </div>
</template>
