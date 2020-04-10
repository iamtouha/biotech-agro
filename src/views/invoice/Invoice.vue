<template>
  <v-container id="pdfInvoice">
    <v-row class="mb-5">
      <v-btn
        :loading="printLoading"
        v-if="invoice"
        elevation="0"
        outlined
        @click="printInvoice"
      >
        <v-icon>mdi-printer</v-icon>print invoice
      </v-btn>
    </v-row>

    <v-row v-if="invoice">
      <v-col cols="6">
        <p class="mb-0">
          Dealer:
          <b class="mr-2">{{ invoice.dealer.name }}</b>
        </p>
        <p class="mb-0">
          Invoice No:
          <b class="mr-2">{{ invoice.invoice_no }}</b>
        </p>
        <p class="mb-0">
          Order No:
          <b>{{ invoice.order_no }}</b>
        </p>
        <p class="mb-0">
          Address:
          <b>{{ invoice.dealer.address }}</b>
        </p>
        <p class="mb-0">
          Marketing Officer:
          <b>{{ invoice.marketing_officer }}</b>
        </p>
      </v-col>
      <v-col cols="6" class="text-right">
        <p class="mb-0">
          Submitted:
          <b>{{ submittedAt }}</b>
        </p>
        <p>
          Confirmed:
          <b>{{ confirmedAt }}</b>
        </p>
      </v-col>
      <v-col style="overflow:auto; width:800px;" cols="12">
        <v-data-table sort-by :headers="header" :items="invoice.items">
          <template v-slot:item.rate="{ item }">
            {{ item.cash ? item.cash / item.units : item.credit / item.units }}
          </template>
          <template v-slot:body.append>
            <tr>
              <td class="font-weight-bold">Total:</td>
              <td></td>
              <td></td>
              <td>
                <strong>{{ item }}</strong>
              </td>
              <td>
                <strong>{{ invoice.cash_payable }}tk</strong>
              </td>
              <td>
                <strong>{{ invoice.credit_payable }}tk</strong>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig";
const db = firebase.firestore();

export default {
  data() {
    return {
      invoice: null,
      printLoading: false,
      header: [
        {
          text: "Product",
          sortable: false,
          value: "product"
        },
        {
          text: "Size",
          value: "size",
          sortable: false
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
        }
      ]
    };
  },
  computed: {
    item() {
      var total = 0;
      var list = this.invoice.items;
      for (var i = 0; i < list.length; i++) {
        total += list[i].units;
      }
      return total;
    },
    confirmedAt() {
      const time = this.invoice.confirmed_at.toDate();
      const month = time.getMonth();
      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "jun",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december"
      ];
      return `${time.getDate()} ${months[month]}, ${time.getFullYear()}`;
    },
    submittedAt() {
      const time = this.invoice.submitted.toDate();
      const month = time.getMonth();
      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "jun",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december"
      ];
      return `${time.getDate()} ${months[month]}, ${time.getFullYear()}`;
    }
  },
  methods: {
    async fetchInvoice() {
      try {
        const docSnap = await db
          .collection("invoices")
          .doc(this.$route.params.invoice_id)
          .get();
        this.invoice = docSnap.data();
      } catch (error) {
        alert(error.message);
        return error;
      }
    },
    printInvoice: async function() {
      const id = this.$route.params.invoice_id;
      this.printLoading = true;
      try {
        const responses = await Promise.all([
          db
            .collection("invoices")
            .where("dealerId", "==", this.invoice.dealerId)
            .where("confirmed", "==", true)
            .get(),
          db
            .collection("transactions")
            .where("dealerId", "==", this.invoice.dealerId)
            .get()
        ]);
        let dueCash = 0,
          dueCredit = 0,
          paidCash = 0,
          paidCredit = 0;
        responses[0].forEach(doc => {
          dueCash += doc.data().cash_payable;
          dueCredit += doc.data().credit_payable;
        });
        responses[1].forEach(doc => {
          const cash = doc.data().cash;
          if (cash) paidCash += doc.data().amount;
          else paidCredit += doc.data().amount;
        });
        this.printLoading = false;

        this.$router.push({
          name: "inv-print",

          params: {
            invoice: { ...this.invoice, id },
            trx: {
              dueCash: dueCash - paidCash,
              dueCredit: dueCredit - paidCredit
            }
          }
        });
      } catch (error) {
        this.printLoading = false;

        console.log(error);
        alert(error);
      }
    }
  },
  async created() {
    if (this.$route.params.invoice) {
      this.invoice = this.$route.params.invoice;
    } else {
      await this.fetchInvoice();
    }
  }
};
</script>
