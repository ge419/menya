import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import App from "./App.vue";
import UserProfile from "./views/UserProfile.vue";
import OperatorScreen from "./views/OperatorScreen.vue";
import StatusScreen from "./views/StatusScreen.vue";
import ShoppingCart from "./views/ShoppingCart.vue";
import Product from "./views/Product.vue";
import Home from "./views/Home.vue";

const routes = [
  {
    path: "/customer/:customerId",
    component: UserProfile,
    props: ({
      params: { customerId },
    }: {
      params: { customerId: string };
    }) => ({ customerId }),
  },
  {
    path: "/shoppingCart/:customerId",
    component: ShoppingCart,
    props: ({
      params: { customerId },
    }: {
      params: { customerId: string };
    }) => ({ customerId }),
  },
  {
    path: "/product/:productId",
    component: Product,
    props: ({ params: { productId } }: { params: { productId: string } }) => ({
      productId,
    }),
  },
  {
    path: "/operator/:operatorId",
    component: OperatorScreen,
    props: ({
      params: { operatorId },
    }: {
      params: { operatorId: string };
    }) => ({ operatorId }),
  },
  {
    path: "/",
    component: Home,
  },
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
