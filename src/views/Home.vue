<template>
  <v-container fluid>
    <v-container>
      <v-row>
        <v-col cols="6" sm="4">
          Total cash:
          <h1 class="display-1">
            {{ totalCash }}
            <span style="font-size:18px;">tk</span>
          </h1>
        </v-col>
        <v-col cols="6" sm="4">
          Paid Cash:
          <h1 class="display-1">
            {{ cashPaid }}
            <span style="font-size:18px;">tk</span>
          </h1>
        </v-col>
        <v-col cols="6" sm="4">
          Due Cash:
          <h1 v-if="totalCash - cashPaid >= 0" class="display-1">
            {{ totalCash - cashPaid }}
            <span style="font-size:18px;">tk</span>
          </h1>
          <h1 v-else class="display-1">
            0
            <span style="font-size:18px;">tk</span>
          </h1>
        </v-col>
        <v-col cols="6" sm="4">
          Total credit:
          <h1 class="display-1">
            {{ totalCredit }}
            <span style="font-size:18px;">tk</span>
          </h1>
        </v-col>
        <v-col cols="6" sm="4">
          Paid Credit:
          <h1 class="display-1">
            {{ creditPaid }}
            <span style="font-size:18px;">tk</span>
          </h1>
        </v-col>
        <v-col v-if="totalCredit - creditPaid >= 0" cols="6" sm="4">
          Due Credit:
          <h1 class="display-1">
            {{ totalCredit - creditPaid }}
            <span style="font-size:18px;">tk</span>
          </h1>
        </v-col>
        <v-col v-else cols="6" sm="4">
          Due Credit:
          <h1 class="display-1">
            0
            <span style="font-size:18px;">tk</span>
          </h1>
        </v-col>
      </v-row>
    </v-container>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :loading="loader"
          sort-by
          :headers="Headers"
          :items="overviewList"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Overview</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-row>
                <v-col class="pa-0 py-1 py-sm-0" cols="12" sm="5">
                  from:
                  <Datefield @changedVal="setStart" :value="startDate" />
                </v-col>
                <v-col class="pa-0 py-1 py-sm-0" cols="8" sm="5">
                  to:
                  <Datefield @changedVal="setEnd" :value="endDate" />
                </v-col>
                <v-col class="pa-0 py-1 py-sm-0" cols="2">
                  <v-btn class="primary" @click="fetchOverviews(range)">
                    <v-icon>mdi-magnify</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-toolbar>
          </template>
          <template v-slot:item.dealer="{ item }"
            >{{ item.dealer.code }}. {{ item.dealer.name }}</template
          >
          <template v-slot:item.credit_payable="{ item }">
            <span v-if="item.total_credit - item.credit_paid >= 0">{{
              Math.round(item.total_credit - item.credit_paid)
            }}</span>
            <span v-else>0</span>
          </template>
          <template v-slot:item.cash_payable="{ item }">
            <span v-if="item.total_cash - item.cash_paid >= 0">{{
              Math.round(item.total_cash - item.cash_paid)
            }}</span>
            <span v-else>0</span>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "../firebaseConfig";
