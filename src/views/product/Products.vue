<template>
  <v-container fluid>
    <v-progress-circular
      class="loader"
      v-if="loader"
      :size="50"
      color="primary"
      indeterminate
    ></v-progress-circular>
    <v-row>
      <v-col
        v-for="(product, key) in paginatedProducts"
        :key="key"
        cols="6"
        sm="4"
        md="3"
        lg="2"
      >
        <v-card class="fill-height" :to="'products/' + product.id" tile>
          <v-img
            v-if="product.image"
            :src="product.image"
            :aspect-ratio="1"
          ></v-img>
          <v-img
            v-else
            :src="
              product.type == 'packet'
                ? require('@/assets/packet.svg')
                : require('@/assets/bottle.svg')
            "
            :aspect-ratio="1"
          ></v-img>
          <v-card-title class="pt-2" primary-title>
            <div>
              <p style="font-size:20px; margin-bottom:0">{{ product.name }}</p>
              <span style="font-size:16px;" class="grey--text">{{
                product.type
              }}</span>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col cols="12" class="text-xs-center">
        <v-pagination
          v-if="pages > 1"
          v-model="page"
          :length="pages"
        ></v-pagination>
      </v-col>
    </v-row>
    <v-btn
      v-if="userPost !== 'mo'"
      @click.stop="addModal = !addModal"
      fixed
      dark
      fab
      bottom
      right
      color="primary"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <!-- add new product -->
    <v-dialog
      v-if="userPost !== 'mo'"
      v-model="addModal"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Add new product</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col class="py-0" cols="12">
                <v-text-field
                  v-model="product.name"
                  label="Name"
                  required
                ></v-text-field>
              </v-col>
              <v-col class="py-0" cols="12" sm="6">
                <v-btn-toggle class="elevation-0 mt-3" v-model="product.type">
                  <v-btn :value="'bottle'" small>Bottle</v-btn>
                  <v-btn :value="'packet'" small>Packet</v-btn>
                </v-btn-toggle>
              </v-col>
              <v-col class="py-0" cols="12" sm="6">
                <v-file-input
                  :rules="photoRules"
                  v-model="file"
                  accept="image/png, image/jpeg, image/bmp"
                  prepend-icon="mdi-camera"
                  label="Product Image"
                ></v-file-input>
              </v-col>
              <v-col class="py-0" cols="12">
                <v-textarea
                  rows="1"
                  outlined
                  v-model="product.description"
                  label="Description"
                ></v-textarea>
              </v-col>
              <v-divider></v-divider>
              <v-col cols="12" v-if="product.variants.length">
                <v-data-table
                  :items="product.variants"
                  sort-by
                  hide-default-footer
                  :headers="sizeHeaders"
                >
                  <template v-slot:item.action="{ item }">
                    <v-btn
                      class="error--text"
                      dark
                      text
                      small
                      @click.stop="deleteVariant(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-col>
              <v-col class="py-0" cols="6">
                <v-text-field
                  v-model="variant.size"
                  label="Size"
                ></v-text-field>
              </v-col>
              <v-col class="py-0" cols="6">
                <v-text-field
                  type="number"
                  :rules="positiveNum"
                  v-model="variant.stock"
                  label="Stock"
                ></v-text-field>
              </v-col>
              <v-col class="py-0" cols="6">
                <v-text-field
                  type="number"
                  v-model="variant.cash_price"
                  :rules="positiveNum"
                  label="Cash Price"
                ></v-text-field>
              </v-col>
              <v-col class="py-0" cols="6">
                <v-text-field
                  type="number"
                  v-model="variant.credit_price"
                  :rules="positiveNum"
                  label="Credit Price"
                ></v-text-field>
              </v-col>
              <v-col class="py-0 text-center">
                <v-btn
                  small
                  text
                  color="black"
                  @click.stop="addVariant"
                  :disabled="
                    !variant.size ||
                      !variant.cash_price ||
                      !variant.credit_price
                  "
                  class="secondary"
                  >Add Size</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="blue darken-1" text @click.stop="addModal = false"
            >Close</v-btn
          >
          <v-btn color="blue darken-1" text @click.stop="saveProduct"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Alert :message="message" />
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig";
import Alert from "@/components/Alert";
import { mapGetters } from "vuex";
export default {
  components: { Alert },

  data() {
    return {
      file: null,
      toggle: false,
      product: {
        name: "",
        type: "bottle",
        description: "",
        variants: []
      },

      variant: {
        size: "",
        stock: 0,
        cash_price: null,
        credit_price: null
      },

      sizeHeaders: [
        {
          text: "Size",
          value: "size"
        },
        {
          text: "Stock",
          value: "stock"
        },
        {
          text: "Cash Price(tk)",
          value: "cash_price"
        },
        {
          text: "Credit Price(tk)",
          value: "credit_price"
        },
        {
          text: "",
          value: "action"
        }
      ],
      photoRules: [
        value =>
          !value ||
          value.size < 1000000 ||
          "Image size should be less than 1 MB!"
      ],
      positiveNum: [v => v >= 0 || "negative values aren't allowed."],
      addModal: false,
      page: 1,
      loader: false,
      perPage: 12,
      show: false,
      message: null
    };
  },
  computed: {
    pages() {
      return Math.ceil(this.products.length / this.perPage);
    },
    userPost() {
      return this.user.post;
    },
    user() {
      return this.$store.getters.userState;
    },
    paginatedProducts() {
      return this.products.slice(
        (this.page - 1) * this.perPage,
        this.page * this.perPage
      );
    },
    ...mapGetters(["products"])
  },
  methods: {
    addVariant() {
      this.product.variants.push({
        size: this.variant.size,
        stock: parseInt(this.variant.stock),
        cash_price: parseFloat(this.variant.cash_price),
        credit_price: parseFloat(this.variant.credit_price)
      });
      this.variant = {
        size: "",
        stock: 0,
        cash_price: null,
        credit_price: null
      };
    },
    deleteVariant(item) {
      const index = this.product.variants.indexOf(item);
      this.product.variants.splice(index, 1);
    },
    async saveProduct() {
      this.loader = true;
      this.addModal = false;
      try {
        let url = null;
        if (this.file) {
          const image = await firebase
            .storage()
            .ref(`products/${new Date().getUTCSeconds()}-${this.file.name}`)
            .put(this.file);
          url = await image.ref.getDownloadURL();
        }
        await firebase
          .firestore()
          .collection("products")
          .doc()
          .set({ ...this.product, addedBy: this.user.uid, image: url });

        this.product = {
          name: "",
          type: "bottle",
          description: "",
          variants: []
        };
        await this.getProducts();
        this.loader = false;
      } catch (error) {
        this.loader = false;
        alert(error.message);
      }
    }
  }
};
</script>
<style lang="scss">
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
