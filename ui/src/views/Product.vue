<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="product?.name"
    />
    <h2>{{ product?.name }}</h2>
    <div>{{ product?.description }}</div>
    <div>
      Average Rating:
      {{ product?.avgRating ? product.avgRating : "No ratings yet" }}
    </div>

    <!-- <div>Previously Purchased?</div> -->
    <div>Product Origin: {{ product?.origin }}</div>
    <div>Price: {{ product?.price }}</div>
    <div>Tags: {{ product?.tags.map((tag) => tag.word).join(", ") }}</div>
    <div>
      Quantity:<input type="number" v-model.number="quantity" min="1" />
    </div>
    <b-button @click="handleAddCartClick" class="mb-2">Add to Cart</b-button>

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
import { useRoute } from "vue-router";

const route = useRoute();
const productId = ref(route.params.productId);
// const productId = "1";
const product: Ref<Product | null> = ref(null);
const reviews: Ref<Review[]> = ref([]);
const quantity = ref(1);

// watchEffect(() => {
//   if (productId.value) {
//     fetchProduct();
//   }
// });

async function fetchProduct() {
  try {
    const response = await fetch(`/api/get-product/${productId.value}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const productData = await response.json();
    product.value = productData;

    // Fetch reviews and calculate average rating
    const reviewResponse = await fetch(`/api/get-reviews/${productId.value}`);
    if (!reviewResponse.ok) {
      throw new Error("Failed to fetch reviews");
    }
    reviews.value = await reviewResponse.json();
    if (reviews.value.length > 0) {
      const totalRating = reviews.value.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      product.value.avgRating = (totalRating / reviews.value.length).toFixed(1); // Keep one decimal place
    } else {
      product.value.avgRating = "No ratings";
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
}

async function handleAddCartClick() {
  // TODO: Error handling for invaliud quantity --> backend?
  await fetch(`/api/user/add-cart/${productId.value}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify({
      quantity: quantity.value,
    }),
  });
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
  font-weight: bold;
  color: #ff9900;
}

.review-tags {
  flex-grow: 2;
  text-align: right;
}

.review-text {
  font-style: italic;
}
</style>
