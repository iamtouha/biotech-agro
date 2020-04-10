<template>
  <v-container>
    <v-row>
      <v-col class="text-center" cols="12">
        <h1 class="display-1 mt-4 mb-5">Biotech Agrovat Ltd.</h1>
      </v-col>
    </v-row>

    <v-row v-if="order">
      <v-col cols="12" sm="6">
        <p class="mb-0">
          Order No:
          <b>{{ order.order_no }}</b>
        </p>
        <p class="mb-0">
          Dealer:
          <b>{{ order.dealer.name }}</b>
        </p>
        <p>
          Address:
          <b>{{ order.dealer.address }}</b>
        </p>
        <p>
          Marketing Officer:
          <b>{{ order.marketing_officer }}</b>
        </p>
      </v-col>
      <v-col cols="12" sm="6" class="text-right">
        <p class="mb-2">
          Submission Date:
          <b>
            {{ submittedDate.getDate() }}-{{ submittedDate.getMonth() + 1 }}-{{
              submittedDate.getFullYear()
            }}
          </b>
        </p>
        <p v-if="userState.post === 'am'" class="mb-0">
          Confirm Date:
          <Datefield @changedVal="setDate" />
          <v-text-field
            style="max-width:200px;"
            class="mr-0 ml-auto"
            v-model="invoice_no"
            label="Invoice No."
            type="number"
          ></v-text-field>
        </p>
      </v-col>
      <v-col cols="12" sm="6" class="text-sm-right"></v-col>
      <v-col cols="12">
        <v-row mb-3>
          <v-col cols="6">
            <v-autocomplete
              v-model="item.product"
              label="Product"
              :items="products"
              item-text="name"
              return-object
              persistent-hint
            ></v-autocomplete>
          </v-col>
          <v-col cols="6" px-3>
            <v-select
              v-if="item.product"
              v-model="item.variant"
              :items="item.product.variants"
              item-text="size"
              return-object
              label="pack size"
              required
            ></v-select>
          </v-col>
          <v-col cols="6" v-if="item.variant">
            <v-btn-toggle class="elevation-0 mt-3" v-model="item.cash">
              <v-btn :value="1" small>Cash</v-btn>
              <v-btn :value="0" small>Credit</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="6" sm="3" px-3 v-if="item.variant">
            <v-text-field
              v-model="item.price"
              label="Rate(tk)"
              type="number"
            ></v-text-field>
          </v-col>
          <v-col cols="6" sm="3" px-3 v-if="item.variant">
            <v-text-field
              v-model="item.units"
              type="number"
              label="Units"
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="text-center">
            <v-btn depressed :disabled="!addBtn" @click.stop="addToList"
              >Add</v-btn
            >
          </v-col>
        </v-row>
        <v-col v-if="message" mb-3 cols="12" md="6" offset-md="3">
          <v-alert
            :value="true"
            v-if="message.slice(0, 1) === 'e'"
            :type="'error'"
            >Operation Failed</v-alert
          >
          <v-alert :value="true" v-else :type="'success'"
            >Operation Successful</v-alert
          >
        </v-col>
      </v-col>
      <v-col cols="12">
        <v-data-table
          sort-by
          :headers="header"
          :items="order.items"
          class="elevation-3"
        >
          <template v-slot:item.rate="{ item }">{{
            item.cash ? item.cash : item.credit / item.units
          }}</template>
          <template v-slot:item.actions="{ item }">
            <v-btn @click.stop="deleteItems(item)" small text icon>
              <v-icon color="error">mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:footer>
            <v-divider></v-divider>
            <td>
              items:
              <strong>{{ items }}</strong>
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
          </template>
        </v-data-table>
      </v-col>
      <v-dialog v-model="modal" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">Delete this Order?</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error darken-1" text @click="deleteOrder"
              >Delete</v-btn
            >
            <v-btn color="green darken-1" text @click="modal = false"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-if="invoice_no && userState.post !== 'mo'"
        v-model="confirm"
        persistent
        max-width="290"
      >
        <v-card>
          <v-card-title class="headline">Confirm Order?</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error darken-1" text @click="confirmOrder"
              >Confirm</v-btn
            >
            <v-btn color="green darken-1" text @click="confirm = false"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-col class="text-center" my-3 cols="12">
        <v-btn dark class="mx-2" @click="modal = !modal" depressed color="error"
          >Delete</v-btn
        >
        <v-btn
          class="mx-2"
          v-if="userState.post !== 'mo' && invoice_no"
          @click="confirm = !confirm"
          depressed
          color="success"
          >Confirm</v-btn
        >
        <v-btn
          class="mx-2"
          v-if="userState.post == 'mo' && userState.uid == order.mo"
          @click.stop="saveOrder"
          depressed
          color="success"
          dark
          >Save</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import Datefield from "@/components/Datefield";
