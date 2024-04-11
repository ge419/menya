<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Shopping Cart`"
    />
    <h2>Items</h2>
    <h2>Total:</h2>
    <h3>Deliver to: Address</h3>
    <div class="mt-2">
      <b-button @click="save">Save</b-button>
      Note: must save before submitting
    </div>
    <b-button @click="pay" class="mb-2">Pay</b-button>
  </div>
</template>

<script setup lang="ts">
async function pay() {
  // Implement pay here -- what should pay do?
  // update order status as paid
  // add order to previous orders in db
}
</script>
