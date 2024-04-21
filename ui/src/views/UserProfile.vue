<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Welcome, ${user.name}`"
    />
    <h2>Username</h2>
    <div>{{ profile?.username }}</div>

    <h2>Name</h2>
    <div>{{ profile?.name }}</div>

    <h2>Email</h2>
    <div>{{ profile?.email }}</div>

    <h2>Address</h2>
    <div>Current Address: {{ profile?.address }}</div>
    <form @submit.prevent="updateAddress">
      <input
        v-model="editableAddress"
        class="form-control mb-2"
        placeholder="Enter your address here."
        required
      />
      <b-button type="submit" variant="primary">Update Address</b-button>
    </form>

    <h2>Telephone</h2>
    <div>Current Telephone: {{ profile?.telephone }}</div>

    <form @submit.prevent="updateProfile">
      <div class="mb-3">
        <input
          id="telephoneInput"
          v-model="editableTelephone"
          class="form-control"
          placeholder="Enter your telephone here."
          required
        />
      </div>
      <b-button type="submit" variant="primary">Update Profile</b-button>
    </form>

    <h2>Previous orders</h2>
    <div v-if="orders && orders.length > 0">
      <div v-for="(order, index) in orders" :key="index" class="order-block">
        <h4>
          Order ID: {{ order._id }} - Total: ${{ order.totalCost.toFixed(2) }}
        </h4>
        <div v-if="order.products && order.products.length > 0">
          <div
            v-for="product in order.products"
            :key="product.product._id"
            class="product-block"
          >
            <div class="product-header">
              <div class="product-name" :data-testid="'product-name-' + index">
                {{ product.product?.name }}
              </div>
              <div
                class="product-price"
                :data-testid="'product-price-' + index"
              >
                Price: ${{ product.product?.price.toFixed(2) }}
              </div>
            </div>
            <div
              class="product-quantity"
              :data-testid="'product-quantity-' + index"
            >
              Quantity: {{ product.quantity }}
            </div>
            <div class="product-subtotal">
              Subtotal: ${{
                (product.product?.price * product.quantity).toFixed(2)
              }}
            </div>
          </div>
        </div>
        <div v-else>No products in this order.</div>
      </div>
    </div>
    <div v-else>No previous orders found.</div>
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from "vue";
import { Cart, User } from "../../../server/data";

const user: Ref<any> = inject("user")!;
const profile: Ref<User | null> = ref(null);
const orders: Ref<Cart[]> = ref([]);
const editableAddress = ref("");
const editableTelephone = ref("");

async function refresh() {
  try {
    const profileResponse = await fetch("/api/user/profile");
    profile.value = await profileResponse.json();
    editableAddress.value = profile.value?.address || "";
    editableTelephone.value = profile.value?.telephone || "";

    const ordersResponse = await fetch("/api/user/paid-orders");
    if (!ordersResponse.ok) {
      throw new Error("Failed to fetch orders");
    }
    orders.value = await ordersResponse.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error fetching user profile or orders");
  }
}
watch(user, refresh, { immediate: true });

async function updateAddress() {
  if (!editableAddress.value.trim()) {
    alert("Address cannot be empty");
    return;
  }
  try {
    const response = await fetch("/api/user/update-address", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: editableAddress.value }),
    });
    if (response.ok) {
      alert("Address updated successfully");
      refresh();
    } else {
      throw new Error("Failed to update address");
    }
  } catch (error) {
    console.error("Update address error:", error);
    alert("Failed to update address");
  }
}

async function updateProfile() {
  try {
    const response = await fetch("/api/user/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: editableAddress.value,
        telephone: editableTelephone.value,
      }),
    });
    if (response.ok) {
      alert("Profile updated successfully");
      refresh();
    } else {
      throw new Error("Failed to update profile");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert(`Error updating profile: ${error.message}`);
  }
}
</script>

<style scoped>
.order-block,
.product-block {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.product-name,
.product-price,
.product-quantity,
.product-subtotal {
  margin-bottom: 2px;
}

h3,
h4 {
  color: #333;
}
</style>
