<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Welcome to Menya!`"
    />
    <MenuBar />
  </div>
</template>

<script setup lang="ts">
import MenuBar from "../components/MenuBar.vue";
</script>
