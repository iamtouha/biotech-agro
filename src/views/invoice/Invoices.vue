<template>
  <v-container fluid>
    <v-row>
      <v-col class="pa-1" cols="6">
        <v-autocomplete
          solo
          clearable
          label="all dealers"
          item-value="id"
          v-model="dealer"
          :items="dealers"
          item-text="name"
          hide-details
        >
        </v-autocomplete>
      </v-col>
      <v-col class="pa-1" cols="6">
        <v-select
          hide-details
          solo
          clearable
          v-model="mo"
          label="all marketing officers"
          :items="officers"
          item-text="name"
          item-value="id"
        ></v-select>
      </v-col>
    </v-row>
    <v-data-table
      :loading="loader"
      sort-by
      :items-per-page="15"
      dense
      :items="filteredInvoices"
      :headers="header"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>Invoices</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <Datefield field="from" @changedVal="setStart" :value="startDate" />
          <Datefield field="to" @changedVal="setEnd" />
          <v-btn
            v-if="!printMode"
            tile
            small
            elevation="0"
            class="primary"
            @click="getInvoices(range)"
          >
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.dealer.name="{ item }">
        <router-link :to="`invoices/${item.id}`"
          >{{ item.dealer.code }}. {{ item.dealer.name }}</router-link
        >
      </template>
      <template v-slot:item.confirmed_at="{ item }">
        {{ item.confirmed_at.toDate().getDate() }}-{{
          item.confirmed_at.toDate().getMonth() + 1
        }}-{{ item.confirmed_at.toDate().getFullYear() }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn @click="deleteItem(item)" icon small>
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
      <template v-slot:footer>
        <v-divider></v-divider>
        <p class="my-2 mx-1">
          Cash=
          <b>{{ total.cash }}</b
          >tk, Credit= <b>{{ total.credit }}</b
          >tk
        </p>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig";
import Datefield from "../../components/Datefield.vue";
import { mapGetters } from "vuex";

const db = firebase.firestore();
export default {
  components: {
    Datefield
  },
  data() {
    return {
      range: {
        start: null,
        end: null
      },
      modal: false,
      dealer: null,
      mo: null,
      officers: [],
      invoices: [],
      loader: false,
      headerFields: [
        { text: "Dealer", value: "dealer.name" },
        { text: "Invoice No.", value: "invoice_no" },
        { text: "Cash", value: "cash_payable" },
        { text: "Credit", value: "credit_payable" },
        { text: "Confirmed", value: "confirmed_at" },
        { text: "Marketing Officer", value: "marketing_officer" },
        { text: "Actions", value: "actions", sortable: false }
      ]
    };
  },
  watch: {
    mo: function(newVal) {
      if (newVal) {
        this.dealer = null;
      }
    },
    dealer: function(newVal) {
      if (newVal) {
        this.mo = null;
      }
    }
  },
  computed: {
    ...mapGetters(["printMode", "userState", "dealers"]),
    startDate() {
      let time = new Date();
      time = time.setMonth(time.getMonth() - 1);
      return time;
    },
    filteredInvoices: function() {
      if (this.dealer) {
        return this.invoices.filter(item => {
          return item.dealerId === this.dealer;
        });
      } else if (this.mo) {
        return this.invoices.filter(item => {
          return item.mo === this.mo;
        });
      } else return this.invoices;
    },
    header: function() {
      const arr = [...this.headerFields];
      if (this.userState.post === "mo") {
        arr.pop();
        arr.pop();
      }
      return arr;
    },
    total() {
      let total_cash = 0;
      let total_credit = 0;
      this.filteredInvoices.forEach(inv => {
        total_cash += inv.cash_payable;
        total_credit += inv.credit_payable;
      });
      return {
        cash: total_cash,
        credit: total_credit
      };
    }
  },
  methods: {
    setStart(e) {
      this.range.start = e;
    },
    setEnd(e) {
      this.range.end = e;
    },
    async getInvoices() {
      try {
        this.loader = true;
        this.invoices = [];
        const querySnapshot = await db
          .collection("invoices")
          .where(this.userState.post, "==", this.userState.uid)
          .where("confirmed_at", ">=", new Date(this.range.start))
          .where("confirmed_at", "<=", new Date(this.range.end))
          .where("confirmed", "==", true)
          .orderBy("confirmed_at", "desc")
          .get();
        querySnapshot.forEach(doc => {
          this.invoices.push({ id: doc.id, ...doc.data() });
        });

        this.loader = false;
      } catch (error) {
        alert(error.message);
        this.loader = false;
      }
    },
    deleteItem(item) {
      const input = prompt("Enter invoice No. to delete");
      if (input == item.invoice_no)
        db.collection("invoices")
          .doc(item.id)
          .delete()
          .then(() => {
            const index = this.invoices.indexOf(item);
            this.invoices.splice(index, 1);
          });
    },
    getOfficers: async function() {
      const promises = [];
      this.userState.mo.forEach(id => {
        promises.push(
          db
            .collection("user")
            .doc(id)
            .get()
        );
      });
      try {
        this.officers = (await Promise.all(promises)).map(doc => {
          return { id: doc.id, ...doc.data() };
        });
      } catch (error) {
        console.log(error);
      }
    }
  },

  mounted() {
    this.getInvoices();
    if (this.userState.post !== "mo") this.getOfficers();
  }
};
</script>
