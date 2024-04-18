<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="product?.name"
    />
    <h2>{{ product?.name }}</h2>
    <div>{{ product?.description }}</div>
    <div>Average Rating: {{ product?.avgRating }}</div>
    <!-- <div>Previously Purchased?</div> -->
    <div>Product Origin: {{ product?.origin }}</div>
    <div>Reviews here</div>
    <div>Tags: {{ product?.tags.map((tag) => tag.word).join(", ") }}</div>
    <div>
      Quantity:<input type="number" v-model.number="quantity" min="1" />
    </div>
    <b-button @click="add" class="mb-2">Add to Cart</b-button>

    <div>
      <h3>Reviews</h3>
      <div v-if="reviews.length > 0">
        <div v-for="review in reviews" :key="review._id" class="review-block">
          <div class="review-header">
            <div class="review-user">User ID: {{ review.userId }}</div>
            <div class="review-rating">Rating: {{ review.rating }}</div>
            <div class="review-tags">
              Tags: {{ review.tags.map((tag) => tag.word).join(", ") }}
            </div>
          </div>
          <div class="review-text">{{ review.text }}</div>
        </div>
      </div>
      <div v-else>No reviews yet.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import { Product, Review } from "../../../server/data";

const productId = "1";
const product: Ref<Product | null> = ref(null);
const reviews: Ref<Review[]> = ref([]);
const quantity = ref(1); // Default quantity

async function fetchProduct() {
  try {
    const response = await fetch(`/api/get-product/${productId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    product.value = await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  const reviewResponse = await fetch(`/api/get-reviews/${productId}`);
  reviews.value = await reviewResponse.json();
}

onMounted(fetchProduct);
</script>

<!-- CSS styling with help of ChatGPT -->
<style scoped>
.review-block {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-user {
  flex-grow: 1;
}

.review-rating {
  flex-grow: 1;
  text-align: right;
}

.review-tags {
  flex-grow: 2;
  text-align: right;
}

.review-text {
  font-style: italic;
}
</style>
