<template>
  <v-container>
    <v-row v-if="challan.challan && challan.challan.length">
      <v-col cols="12" sm="6"> Challan: {{ challan.challan_no }} </v-col>
      <v-col cols="12" sm="6"> Date: {{ createdAt }} </v-col>
      <v-col cols="12">
        <v-list subheader>
          <template v-for="(item, index) in challan.challan">
            <v-list-item :key="101 + index">
              <v-list-item-content>
                <v-list-item-title>{{ item.product_name }}</v-list-item-title>
                <v-list-item-subtitle
                  v-for="(item_added, index2) in item.items_added"
                  :key="index2 - 200"
                  >{{ item_added.variant.size }}:
                  {{ item_added.units }}</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
            <v-divider
              v-if="index + 1 != challan.challan.length"
              :key="-1 - index"
            ></v-divider>
          </template>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "../../firebaseConfig";
import { mapGetters } from "vuex";
export default {
  data: () => ({
    challan: {}
  }),
  computed: {
    ...mapGetters(["userState"]),
    challanObj() {
      return this.$route.params.challan || null;
    },
    createdAt() {
      if (this.challan.created_at) {
        let time = this.challan.created_at.toDate();
        time = time.toString().split(" ");

        return time.reduce((acc, curr, index) => {
          if (index < 4) return (acc += `${curr} `);
          return acc;
        }, "");
      }
      return null;
    }
  },
  methods: {
    fetchChallan() {
      firebase
        .firestore()
        .collection("challans")
        .doc(this.$route.params.id)
        .get()
        .then(doc => {
          this.challan = doc.data();
        });
    }
  },
  created() {
    if (!this.challanObj) {
      this.fetchChallan();
    } else this.challan = this.challanObj;
  }
};
</script>
