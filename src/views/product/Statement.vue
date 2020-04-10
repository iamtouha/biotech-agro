<template>
  <v-container fluid>
    <v-card tile full-width>
      <v-card-title>
        Sales Statement
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-autocomplete
              return-object
              v-model="dealer"
              item-text="name"
              :items="dealers"
              clearable
              hide-details
              :filter="filter"
              label="Select Dealer"
            >
              <template v-slot:item="{ item }">
                {{ item.code }}. {{ item.name }}
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-select
              clearable
              hide-details
              v-if="userState.post !== 'mo'"
              :items="officers"
              item-text="name"
              v-model="officer"
              return-object
              label="select officer"
            ></v-select>
          </v-col>
          <v-col cols="6" sm="4">
            from
            <date-field @changedVal="setStart" :value="startDate"></date-field>
          </v-col>
          <v-col cols="6" sm="4">
            to <date-field @changedVal="setEnd" :value="endDate"></date-field>
          </v-col>
          <v-col v-if="!printMode" cols="12" sm="4">
            <v-btn large tile @click="getInvoices" class="primary" elevation="0"
              >get statement</v-btn
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-data-table
      :items-per-page="15"
      sort-by="product"
      dense
      class="mt-3 full-width"
      :items="statementObj"
      :headers="fields"
    >
      <template v-slot:body.append>
        <tr>
          <td colspan="2">
            <b> total sales = {{ totalCash + totalCredit }} tk</b>
          </td>
          <td>
            <b> {{ totalUnit }} </b>
          </td>
          <td>
            <b> {{ totalCash }} tk</b>
          </td>
          <td>
            <b> {{ totalCredit }} tk</b>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import firebase from "../../firebaseConfig";
import dateField from "@/components/Datefield.vue";
import { mapGetters } from "vuex";
const db = firebase.firestore();
export default {
  components: { dateField },
  data() {
    return {
      dealer: null,
      officer: null,
      officers: [],
      invoices: [],
      range: {
        start: null,
        end: null
      },
      fields: [
        { text: "product", value: "product" },
        { text: "size", value: "size" },
        { text: "Units Sold", value: "units" },
        { text: "Cash", value: "cash" },
        { text: "Credit", value: "credit" }
      ]
    };
  },
  watch: {
    officer: function(newVal) {
      if (newVal) {
        this.dealer = null;
      }
    },
    dealer: function(newVal) {
      if (newVal) {
        this.officer = null;
      }
    }
  },
  computed: {
    ...mapGetters(["userState", "dealers", "products", "printMode"]),
    statementObj() {
      const statements = [];
      const included = (product, size) => {
        const result = statements.filter(statement => {
          return statement.product === product && statement.size === size;
        });
        return result[0];
      };
      this.invoices.forEach(invoice => {
        invoice.items.forEach(item => {
          const prevItem = included(item.product, item.size);
          if (prevItem) {
            prevItem.units += item.units;
            prevItem.cash += item.cash;
            prevItem.credit += item.credit;
          } else {
            const { product, size, cash, credit, units } = item;
            statements.push({ product, size, cash, credit, units });
          }
        });
      });
      return statements;
    },
    totalCash() {
      return this.statementObj.reduce((acc, cr) => {
        acc += cr.cash;
        return acc;
      }, 0);
    },
    totalCredit() {
      return this.statementObj.reduce((acc, cr) => {
        acc += cr.credit;
        return acc;
      }, 0);
    },
    totalUnit() {
      return this.statementObj.reduce((acc, cr) => {
        acc += cr.units;
        return acc;
      }, 0);
    },
    startDate() {
      let time = new Date();
      time = time.setMonth(time.getMonth() - 1);
      return time;
    },
    endDate() {
      return new Date();
    }
  },
  methods: {
    filter: function(item, text) {
      return (
        parseInt(text) === parseInt(item.code) ||
        item.name.toLowerCase().includes(text.toLowerCase())
      );
    },
    setStart(e) {
      this.range.start = e;
    },
    setEnd(e) {
      this.range.end = e;
    },
    getInvoices: async function() {
      console.log("loading..");
      this.invoices = [];
      let ref = db
        .collection("invoices")
        .where("confirmed_at", ">=", this.range.start)
        .where("confirmed_at", "<=", this.range.end)
        .where("confirmed", "==", true);
      try {
        if (this.officer) ref = ref.where("mo", "==", this.officer.id);
        else if (this.dealer) ref = ref.where("dealerId", "==", this.dealer.id);
        else ref = ref.where(this.userState.post, "==", this.userState.uid);
        const querySnapshot = await ref.get();
        querySnapshot.forEach(doc => {
          this.invoices.push({ id: doc.id, ...doc.data() });
        });
      } catch (error) {
        console.log(error);
        alert(error.message);
      }
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
    if (this.userState.post !== "mo") this.getOfficers();
    this.getInvoices();
  }
};
</script>

<style></style>
