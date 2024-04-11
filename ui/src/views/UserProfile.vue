<template>
  <div class="mx-3 my-3">
    <b-jumbotron
      bg-variant="primary"
      text-variant="white"
      :header="`Welcome, ${name}`"
    />

    <h2>Address</h2>
    <!-- Add address here -->

    <h2>Most purchased item</h2>

    <h2>Order again</h2>
    <h2>Previous orders</h2>
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table v-if="customer" :items="customer.orders" />

    <!-- <h2>Draft Order</h2>
    Check the ingredients you want:
    <b-form-checkbox-group
      v-model="draftOrderIngredients"
      :options="possibleIngredients"
    />
    <div class="mt-2">
      <b-button @click="save">Save</b-button>
    </div>
    <div class="mt-2">
      <b-button @click="submit">Submit</b-button>
      Note: must save before submitting
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, Ref } from "vue";
import { CustomerWithOrders } from "../data";

// props
interface Props {
  customerId: string;
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  customerId: "",
});

const customer: Ref<CustomerWithOrders | null> = ref(null);

const name = computed(() => customer.value?.name || props.customerId);
const draftOrderIngredients: Ref<string[]> = ref([]);
const possibleIngredients: Ref<string[]> = ref([]);

async function refresh() {
  possibleIngredients.value = await (
    await fetch("/api/possible-ingredients")
  ).json();

  if (props.customerId) {
    customer.value = await (
      await fetch("/api/customer/" + encodeURIComponent(props.customerId))
    ).json();
    draftOrderIngredients.value =
      (
        await (
          await fetch(
            "/api/customer/" +
              encodeURIComponent(props.customerId) +
              "/draft-order"
          )
        ).json()
      )?.ingredients || [];
  }
}
onMounted(refresh);

async function save() {
  await fetch(
    "/api/customer/" + encodeURIComponent(props.customerId) + "/draft-order",
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ ingredients: draftOrderIngredients.value }),
    }
  );
}

async function submit() {
  await fetch(
    "/api/customer/" +
      encodeURIComponent(props.customerId) +
      "/submit-draft-order",
    { method: "POST" }
  );
  await refresh();
}
</script>
