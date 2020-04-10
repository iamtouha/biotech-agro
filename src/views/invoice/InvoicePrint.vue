<template>
  <v-container id="pdfInvoice fill-height">
    <v-row>
      <v-list two-line class="mx-auto transparent" max-width="360px">
        <v-list-item>
          <v-list-item-avatar class="ma-0 pa-0" size="60">
            <img
              @load="checkPrintable"
              ref="invLogo"
              class="float-left"
              src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA3MjAgNzIwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA3MjAgNzIwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwO30NCjwvc3R5bGU+DQo8Zz4NCgk8ZWxsaXBzZSBjbGFzcz0ic3QwIiBjeD0iMzY0IiBjeT0iMzYzIiByeD0iMjM2LjUiIHJ5PSIxMzQuNSIvPg0KCTxlbGxpcHNlIGNsYXNzPSJzdDAiIGN4PSIzNjQiIGN5PSIzNjMiIHJ4PSIyMzYuNSIgcnk9IjEzNC41Ii8+DQoJPGc+DQoJCTxwYXRoIGQ9Ik01MDMuOCwyMzMuMWw0MC4xLTY0LjNMNTI2LDE1Ny42bC00Mi43LDY4LjNjLTYuNC0yLTEzLTMuOS0xOS44LTUuNmw0NS4zLTcyLjVMNDkxLDEzNi42bC00OS4zLDc4LjkNCgkJCWMtNi44LTEuMy0xMy43LTIuNC0yMC44LTMuM2w1NC04Ni40TDQ1NywxMTQuNmwtNTkuNCw5NS4xYy0xMC43LTAuOC0yMS42LTEuMi0zMi42LTEuMmMtMTQxLjEsMC0yNTUuNSw2OC43LTI1NS41LDE1My41DQoJCQljMCw1NC4zLDQ3LDEwMi4xLDExNy44LDEyOS4zTDE4Niw1NTcuNWwxNy45LDExLjJsNDMuOS03MC4yYzYuMywyLDEyLjgsMy44LDE5LjUsNS40TDIxOS43LDU4MGwxNy45LDExLjJsNTEuNi04Mi41DQoJCQljNi45LDEuMywxNCwyLjQsMjEuMiwzLjNsLTU1LjIsODguNGwxNy45LDExLjJsNjAuNy05Ny4yYzEwLjMsMC44LDIwLjcsMS4xLDMxLjMsMS4xYzE0MS4xLDAsMjU1LjUtNjguNywyNTUuNS0xNTMuNQ0KCQkJQzYyMC41LDMwOCw1NzQsMjYwLjQsNTAzLjgsMjMzLjF6IE0zNjQsNDk3LjVjLTEzMC42LDAtMjM2LjUtNjAuMi0yMzYuNS0xMzQuNVMyMzMuNCwyMjguNSwzNjQsMjI4LjVTNjAwLjUsMjg4LjcsNjAwLjUsMzYzDQoJCQlTNDk0LjYsNDk3LjUsMzY0LDQ5Ny41eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPHBhdGggZD0iTTE3Nyw0MDYuM2wyOC4xLTEwMC42aDU2YzEyLjYsMCwyMi4xLDEuNSwyOC40LDQuNmM3LjksMy43LDEwLjgsOS43LDguNSwxNy43Yy0xLjgsNi42LTcsMTIuMS0xNS40LDE2LjQNCgkJCWMtNy40LDMuOC0xNi40LDYuMy0yNi44LDcuMmwtMC40LDEuM2MxMC4yLDAuNywxOC4yLDIuNiwyMy44LDUuNmM3LjksNC4zLDEwLjcsMTAuNiw4LjQsMTguOGMtMi43LDkuNi0xMC4yLDE2LjktMjIuNywyMi4yDQoJCQljLTEwLjgsNC41LTIzLjQsNi44LTM3LjksNi44SDE3N3ogTTIzNS4yLDMxNC40bC05LjcsMzQuN2g2LjdjNCwwLDcuNi0wLjIsMTAuNS0wLjdjMy0wLjUsNS45LTEuNSw4LjctMi45DQoJCQljMy43LTEuOSw2LjctNC4xLDguOS02LjhjMi4zLTIuNiwzLjgtNS41LDQuNy04LjVjMS41LTUuMiwwLjUtOS4yLTIuNy0xMi4xYy0zLjMtMi44LTguNi00LjMtMTUuOS00LjMNCgkJCUMyNDMsMzEzLjgsMjM5LjIsMzE0LDIzNS4yLDMxNC40eiBNMjIzLjEsMzU3LjdsLTExLjIsNDAuMWgxMC44YzYuNSwwLDEyLjktMS43LDE5LjEtNS4yYzYuMy0zLjUsMTAuMi04LjIsMTEuOS0xNC4xDQoJCQljMi4xLTcuNywwLjUtMTMuMi01LTE2LjRDMjQ0LDM1OS4xLDIzNS40LDM1Ny43LDIyMy4xLDM1Ny43eiIvPg0KCQk8cGF0aCBkPSJNMzExLjksNDA3bDI4LjMtMTAxLjRjMi41LDAsNS42LDAuMSw5LjQsMC40YzMuOCwwLjIsNiwwLjQsNi42LDAuNGMyLjUsMCw0LjUsMCw2LjEtMC4xYzYuMy0wLjQsOS44LTAuNiwxMC40LTAuNg0KCQkJTDM0NC41LDQwN2MtMi41LDAtNC41LTAuMS02LTAuMWMtNi4xLTAuNC05LjUtMC42LTEwLTAuNmMtMi41LDAtNS43LDAuMS05LjYsMC40QzMxNC44LDQwNi45LDMxMi41LDQwNywzMTEuOSw0MDd6Ii8+DQoJCTxwYXRoIGQ9Ik01NTIuMiwzNTUuNWMtNC4yLDE1LTE1LjMsMjcuNS0zMy4yLDM3LjVjLTE4LjksMTAuNS00MS4yLDE1LjgtNjcuMSwxNS44Yy0yNC40LDAtNDIuNi00LjYtNTQuNi0xMy45DQoJCQljLTEyLTkuMi0xNS42LTIyLjItMTEtMzguOGM0LjMtMTUuMywxNS4yLTI3LjgsMzIuOS0zNy42YzE4LjUtMTAuMyw0MS0xNS41LDY3LjUtMTUuNWMyOC4xLDAsNDcuNSw1LjksNTguNCwxNy43DQoJCQlDNTUzLjYsMzMwLjIsNTU2LDM0MS44LDU1Mi4yLDM1NS41eiBNNDgyLjgsMzExLjljLTE1LjUsMC0yOC40LDMuOS0zOC43LDExLjhjLTEwLjgsOC4zLTE4LjUsMjAuNS0yMy4xLDM2LjcNCgkJCWMtMywxMC44LTIuMSwxOS44LDIuOSwyN2M1LjgsOC40LDE2LjIsMTIuNSwzMS40LDEyLjVjMTUuOCwwLDI5LjMtNC44LDQwLjctMTQuM2MxMC4yLTguNywxNy4yLTE5LjYsMjAuOS0zMi45DQoJCQljMy0xMC45LDIuMS0yMC4xLTIuNy0yNy42QzUwOC40LDMxNi4zLDQ5OCwzMTEuOSw0ODIuOCwzMTEuOXoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
            />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="display-1"
              >Biotech Agrovat</v-list-item-title
            >
            <v-list-item-subtitle class="black--text"
              >10 Arambag, Dhaka-1000</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-row>
    <v-row>
      <v-col cols="6">
        <p class="mb-0">
          Invoice No:
          <b class="mr-2">{{ invoice.invoice_no }}</b>
        </p>
        <p class="mb-0">
          Order No:
          <b>{{ invoice.order_no }}</b>
        </p>
        <p class="mb-0">
          Dealer:
          <b class="mr-2">{{ invoice.dealer.name }}</b>
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
    </v-row>
    <v-data-table
      dense
      class="printableTable"
      :items-per-page="99"
      hide-default-footer
      sort-by
      :headers="header"
      :items="invoice.items"
    >
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
            <strong>{{ invoice.cash_payable }}</strong>
          </td>
          <td>
            <strong>{{ invoice.credit_payable }}</strong>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-row>
      <v-col class="mt-4" offset="6" cols="6">
        <v-simple-table dense="">
          <template v-slot:default>
            <thead>
              <tr>
                <th colspan="2">
                  Invoice summery
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>invoice total</td>
                <td>
                  {{
                    (
                      invoice.cash_payable + invoice.credit_payable
                    ).toLocaleString()
                  }}/- tk
                </td>
              </tr>
              <tr>
                <td>total due cash</td>
                <td>{{ trx.dueCash.toLocaleString() }}/- tk</td>
              </tr>
              <tr>
                <td>total due credit</td>
                <td>{{ trx.dueCredit.toLocaleString() }}/- tk</td>
              </tr>
              <tr style="font-weight:bold;">
                <td>total due</td>
                <td>
                  {{ (trx.dueCash + trx.dueCredit).toLocaleString() }}/- tk
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
    <v-footer class="transparent mt-5">
      <v-col cols="4" class="text-center">Customer's signature</v-col>
      <v-col cols="4" class="text-center">Officer's signature</v-col>
      <v-col cols="4" class="text-center">signature of Incharge</v-col>
    </v-footer>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
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
          text: "Cash (Tk)",
          value: "cash"
        },
        {
          text: "Credit (Tk)",
          value: "credit"
        }
      ]
    };
  },
  computed: {
    invoice() {
      return this.$route.params.invoice;
    },
    trx() {
      return this.$route.params.trx;
    },
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
    checkPrintable() {
      if (this.invoice) this.printInv();
      else this.$router.push("/invoices");
    },
    printInv() {
      window.print();
      setTimeout(() => {
        this.$router.push({
          name: "invoice",
          params: {
            invoice: this.invoice,
            invoice_id: this.invoice.id
          }
        });
      }, 100);
    }
  }
};
</script>
<style lang="scss">
.printableTable {
  table thead th {
    color: black !important;
  }
}
</style>
