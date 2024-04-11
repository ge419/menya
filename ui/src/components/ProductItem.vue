<template>
  <b-card
    :title="product.name"
    tag="article"
    style="max-width: 20rem"
    class="mb-2"
  >
    <b-button @click="cart" variant="primary">Add to Cart</b-button>
  </b-card>
</template>

<script setup lang="ts">
defineProps({
  product: Object,
});
</script>
