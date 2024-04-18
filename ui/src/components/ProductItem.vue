<template>
  <b-card
    :title="product.name"
    tag="article"
    style="max-width: 20rem"
    class="mb-2"
    @click="handleProductClick"
  >
    <b-button @click="handleAddCartClick" variant="primary"
      >Add to Cart</b-button
    >
  </b-card>
</template>

<script setup lang="ts">
interface Props {}
defineProps<Props>();

function handleProductClick() {}

function handleAddCartClick() {}
</script>
