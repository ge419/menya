<template>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">Menya</b-navbar-brand>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/">Home</b-nav-item>
        <!-- Dynamically set the shopping cart link based on the user -->
        <b-nav-item :to="shoppingCartLink">Shopping Cart</b-nav-item>
      </b-navbar-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/login">Login</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  name: "MenuBar",
  props: {
    currentUser: {
      type: String,
      default: "",
    },
  },
  computed: {
    // Determine the shopping cart link based on the currentUser
    shoppingCartLink() {
      if (!this.currentUser) {
        return "/login"; // Direct to login if there's no user identified
      }
      return `/cart/${this.currentUser}`; // Use a dynamic segment for the user's cart
    },
  },
};
</script>