import Datefield from "../components/Datefield";
const db = firebase.firestore();
export default {
  components: {
    Datefield
  },
  data: () => ({
    loader: false,
    overviewList: [],
    range: {
      start: null,
      end: null
    },
    Headers: [
      {
        text: "Dealer",
        align: "left",
        sortable: false,
        value: "dealer"
      },
      { text: "Total Cash", value: "total_cash" },
      { text: "Cash Paid", value: "cash_paid" },
      { text: "Due Cash", value: "cash_payable" },
      { text: "Total Credit", value: "total_credit" },
      { text: "Credit Paid", value: "credit_paid" },
      { text: "Due Credit", value: "credit_payable" },
      { text: "Marketing Officer", value: "marketingOfficer.name" }
    ]
  }),

  computed: {
    startDate() {
      let time = new Date();
      time = time.setMonth(time.getMonth() - 1);
      return time;
    },
    endDate() {
      return new Date();
    },
    user() {
      return this.$store.getters.userState;
    },
    totalCash() {
      let total = 0;
      this.overviewList.forEach(doc => {
        total += doc.total_cash;
      });
      return total;
    },
    totalCredit() {
      let total = 0;
      this.overviewList.forEach(doc => {
        total += doc.total_credit;
      });
      return total;
    },
    cashPaid() {
      let total = 0;
      this.overviewList.forEach(doc => {
        total += doc.cash_paid;
      });
      return total;
    },
    creditPaid() {
      let total = 0;
      this.overviewList.forEach(doc => {
        total += doc.credit_paid;
      });
      return total;
    }
  },
  methods: {
    setStart(e) {
      this.range.start = e;
    },
    setEnd(e) {
      this.range.end = e;
    },
    async fetchOverviews(time) {
      try {
        this.overviewList = [];
        this.loader = true;
        if (this.user.post === "mo") {
          const response = await this.rawOverviews(
            new Date(time.start),
            new Date(time.end),
            this.user.uid
          );
          this.overviewList = response;
        } else if (this.user.post === "am") {
          const mofcQuerySnap = await db
            .collection("user")
            .where("supirior", "==", this.user.uid)
            .get();
          const promises = [];
          mofcQuerySnap.forEach(doc => {
            const promise = this.rawOverviews(
              new Date(time.start),
              new Date(time.end),
              doc.id
            );
            promises.push(promise);
          });
          const responses = await Promise.all(promises);
          responses.forEach(response => {
            response.forEach(doc => {
              this.overviewList.push(doc);
            });
          });
        }
        this.loader = false;
      } catch (error) {
        this.loader = false;
        alert(error.message);
      }
    },
    async rawOverviews(start, end, mo) {
      try {
        const marketingOfficer = await db
          .collection("user")
          .doc(mo)
          .get();
        const dealersQuerySnap = await db
          .collection("dealers")
          .where("mo", "==", mo)
          .get();
        const dealers = [];
        dealersQuerySnap.forEach(doc => {
          dealers.push({ id: doc.id, data: doc.data() });
        });
        const invoiceQuerySnap = db
          .collection("invoices")
          .where("mo", "==", mo)
          .where("confirmed", "==", true)
          .where("confirmed_at", ">=", start)
          .where("confirmed_at", "<=", end)
          .orderBy("confirmed_at", "desc")
          .get();

        const trxQuerySnap = db
          .collection("transactions")
          .where("mo", "==", mo)
          .where("date", ">=", start)
          .where("date", "<=", end)
          .orderBy("date", "desc")
          .get();

        const querySnaps = await Promise.all([invoiceQuerySnap, trxQuerySnap]);
        const querySnapData = [];

        querySnaps.forEach(querySnap => {
          const temp = [];
          querySnap.forEach(doc => {
            temp.push({ data: doc.data(), id: doc.id });
          });
          querySnapData.push(temp);
        });
        const dealersOverview = [];
        dealers.forEach(dealer => {
          const filteredData = querySnapData.map(item =>
            item.filter(doc => doc.data.dealer.id === dealer.id)
          );
          let credit = 0;
          let cash = 0;
          let credit_paid = 0;
          let cash_paid = 0;
          filteredData[0].forEach(doc => {
            credit += doc.data.credit_payable;
            cash += doc.data.cash_payable;
          });
          filteredData[1].forEach(doc => {
            cash_paid += doc.data.cash ? doc.data.amount : 0;
            credit_paid += doc.data.cash ? 0 : doc.data.amount;
          });
          dealersOverview.push({
            dealer: {
              id: dealer.id,
              name: dealer.data.name,
              code: dealer.data.code,
              address: dealer.data.address
            },
            total_cash: cash,
            total_credit: credit,
            credit_paid: credit_paid,
            cash_paid: cash_paid,
            marketingOfficer: marketingOfficer.data()
          });
        });
        return dealersOverview;
      } catch (error) {
        alert(error.message);
      }
    }
  },

  mounted() {
    this.fetchOverviews({
      start: this.startDate,
      end: this.endDate
    });
    if (this.user.post === "mo") {
      this.Headers.splice(8, 1);
    }
  }
};
</script>
