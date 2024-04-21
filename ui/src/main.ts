import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import App from "./App.vue";
import UserProfile from "./views/UserProfile.vue";
import ShoppingCart from "./views/ShoppingCart.vue";
import Product from "./views/Product.vue";
import Home from "./views/Home.vue";
// import Login from "./views/Login.vue";

const routes = [
  // {
  //   path: "/profile/:userId",
  //   component: UserProfile,
  //   props: ({ params: { userId } }: { params: { userId: string } }) => ({
  //     userId,
  //   }),
  // },
  // {
  //   path: "/shopping-cart/:userId",
  //   component: ShoppingCart,
  //   props: ({ params: { userId } }: { params: { userId: string } }) => ({
  //     userId,
  //   }),
  // },
  // {
  {
    path: "/profile/:userId",
    name: "UserProfile",
    component: UserProfile,
    props: (route) => ({ userId: route.params.userId }),
  },
  {
    path: "/shopping-cart/:userId",
    name: "ShoppingCart",
    component: ShoppingCart,
    props: (route) => ({ userId: route.params.userId }),
  },
  {
    path: "/product/:productId",
    component: Product,
    props: ({ params: { productId } }: { params: { productId: string } }) => ({
      productId,
    }),
  },
  {
    path: "/",
    component: Home,
  },
  // {
  //   path: "/login",
  //   component: Login,
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(BootstrapVue as any)
  .use(BootstrapVueIcons as any)
  .use(router)
  .mount("#app");
