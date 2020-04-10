<template>
  <v-container fluid>
    <v-row v-if="userState.post === 'mo' && !printMode">
      <v-col cols="12">
        <v-data-table
          hide-default-footer
          class="mt-2"
          sort-by
          :headers="addTransactionHeaders"
          :items="newTransactions"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>New Transactions</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-dialog
                v-if="userState.post === 'mo'"
                v-model="dialog"
                width="500"
              >
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" dark v-on="on">Add New</v-btn>
                </template>
                <v-card>
                  <v-card-title class="headline" primary-title
                    >Add Transaction</v-card-title
                  >
                  <v-card-text>
                    <v-form ref="form">
                      <v-select
                        v-model="trx.dealer"
                        :items="dealers"
                        item-text="name"
                        return-object
                        item-value="id"
                        label="Dealers"
                        required
                      ></v-select>
                      <v-text-field
                        type="number"
                        v-model="trx.mr_no"
                        label="Money receipt no."
                        required
                      ></v-text-field>
                      <v-text-field
                        type="number"
                        v-model="trx.amount"
                        label="Amount(tk)"
                        required
                      ></v-text-field
                      >Payment for:
                      <v-btn-toggle
                        class="elevation-0 mt-3 mb-5"
                        v-model="trx.cash"
                      >
                        <v-btn :value="1" small>Cash</v-btn>
                        <v-btn :value="0" small>Credit</v-btn>
                      </v-btn-toggle>
                      <br />
                      <Datefield
                        field="Date"
                        @changedVal="e => (trx.date = e)"
                        :value="trx.date"
                      />
                    </v-form>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="trx.dealer && trx.amount && trx.mr_no"
                      color="primary darken-1"
                      text
                      @click="addToList"
                      >Add</v-btn
                    >
                    <v-btn color="error darken-1" text @click="dialog = false"
                      >Cancel</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.date="{ item }">
            {{ item.date.getDate() }}-{{ item.date.getMonth() + 1 }}-{{
              item.date.getFullYear()
            }}
          </template>
          <template v-slot:item.dealer="{ item }"
            >{{ item.dealer.code }}. {{ item.dealer.name }}</template
          >
          <template v-slot:item.cash="{ item }">
            {{ item.cash ? "Cash" : "Credit" }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn fab @click="deleteTrx(item)" text small>
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
      <v-col cols="12" class="text-center">
        <v-dialog
          v-if="newTransactions.length"
          v-model="confirmation"
          max-width="290"
        >
          <template v-slot:activator="{ on }">
            <v-btn color="success" dark v-on="on">Submit</v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">Submit?</v-card-title>
            <v-card-text>Once submitted, It cannot be deleted.</v-card-text>
            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn text @click="confirmation = false">Cancel</v-btn>
              <v-btn color="primary darken-1" text @click="addTrx"
                >proceed</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
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
      dense
      :items-per-page="15"
      :loading="loader"
      sort-by
      :headers="header"
      :items="filteredTrxs"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>Transactions</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <Datefield field="from" @changedVal="setStart" :value="startDate" />
          <Datefield field="to" @changedVal="setEnd" />
          <v-btn
            v-if="!printMode"
            tile
            small
            elevation="0"
            class="primary"
            @click="fetchTrx()"
          >
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.dealer="{ item }"
        >{{ item.dealer.code }}. {{ item.dealer.name }}</template
      >
      <template v-slot:item.date="{ item }">
        {{ getTime(item.date) }}
      </template>

      <template v-slot:item.cash="{ item }">
        {{ item.cash ? "Cash" : "Credit" }}
      </template>
      <template v-slot:body.append>
        <tr>
          <th>cash = {{ total.cash }}/- tk</th>
          <th colspan="2">credit = {{ total.credit }}/- tk</th>
        </tr>
      </template>
      <template v-if="!printMode" v-slot:item.actions="{ item }">
        <v-btn @click="deletePermanent(item)" icon small>
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig";
import Datefield from "@/components/Datefield";
import { mapGetters } from "vuex";

const db = firebase.firestore();
export default {
  components: {
    Datefield
  },
  data() {
    return {
      loader: false,
      range: {
        start: null,
        end: null
      },
      officers: [],
      mo: null,
      dealer: null,
      dialog: false,
      deleteModal: false,
      id: null,
      confirmation: false,
      editDate: null,
      trx: {
        dealer: null,
        amount: null,
        mr_no: null,
        cash: 1,
        date: `${new Date().getFullYear()}-${new Date().getMonth() +
          1}-${new Date().getDate()}`
      },

      addTransactionHeaders: [
        {
          text: "Dealer",
          align: "left",
          sortable: false,
          value: "dealer"
        },
        { text: "M.R. No.", value: "mr_no" },
        { text: "Amount", value: "amount" },
        { text: "For", value: "cash" },
        { text: "Date", value: "date" },
        { text: "Actions", value: "actions", sortable: false }
      ],
      transactionHeaders: [
        {
          text: "Dealer",
          align: "left",
          sortable: false,
          value: "dealer"
        },
        { text: "M.R. No.", value: "mr_no" },
        { text: "Amount", value: "amount" },
        { text: "For", value: "cash" },
        { text: "Date", value: "date" },
        {
          text: "Marketing Officer",
          value: "marketing_officer"
        },
        { text: "Actions", value: "actions", sortable: false }
      ],
      transactions: [],
      newTransactions: [],
      dues: []
    };
  },
  computed: {
    ...mapGetters(["printMode", "userState", "dealers"]),
    startDate() {
      let time = new Date();
      time = time.setMonth(time.getMonth() - 1);
      return time;
    },
    header() {
      const hdr = [...this.transactionHeaders];
      if (this.userState.post === "mo" || this.printMode) hdr.pop();
      return hdr;
    },
    filteredTrxs: function() {
      if (this.dealer) {
        return this.transactions.filter(item => {
          return item.dealerId === this.dealer;
        });
      } else if (this.mo) {
        return this.transactions.filter(item => {
          return item.mo === this.mo;
        });
      } else return this.transactions;
    },
    total() {
      let total_cash = 0;
      let total_credit = 0;
      this.filteredTrxs.forEach(trx => {
        if (trx.cash) total_cash += trx.amount;
        else total_credit += trx.amount;
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
    getTime(time) {
      time = time
        .toDate()
        .toString()
        .split(" ");
      const string = time.reduce((acc, cr, index) => {
        if (index > 0 && index < 4)
          if (index === 3) acc += ", " + cr;
          else acc += " " + cr;
        return acc;
      }, "");
      return string;
    },
    async fetchTrx() {
      try {
        this.loader = true;
        const ref = db
          .collection("transactions")
          .where("date", ">=", new Date(this.range.start))
          .where("date", "<=", new Date(this.range.end))
          .orderBy("date", "desc");
        const querySnapshot = await ref
          .where(this.userState.post, "==", this.userState.uid)
          .get();
        this.transactions = [];
        querySnapshot.forEach(doc => {
          this.transactions.push({ id: doc.id, ...doc.data() });
        });
        this.loader = false;
      } catch (error) {
        this.loader = false;
        console.log(error);

        alert(error.message);
      }
    },
    addToList() {
      this.newTransactions.push({
        dealer: this.trx.dealer,
        mr_no: this.trx.mr_no,
        amount: parseFloat(this.trx.amount),
        cash: this.trx.cash ? true : false,
        mo: this.userState.uid,
        am: this.userState.supirior,
        date: new Date(this.trx.date),
        added: new Date(),
        marketing_officer: this.userState.name
      });
      this.trx = {
        dealer: null,
        amount: null,
        mr_no: null,
        cash: 1,
        date: `${new Date().getFullYear()}-${new Date().getMonth() +
          1}-${new Date().getDate()}`
      };
      this.dialog = false;
    },
    async addTrx() {
      try {
        const batch = db.batch();
        this.newTransactions.forEach(item => {
          const docRef = db.collection("transactions").doc();
          batch.set(docRef, item);
        });
        batch.commit().then(async () => {
          await this.fetchTrx();
          this.confirmation = false;
          this.newTransactions = [];
        });
      } catch (error) {
        alert(error.message);
      }
    },
    deleteTrx(obj) {
      const index = this.newTransactions.indexOf(obj);
      this.newTransactions.splice(index, 1);
    },
    deletePermanent(item) {
      var trx = prompt("insert mr No. to delete");
      if (item.mr_no === trx) {
        db.collection("transactions")
          .doc(item.id)
          .delete()
          .then(() => {
            this.fetchTrx();
            alert("deleted transaction: " + item.id);
          });
      } else if (trx !== null) alert("Didn't match");
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
    this.fetchTrx();
    if (this.userState.post !== "mo") this.getOfficers();
  }
};
</script>
<style lang="scss" scoped></style>
