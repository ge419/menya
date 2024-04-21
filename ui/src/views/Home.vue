<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Welcome to Menya!`"
    />
    <b-container fluid="lg" class="my-4">
      <b-row>
        <b-col
          md="4"
          sm="6"
          xs="12"
          v-for="(product, index) in products"
          :key="product._id"
          class="mb-4"
          :data-testid="'product-item' + index"
        >
          <ProductItem :product="product" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script setup lang="ts">
import { Product } from "../../../server/data";
import ProductItem from "../components/ProductItem.vue";
import { Ref, onMounted, ref } from "vue";

const products: Ref<Product[]> = ref([]);

async function refresh() {
  products.value = await (await fetch("api/all-products")).json();
}
onMounted(refresh);
</script>
