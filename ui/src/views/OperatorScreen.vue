<template>
  <div class="mx-3 my-3">
    <h2>Orders</h2>
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table :items="orders" :fields="fields">
      <template #cell(operatorId)="cellScope">
        <span v-if="cellScope.value">
          {{ cellScope.value }}
          <b-button @click="updateOrder(cellScope.item._id, 'done')" v-if="cellScope.value === user?.preferred_username && cellScope.item.state !== 'done'">
            Done
          </b-button>
        </span>
        <b-button v-else @click="updateOrder(cellScope.item._id, 'blending')">Start Blending</b-button>
      </template>
    </b-table>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, Ref, inject } from 'vue'
import { Operator, Order } from "../../../server/data"

const operator: Ref<Operator | null> = ref(null)
const orders: Ref<Order[]> = ref([])

const user: Ref<any> = inject("user")!

// async function refresh() {
//   if (user.value) {
//     operator.value = await (await fetch("/api/operator/")).json()
//   }
//   orders.value = await (await fetch("/api/orders/")).json()
// }
async function refresh() {
  if (user.value) {
    try {
      const response = await fetch("/api/operator/");
      if (!response.ok) {
        if (response.status === 403) {
          alert('You do not have permission to view this data.');
          orders.value = []; // Clear orders if not authorized
        } else {
          alert('An error occurred while fetching the data.');
        }
        return; // Exit the function early
      }
      operator.value = await response.json();
    } catch (error) {
      console.error('Failed to fetch operator:', error);
      alert('An error occurred while fetching the data.');
    }
  }

  try {
    const ordersResponse = await fetch("/api/orders/");
    if (!ordersResponse.ok) {
      alert('An error occurred while fetching the orders.');
      return; // Exit the function early
    }
    orders.value = await ordersResponse.json();
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    alert('An error occurred while fetching the orders.');
  }
}

watch(user, refresh, { immediate: true })

const fields = ["_id", "customerId", "state", "ingredients", "operatorId"]

async function updateOrder(orderId: string, state: string) {
  await fetch(
    "/api/order/" + encodeURIComponent(orderId),
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        operatorId: user.value.preferred_username,
        state,
      })
    }
  )
  await refresh()
}
</script>