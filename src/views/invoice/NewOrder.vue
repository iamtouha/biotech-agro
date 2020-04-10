<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="display-1 mb-3">New Order</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step :complete="e1 > 1" step="1"
              >Order details</v-stepper-step
            >
            <v-divider></v-divider>
            <v-stepper-step :complete="e1 > 2" step="2"
              >Order items</v-stepper-step
            >
            <v-divider></v-divider>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card elevation="0" text class="mb-5">
                <v-col cols="12">
                  <v-select
                    v-model="dealer"
                    outlined
                    :items="dealers"
                    item-text="name"
                    return-object
                    label="Dealers"
                    required
                  ></v-select>
                  <v-text-field
                    v-model="order_no"
                    outlined
                    type="number"
                    label="Order No."
                  ></v-text-field
                  >Date: &nbsp;&nbsp;
                  <Datefield @changedVal="dateEntered" />
                </v-col>
              </v-card>
              <v-btn color="primary" @click="propagateToNext()">Continue</v-btn>
              <v-btn text>Cancel</v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-card elevation="0" text class="mb-5">
                <v-row v-if="orders.length">
                  <v-col cols="12" pb-3>
                    <v-data-table
                      class="mt-0"
                      sort-by
                      :headers="headers"
                      :items="orders"
                    >
                      <template v-slot:item.rate="{ item }">
                        <td>
                          {{
                            item.cash
                              ? item.cash / item.units
                              : item.credit / item.units
                          }}
                        </td>
                      </template>
                      <template v-slot:item.action="{ item }">
                        <v-btn text color="red" @click="removeFromList(item)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      <template v-slot:footer>
                        <tfoot>
                          <td>
                            items:
                            <strong>{{ item }}</strong>
                          </td>
                          <td>
                            cash:
                            <strong>{{ cash }}tk</strong>
                          </td>
                          <td>
                            credit:
                            <strong>{{ credit }}tk</strong>
                          </td>
                          <td></td>
                        </tfoot>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      outlined
                      v-model="order.product"
                      label="Product"
                      :items="productsList"
                      item-text="name"
                      return-object
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="6" px-3>
                    <v-select
                      outlined
                      v-if="order.product"
                      v-model="order.pack_size"
                      :items="order.product.variants"
                      item-text="size"
                      return-object
                      label="pack size"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="6" v-if="order.pack_size">
                    <v-btn-toggle class="elevation-0 mt-3" v-model="order.cash">
                      <v-btn :value="1" small>Cash</v-btn>
                      <v-btn :value="0" small>Credit</v-btn>
                    </v-btn-toggle>
                  </v-col>
                  <v-col sm="3" cols="6" px-3 v-if="order.pack_size">
                    <v-text-field
                      v-model="order.price"
                      outlined
                      label="Rate(tk)"
                      type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col sm="3" cols="6" px-3 v-if="order.pack_size">
                    <v-text-field
                      v-model="order.units"
                      outlined
                      type="number"
                      label="Units"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="text-center">
                    <v-btn
                      elevation="1"
                      :disabled="!addBtn"
                      @click.stop="addToList()"
                      >Add</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card>
              <v-btn
                :disabled="orders.length ? false : true"
                color="primary"
                @click="submit()"
                >Continue</v-btn
              >
              <v-btn to="/orders" text>Cancel</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-col>
      <Alert :message="message" />
    </v-row>
  </v-container>
</template>
<script>
import firebase from "@/firebaseConfig";
import Datefield from "@/components/Datefield";
import Alert from "@/components/Alert";
import { mapGetters } from "vuex";
export default {
  components: { Datefield, Alert },
  data() {
    return {
      confirm_date: new Date(),
      e1: 1,
      dealer: null,
      order_no: null,
      productsList: [],
      orders: [],
      order: {
        product: null,
        pack_size: null,
        price: 0,
        cash: 1,
        units: 1
      },
      headers: [
        {
          text: "Product",
          align: "center",
          sortable: false,
          value: "product"
        },
        { text: "size", align: "center", sortable: false, value: "size" },
        { text: "Rate", align: "center", value: "rate" },
        { text: "Units", align: "center", value: "units" },
        { text: "Cash(tk)", align: "center", value: "cash" },
        { text: "Credit(tk)", align: "center", value: "credit" },
        { text: "Action", sortable: false, value: "action" }
      ],
      addBtn: false,
      message: null
    };
  },
  computed: {
    ...mapGetters(["products", "dealers", "userState"]),

    item() {
      var total = 0;
      var list = this.orders;
      for (var i = 0; i < list.length; i++) {
        total += list[i].units;
      }
      return total;
    },
    cash() {
      var total = 0;
      var list = this.orders;
      for (var i = 0; i < list.length; i++) {
        total += list[i].cash;
      }
      return total;
    },
    credit() {
      var total = 0;
      var list = this.orders;
      for (var i = 0; i < list.length; i++) {
        total += list[i].credit;
      }
      return total;
    }
  },
  methods: {
    dateEntered(val) {
      this.confirm_date = val;
    },

    async propagateToNext() {
      if (this.dealer && this.order_no) {
        try {
          this.productsList = [...this.products];
          this.e1 = 2;
        } catch (error) {
          this.message = error.message;
        }
      } else {
        this.message = "insert dealer and Invoice No.";
      }
    },
    addToList() {
      const order = {
        product: this.order.product.name,
        product_obj: this.order.product,
        cash: this.order.cash ? this.order.price * this.order.units : 0,
        credit: this.order.cash ? 0 : this.order.price * this.order.units,
        size: this.order.pack_size.size,
        index: this.order.product.variants.indexOf(this.order.pack_size),
        units: parseInt(this.order.units)
      };
      this.orders.push(order);
      this.order.product = null;
    },
    removeFromList(item) {
      const index = this.orders.indexOf(item);
      this.orders.splice(index, 1);
    },

    async submit() {
      try {
        const date = new Date();
        const time = new Date(this.confirm_date).setHours(
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
        );
        await firebase
          .firestore()
          .collection("invoices")
          .doc()
          .set({
            order_no: parseInt(this.order_no),
            mo: this.userState.uid,
            marketing_officer: this.userState.name,
            am: this.userState.supirior,
            items: this.orders,
            submitted: new Date(time),
            dealer: this.dealer,
            dealerId: this.dealer.id,
            confirmed: false
          });

        this.message = "success";
        this.orders = this.raw_orders = [];
        this.dealer = this.order_no = null;
        this.e1 = 1;
      } catch (error) {
        this.message = error.message;
      }
    }
  },
  watch: {
    "order.product": function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.order.pack_size = null;
      }
    },
    "order.pack_size": function(newVal) {
      if (!newVal) {
        (this.order.price = 0), (this.order.units = 1);
      } else {
        this.order.price = this.order.cash
          ? newVal.cash_price
          : newVal.credit_price;
      }
    },
    "order.cash": function(newVal) {
      const pack = this.order.pack_size;
      this.order.price = newVal ? pack.cash_price : pack.credit_price;
    },
    order: {
      deep: true,
      handler(newval) {
        if (
          newval.product &&
          newval.pack_size &&
          newval.units &&
          newval.price
        ) {
          this.addBtn = true;
        } else {
          this.addBtn = false;
        }
      }
    }
  }
};
</script>

<style scoped></style>
