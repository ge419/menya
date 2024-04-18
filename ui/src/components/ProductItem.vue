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
import { useRouter } from "vue-router";
import Product from "../views/Product.vue";

const props = defineProps({
  product: Product,
});

const router = useRouter();

// Link to Product Page
function handleProductClick() {
  router.push(`/product/${props.product._id}`);
}

// Add product to cart of current user
function handleAddCartClick() {}
</script>
