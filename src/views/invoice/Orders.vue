<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :loading="loader"
          sort-by
          :items="orders"
          :headers="header"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Orders</v-toolbar-title>
              <v-divider
                v-if="userState.post === 'mo'"
                class="mx-4"
                inset
                vertical
              ></v-divider>
              <v-btn
                v-if="userState.post === 'mo'"
                color="primary"
                dark
                to="/orders/add"
                >New Order</v-btn
              >
            </v-toolbar>
          </template>
          <template v-slot:item.dealer.name="{ item }">
            <router-link :to="`orders/id/${item.id}`"
              >{{ item.dealer.code }}. {{ item.dealer.name }}</router-link
            >
          </template>
          <template v-slot:item.submitted="{ item }">
            {{ item.submitted.toDate().getDate() }}-{{
              item.submitted.toDate().getMonth() + 1
            }}-{{ item.submitted.toDate().getFullYear() }}
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import firebase from "@/firebaseConfig";
const db = firebase.firestore();
export default {
  data() {
    return {
      loader: false,
      orders: [],
      header: [
        {
          text: "Dealer",
          value: "dealer.name"
        },
        {
          text: "Order No.",
          value: "order_no"
        },
        {
          text: "Submitted on",
          value: "submitted"
        }
      ]
    };
  },
  computed: {
    ...mapGetters(["userState"])
  },
  methods: {
    async fetchOrders() {
      try {
        this.loader = true;
        const querySnap = await db
          .collection("invoices")
          .where(this.userState.post, "==", this.userState.uid)
          .where("confirmed", "==", false)
          .get();
        querySnap.forEach(doc => {
          this.orders.push({ id: doc.id, ...doc.data() });
        });
        this.loader = false;
      } catch (error) {
        this.loader = false;

        alert(error.message);
      }
    }
  },
  created() {
    if (this.userState.post !== "mo") {
      this.header.splice(2, 0, {
        text: "Marketing Officer",
        value: "marketing_officer",
        sortable: false
      });
    }
    this.fetchOrders();
  }
};
</script>
