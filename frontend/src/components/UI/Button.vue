<template>
  <button :class="['btn', `btn-${variant}`]" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger';
}>();

defineEmits<{
  click: [];
}>();
</script>

