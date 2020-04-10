<template>
  <v-container fluid>
    <v-progress-circular
      class="loader"
      v-if="loader"
      :size="50"
      color="primary"
      indeterminate
    ></v-progress-circular>
    <v-row>
      <v-col cols="12">
        <v-data-table
          dense
          :headers="stockHeaders"
          sort-by="product"
          :items-per-page="20"
          :items="stockProducts"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Stock</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn to="/stock/add" class="primary elevation-0"
                >new challan</v-btn
              >
            </v-toolbar>
          </template>
        </v-data-table>
        <input
          v-if="mode === 'development'"
          @click="reset"
          type="button"
          value="reset"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      mode: process.env.NODE_ENV,
      loader: false,
      stockHeaders: [
        {
          text: "Product",
          value: "name"
        },
        {
          text: "Size",
          value: "size"
        },
        {
          text: "Stock",
          value: "stock"
        }
      ]
    };
  },
  computed: {
    userPost() {
      return this.user.post;
    },
    stockProducts() {
      const item = [];
      this.products.forEach(product => {
        product.variants.forEach((variant, index) => {
          item.push({
            key: product.id,
            name: product.name,
            type: product.type,
            size: variant.size,
            parent: this.products.indexOf(product),
            index: index,
            stock: variant.stock,
            cash: variant.cash_price,
            credit: variant.credit_price
          });
        });
      });
      return item;
    },
    ...mapGetters(["userState", "products"])
  },
  methods: {
    reset() {
      if (this.mode === "development") {
        const db = firebase.firestore();
        const batch = db.batch();
        this.products.forEach(item => {
          const variants = [];
          item.variants.forEach(variant => {
            variants.push({
              ...variant,
              stock: 0
            });
          });
          const ref = db.collection("products").doc(item.id);
          batch.update(ref, {
            variants
          });
        });
        confirm("reset stock?") &&
          batch.commit().then(() => {
            console.log("reset successful");
          });
      }
    }
  }
};
</script>
<style lang="scss">
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.textBox .v-input__control .v-input__slot {
  display: flex !important;
  min-height: 35px !important;
  height: 35px;
  align-items: center !important;
}
</style>
