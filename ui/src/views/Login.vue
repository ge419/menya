<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Welcome to Menya!`"
    />
    <MenuBar />
    <h2>Please Log In</h2>
    <b-button @click="login" class="mb-2">Login</b-button>
  </div>
</template>

<script setup lang="ts">
import MenuBar from "../components/MenuBar.vue";
async function login() {
  // Implement pay here -- what should pay do?
  // update order status as paid
  // add order to previous orders in db
}
</script>
