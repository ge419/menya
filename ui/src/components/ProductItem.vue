<template>
  <b-card
    :title="product.name"
    tag="article"
    style="max-width: 20rem"
    class="mb-2"
    @click="handleProductClick"
  >
    <!-- Display product price next to the Add to Cart button -->
    <div class="d-flex justify-content-between align-items-center">
      <span class="price-tag">Price: ${{ product.price.toFixed(2) }}</span>
      <b-button @click.stop="handleAddOneCartClick" variant="primary">
        Add to Cart
      </b-button>
    </div>
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

// Add one product to cart of current user
async function handleAddOneCartClick() {
  // TODO: Error handling for invaliud quantity --> backend?
  await fetch(`/api/user/add-cart:${props.product._id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify({
      quantity: 1,
    }),
  });
}
</script>

<style scoped>
.price-tag {
  font-size: 1rem; /* Adjust size as needed */
  font-weight: bold; /* Make the price stand out */
  color: #333; /* Dark color for better readability */
}

/* Add padding to the button for better touch target size */
.b-button {
  padding: 0.375rem 0.75rem;
}
</style>