import firebase from "../../firebaseConfig";
const db = firebase.firestore();
export default {
  components: {
    Datefield
  },
  data() {
    return {
      invoice_no: null,
      item: {
        product: null,
        variant: null,
        price: 0,
        cash: 1,
        units: 1
      },
      confirm_date: null,
      order: null,
      modal: false,
      confirm: false,
      addBtn: false,
      message: false,
      challans: [],
      header: [
        {
          text: "Product",
          value: "product"
        },
        {
          text: "Size",
          value: "size"
        },
        {
          text: "Rate",
          value: "rate"
        },
        {
          text: "Units",
          value: "units"
        },
        {
          text: "Cash",
          value: "cash"
        },
        {
          text: "Credit",
          value: "credit"
        },
        {
          text: "Actions",
          align: "center",
          value: "actions",
          sortable: false
        }
      ]
    };
  },
  computed: {
    ...mapGetters(["userState", "products"]),

    submittedDate() {
      return this.order.submitted.toDate();
    },

    items() {
      var total = 0;
      var list = this.order.items;
      for (var i = 0; i < list.length; i++) {
        total += list[i].units;
      }
      return total;
    },
    cash() {
      var total = 0;
      var list = this.order.items;
      for (var i = 0; i < list.length; i++) {
        total += list[i].cash;
      }
      return total;
    },
    credit() {
      var total = 0;
      var list = this.order.items;
      for (var i = 0; i < list.length; i++) {
        total += list[i].credit;
      }
      return total;
    }
  },
  methods: {
    setDate(val) {
      this.confirm_date = val;
    },
    async deleteItems(item) {
      try {
        const index = this.order.items.indexOf(item);
        this.order.items.splice(index, 1);
      } catch (error) {
        alert(error.message);
      }
    },
    async deleteOrder() {
      try {
        await db
          .collection("invoices")
          .doc(this.$route.params.order_id)
          .delete();
        this.$router.replace("/orders");
      } catch (error) {
        alert(error.message);
      }
    },
    async fetchOrders() {
      try {
        const doc = await db
          .collection("invoices")
          .doc(this.$route.params.order_id)
          .get();

        if (doc.exists) {
          if (doc.data().confirmed === false) {
            this.order = doc.data();
          } else {
            this.$router.replace("/orders");
          }
        } else this.$router.replace("/orders");
      } catch (error) {
        alert(error.message);
      }
    },

    async addToList() {
      const newItem = {
        product: this.item.product.name,
        product_obj: this.item.product,
        cash: this.item.cash ? this.item.price * parseInt(this.item.units) : 0,
        credit: this.item.cash
          ? 0
          : this.item.price * parseInt(this.item.units),
        size: this.item.variant.size,
        index: this.item.product.variants.indexOf(this.item.variant),
        units: parseInt(this.item.units)
      };

      this.order.items.push(newItem);
      this.item.product = null;
    },
    saveOrder() {
      db.collection("invoices")
        .doc(this.$route.params.order_id)
        .update({
          items: this.order.items
        })
        .then(
          () => {
            this.message = "success: saved succesfully!";
          },
          error => (this.message = `error: ${error.message}`)
        );
    },

    confirmOrder: function() {
      db.collection("invoices")
        .doc(this.$route.params.order_id)
        .update({
          confirmed: true,
          confirmed_at: new Date(this.confirm_date),
          cash_payable: this.cash,
          credit_payable: this.credit,
          items: this.order.items,
          invoice_no: this.invoice_no
        })
        .then(
          () => {
            this.$router.replace("/orders");
          },
          error => alert(error.message)
        );
    }
  },
  watch: {
    "item.product": function(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.item.variant = null;
      }
    },
    "item.variant": function(newVal) {
      if (!newVal) {
        (this.item.price = 0), (this.item.units = 1);
      } else {
        this.item.price = this.item.cash
          ? newVal.cash_price
          : newVal.credit_price;
      }
    },
    "item.cash": function(newVal) {
      const pack = this.item.variant;
      this.item.price = newVal ? pack.cash_price : pack.credit_price;
    },

    item: {
      deep: true,
      handler(newval) {
        if (newval.product && newval.variant && newval.units && newval.price) {
          this.addBtn = true;
        } else {
          this.addBtn = false;
        }
      }
    },
    message(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.message = null;
        }, 4000);
      }
    }
  },
  created() {
    this.fetchOrders();
  }
};
</script>
