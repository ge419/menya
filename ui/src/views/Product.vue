<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Product name here`"
    />
    <div>Description here</div>
    <div>Avg Rating</div>
    <div>Previously Purchased?</div>
    <div>Price:</div>
    <div>Quantity</div>
    <div>Reviews here</div>
    <div>Tags</div>
    <b-button @click="add" class="mb-2">Add to Cart</b-button>
  </div>
</template>

<script setup lang="ts"></script>
