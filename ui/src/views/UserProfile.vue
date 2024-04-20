<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Welcome, ${user.name}`"
    />
    <h2>Username</h2>
    <div>{{ profile?.username }}</div>
    <!-- <div>{{ user.preferred_username }}</div> -->

    <h2>Name</h2>
    <div>{{ profile?.name }}</div>
    <h2>Email</h2>
    <div>{{ profile?.email }}</div>
    <!-- <div>{{ user.email }}</div> -->

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

    <h2>Most purchased item</h2>

    <h2>Order again</h2>
    <h2>Previous orders</h2>
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from "vue";
import { User } from "../../../server/data";

const user: Ref<any> = inject("user")!;
const profile: Ref<User | null> = ref(null);
const editableAddress = ref("");

async function refresh() {
  try {
    const profileResponse = await fetch("/api/user/profile");
    profile.value = await profileResponse.json();
  } catch (error) {
    console.error(error);
    alert("Error fetching user profile");
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

// async function save() {
//   await fetch("/api/customer/draft-order", {
//     headers: {
//       "Content-Type": "application/json",
//     },
//     method: "PUT",
//     body: JSON.stringify({ ingredients: draftOrderIngredients.value }),
//   });
// }

// async function submit() {
//   await fetch("/api/customer/submit-draft-order", { method: "POST" });
//   await refresh();
// }
</script>
