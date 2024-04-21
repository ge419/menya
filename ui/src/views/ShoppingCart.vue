<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Shopping Cart`"
    />
    <h2>Products</h2>
    <!-- Loop through products in the cart -->
    <div v-if="cart && cart.products.length > 0">
      <div
        v-for="cartProduct in cart.products"
        :key="cartProduct.product._id"
        class="product-block"
      >
        <h3>{{ cartProduct?.product.name }}</h3>
        <p>{{ cartProduct?.product.description }}</p>
        <p>Price: ${{ cartProduct?.product.price.toFixed(2) }}</p>
        <p>Quantity: {{ cartProduct?.quantity }}</p>
        <p>
          Subtotal: ${{
            (cartProduct?.product.price * cartProduct?.quantity).toFixed(2)
          }}
        </p>
      </div>
      <h2>Total: ${{ cart.totalCost.toFixed(2) }}</h2>
    </div>
    <div v-else>
      <p>Your cart is empty.</p>
    </div>
    <h3>Delivery Details:</h3>
    <div v-if="!isEditing">
      <p><strong>Name:</strong> {{ editableName }}</p>
      <p><strong>Telephone:</strong> {{ editableTelephone }}</p>
      <p><strong>Address:</strong> {{ editableAddress }}</p>
      <b-button @click="toggleEdit" class="mb-2">Edit Details</b-button>
    </div>
    <div v-else>
      <form @submit.prevent="updateCartDetails">
        <div class="mb-3">
          <label for="nameInput" class="form-label">Name</label>
          <input
            id="nameInput"
            v-model="editableName"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label for="telephoneInput" class="form-label">Telephone</label>
          <input
            id="telephoneInput"
            v-model="editableTelephone"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label for="addressInput" class="form-label">Address</label>
          <input
            id="addressInput"
            v-model="editableAddress"
            class="form-control"
            required
          />
        </div>
        <b-button type="submit" variant="primary">Save Details</b-button>
      </form>
    </div>
    <b-button @click="confirm" class="mb-2">Confirm Cart</b-button>
    <b-button @click="pay" class="mb-2">Pay</b-button>
  </div>
</template>

<script setup lang="ts">
import { Ref, inject, ref, watch } from "vue";
import { Cart, User } from "../../../server/data";
// check if this works
const user: Ref<any> = inject("user")!;
const cart: Ref<Cart | null> = ref(null);
const profile: Ref<User | null> = ref(null);
const isEditing = ref(false);
const editableAddress = ref("");
const editableTelephone = ref("");
const editableName = ref("");

function toggleEdit() {
  isEditing.value = !isEditing.value;
}

async function refresh() {
  try {
    const profileResponse = await fetch("/api/user/profile");
    if (!profileResponse.ok) {
      throw new Error("Failed to fetch profile");
    }

    profile.value = await profileResponse.json();

    const cartResponse = await fetch("/api/user/cart");
    if (!cartResponse.ok) {
      throw new Error("Failed to fetch cart");
    }
    cart.value = await cartResponse.json();
    editableName.value = cart.value?.name || "";
    editableTelephone.value = cart.value?.telephone || "";
    editableAddress.value = cart.value?.address || "";
  } catch (error) {
    console.error(error);
    alert("Error fetching cart");
  }
}

watch(user, refresh, { immediate: true });

async function updateCartDetails() {
  try {
    const response = await fetch("/api/user/update-cart-details", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editableName.value,
        telephone: editableTelephone.value,
        address: editableAddress.value,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to update cart details");
    }
    alert("Cart details updated successfully!");
    await refresh();
    isEditing.value = false;
  } catch (error) {
    console.error("Error updating cart details:", error);
    alert(`Error updating cart details: ${error.message}`);
  }
}

// async function updateProfile() {
//   try {
//     const response = await fetch("/api/user/update-profile", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name: editableName.value,
//         telephone: editableTelephone.value,
//         address: editableAddress.value,
//       }),
//     });
//     if (response.ok) {
//       alert("Profile updated successfully");
//       refresh(); // Refresh to fetch updated profile
//     } else {
//       throw new Error("Failed to update profile");
//     }
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     alert(`Error updating profile: ${error.message}`);
//   }
// }

async function confirm() {
  if (!cart.value || !Array.isArray(cart.value.products)) {
    console.error("Cart data is invalid or empty.");
    alert("Your cart is empty or has invalid data.");
    return;
  }

  try {
    const cartItemsForApi = cart.value.products.map((p) => ({
      _id: p.product._id,
      quantity: p.quantity,
    }));
    console.log("Sending to server:", cartItemsForApi);

    const saveResponse = await fetch("/api/user/update-cart", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ cartItems: cartItemsForApi }),
    });

    if (!saveResponse.ok) {
      throw new Error("Failed to update cart");
    }

    alert("Cart updated successfully!");
  } catch (error) {
    console.error("Error updating cart:", error);
    alert(`Error updating cart: ${error.message}`);
  }
}

async function pay() {
  try {
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

    // Create a new empty cart after successful payment
    const newCartResponse = await fetch("/api/user/create-empty-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!newCartResponse.ok) {
      throw new Error("Failed to create a new empty cart");
    }

    alert("Payment successful!");
    refresh(); // Assuming you may want to clear the cart or update the UI
  } catch (error) {
    console.error("Payment processing error:", error);
    alert(`Payment processing error: ${error.message}`);
  }
}

// function toggleEditAddress() {
//   isEditingAddress.value = !isEditingAddress.value;
// }

// async function saveAddress() {
//   try {
//     const response = await fetch("/api/user/update-address", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ address: editableAddress.value }),
//     });
//     if (response.ok) {
//       alert("Address updated successfully");
//       profile.value!.address = editableAddress.value; // Update local profile address
//       isEditingAddress.value = false;
//     } else {
//       throw new Error("Failed to update address");
//     }
//   } catch (error) {
//     console.error("Error updating address:", error);
//     alert(`Error updating address: ${error.message}`);
//   }
// }
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
