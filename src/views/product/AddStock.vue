<template>
  <v-container>
    <v-row>
      <v-col class="my-0" sm="3" md="2" cols="6">
        <v-text-field
          type="number"
          hide-details
          v-model="challan_no"
          outlined
          label="Challan No."
        ></v-text-field>
      </v-col>
      <v-col class="mt-3" cols="6">
        Date:
        <Datefield @changedVal="dateEntered" />
      </v-col>
    </v-row>

    <v-row v-if="stockAdded.length">
      <v-col cols="12">
        <v-list subheader>
          <v-subheader>Challan: {{ challan_no }}</v-subheader>
          <template v-for="(item, index) in stockAdded">
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
              <v-list-item-action>
                <v-btn @click="stockAdded.splice(index, 1)" class="error" icon>
                  <v-icon color="#fff">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-divider
              v-if="index + 1 != stockAdded.length"
              :key="-1 - index"
            ></v-divider>
          </template>
          <v-list-item>
            <v-list-item-content></v-list-item-content>
            <v-list-item-action>
              <v-btn
                :disabled="!challan_no"
                @click.stop="submit"
                large
                :loading="loading"
                class="primary"
                >Save</v-btn
              >
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-form ref="sizeForm">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            v-model="product"
            label="Product"
            :items="products"
            item-text="name"
            return-object
            hide-details
          >
            <template v-if="!product.name" v-slot:prepend
              >Select a Product</template
            >
          </v-autocomplete>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-if="product.variants && product.variants.length"
          cols="12"
          class="py-0"
        >
          <p class="pa-0 ma-0">Add stock:</p>
        </v-col>
        <v-col
          v-for="(item, index) in product.variants"
          :key="index"
          cols="4"
          sm="3"
          md="2"
        >
          <v-row>
            <v-col class="py-0" cols="12">
              <p class="py-0 mb-0">{{ item.size }}</p>
            </v-col>
            <v-col class="py-0" cols="12">
              <v-text-field
                type="number"
                :rules="[v => v.toString().length > 0 || 'enter number']"
                :id="product.id + index.toString()"
                :value="0"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="3">
          <v-btn v-if="product.variants" @click="add" class="primary"
            >add</v-btn
          >
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import Datefield from "@/components/Datefield";
import firebase from "../../firebaseConfig";
import { mapGetters } from "vuex";
export default {
  components: { Datefield },

  data: () => ({
    date: new Date(),
    loading: false,
    challan_no: "",
    product: {},
    stockAdded: []
  }),
  computed: {
    exists() {
      const product = this.stockAdded.filter(item => {
        return item.id == this.product.id;
      });
      return product.length;
    },
    ...mapGetters(["products", "userState"])
  },
  methods: {
    dateEntered(val) {
      this.date = val;
    },

    add() {
      const valid = this.$refs.sizeForm.validate();
      if (valid && !this.exists) {
        const product = {
          product_id: this.product.id,
          product_name: this.product.name,
          items_added: []
        };
        let i = 0;
        this.product.variants.forEach((variant, index) => {
          let units = parseInt(
            document.getElementById(this.product.id + index.toString()).value
          );
          i += units;
          product.items_added.push({ variant, index, units: units });
        });
        if (i) this.stockAdded.push(product);
        this.product = {};
      }
    },
    submit() {
      this.loading = true;
      const db = firebase.firestore();
      db.collection("challans")
        .doc()
        .set({
          challan_no: this.challan_no,
          challan: this.stockAdded,
          created_at: this.date,
          created_by: this.userState.uid
        })
        .then(
          () => {
            this.loading = false;
            this.$router.push("/stock");
          },
          err => {
            this.loading = false;
            alert(err.message);
          }
        );
    }
  },
  created() {
    if (this.userState.post !== "am") {
      this.$router.replace("/stock");
    }
  }
};
</script>
