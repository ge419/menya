<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Shopping Cart`"
    />
    <h2>Items</h2>
    <!-- Loop through products in the cart -->
    <div v-if="cart && cart.products.length > 0">
      <div
        v-for="cartProduct in cart.products"
        :key="cartProduct.product._id"
        class="product-block"
      >
        <h3>{{ cartProduct.product.name }}</h3>
        <p>{{ cartProduct.product.description }}</p>
        <p>Price: ${{ cartProduct.product.price.toFixed(2) }}</p>
        <p>Quantity: {{ cartProduct.quantity }}</p>
        <p>
          Subtotal: ${{
            (cartProduct.product.price * cartProduct.quantity).toFixed(2)
          }}
        </p>
      </div>
      <h2>Total: ${{ total.toFixed(2) }}</h2>
    </div>
    <div v-else>
      <p>Your cart is empty.</p>
    </div>
    <h3>Deliver to: Address</h3>
    <b-button @click="pay" class="mb-2">Pay</b-button>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, inject, ref, watch } from "vue";
import { Cart } from "../../../server/data";
// check if this works
const user: Ref<any> = inject("user")!;
const cart: Ref<Cart | null> = ref(null);

const total = computed(() => {
  if (!cart.value) return 0;
  return cart.value.products.reduce((acc, cartProduct) => {
    return acc + cartProduct.product.price * cartProduct.quantity;
  }, 0);
});

async function refresh() {
  const cartResponse = await fetch("/api/user/cart");
  if (!cartResponse.ok) {
    throw new Error("Failed to fetch cart");
  }
  cart.value = (await cartResponse.json())?.products || [];
}
watch(user, refresh, { immediate: true });

async function pay() {
  try {
    // Update the cart as the 'save' functionality would
    const saveResponse = await fetch("api/user/update-cart", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ products: cart.value }),
    });

    if (!saveResponse.ok) {
      throw new Error("Failed to update cart");
    }

    // If the save/update is successful, change the status to 'paid'
    const payResponse = await fetch("/api/customer/pay-cart", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ status: "paid" }),
    });

    if (!payResponse.ok) {
      throw new Error("Failed to process payment");
    }

    alert("Payment successful!");
    // Optionally refresh the cart or redirect the user
    refresh(); // Assuming you may want to clear the cart or update the UI
  } catch (error) {
    console.error("Payment processing error:", error);
  }
}
</script>

<style scoped>
.product-block {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}

h3 {
  color: #333;
}

p {
  margin: 5px 0;
}
</style>
