<template>
  <div>
    <b-navbar
      toggleable="lg"
      type="dark"
      :variant="user?.roles?.includes('operator') ? 'info' : 'primary'"
    >
      <b-navbar-brand href="#">
        <span v-if="user?.name">Welcome, {{ user.name }}</span>
        <span v-else>Menya</span>
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item href="/">All Products</b-nav-item>
        <b-nav-item v-if="user?.name != null" href="/shoppingCart/${user.name}"
          >My Orders</b-nav-item
        >
        <b-nav-item v-if="user?.name != null" href="/profile/${user.name}"
          >My Profile</b-nav-item
        >
        <b-nav-item v-if="user?.name == null" href="/api/login"
          >Login</b-nav-item
        >
        <b-nav-item v-if="user?.name" @click="logout">Logout</b-nav-item>
        <form method="POST" action="/api/logout" id="logoutForm" />
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from "vue";

// http://localhost:31002/api/login?key=alpha-beta-delta&user=test.user

const user = ref({} as any);
provide("user", user);

onMounted(async () => {
  user.value = await (await fetch("/api/user")).json();
});

function logout() {
  (window.document.getElementById("logoutForm") as HTMLFormElement).submit();
}
</script>
