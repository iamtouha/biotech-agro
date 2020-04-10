<template>
  <v-container>
    <v-row v-if="product.addedBy == userState.uid">
      <v-col cols="12">
        <v-btn
          @click.stop="deleteModal = !deleteModal"
          dark
          class="float-right ml-2"
          color="error"
        >
          <v-icon>mdi-delete</v-icon>Delete
        </v-btn>
        <v-btn @click.stop="edit = !edit" class="primary float-right">
          <v-icon small>mdi-circle-edit-outline</v-icon>&nbsp;Edit
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <h1 class="headline text-uppercase">{{ product.name }}</h1>
        <p class="text--grey">{{ product.type }}</p>
        <p>{{ product.description }}</p>
        <v-data-table
          :loading="loader"
          class="secondary"
          :headers="headers"
          hide-default-footer
          :items="product.variants"
        ></v-data-table>
      </v-col>
      <v-col cols="6" offset="3" offset-sm="0">
        <v-card v-if="product.name" class="imgContainer mx-auto">
          <v-img
            v-if="product.image"
            :src="product.image"
            :aspect-ratio="1"
          ></v-img>
          <v-img
            class="blush"
            v-else
            :src="
              product.type == 'packet'
                ? require('@/assets/packet.svg')
                : require('@/assets/bottle.svg')
            "
            :aspect-ratio="1"
          ></v-img>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-if="product.addedBy == userState.uid"
      v-model="deleteModal"
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline"
          >Are you sure you want to delete?</v-card-title
        >
        <v-card-text>Deleted products cannot be restored.</v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="error darken-1" text @click="deleteProduct"
            >Delete</v-btn
          >
          <v-btn color="green darken-1" text @click="deleteModal = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-if="userPost !== 'mo'" v-model="edit" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Add new product</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col class="py-0" cols="12">
                <v-text-field
                  v-model="editProduct.name"
                  label="Name"
                  required
                ></v-text-field>
              </v-col>
              <v-col class="py-0" cols="12" sm="6">
                <v-btn-toggle
                  class="elevation-0 mt-3"
                  v-model="editProduct.type"
                >
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
                  v-model="editProduct.description"
                  label="Description"
                ></v-textarea>
              </v-col>
              <v-divider></v-divider>
              <v-col cols="12" v-if="editProduct.variants.length">
                <v-data-table
                  :items="editProduct.variants"
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
              <v-col class="py-0" cols="8">
                <v-text-field
                  v-model="variant.size"
                  label="Size"
                ></v-text-field>
              </v-col>
              <v-col class="py-0" cols="4">
                <v-text-field
                  v-model="variant.stock"
                  type="number"
                  :rules="positiveNum"
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
          <v-btn color="blue darken-1" text @click.stop="edit = false"
            >Close</v-btn
          >
          <v-btn color="blue darken-1" text @click.stop="saveProduct"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig.js";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      loader: false,
      deleteModal: false,
      edit: false,
      file: null,
      detail: false,
      headers: [
        {
          text: "Pack Size",
          align: "left",
          sortable: false,
          value: "size"
        },
        { text: "Stock", value: "stock" },
        { text: "Cash", value: "cash_price" },
        { text: "Credit", value: "credit_price" }
      ],
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
          text: "Cash",
          value: "cash_price"
        },
        {
          text: "Credit",
          value: "credit_price"
        },
        {
          text: "action",
          value: "action"
        }
      ],
      photoRules: [
        value =>
          !value ||
          value.size < 1000000 ||
          "Avatar size should be less than 1 MB!"
      ],
      product: {},
      editProduct: {
        name: "",
        type: "bottle",
        description: "",
        variants: []
      },
      variant: {
        size: "",
        stock: 0,
        cash_price: 0,
        credit_price: 0
      },
      positiveNum: [v => v >= 0 || "negative values aren't allowed."]
    };
  },
  computed: {
    ...mapGetters(["userState", "products"]),
    userPost() {
      return this.userState.post;
    }
  },
  methods: {
    addVariant() {
      this.editProduct.variants.push({
        size: this.variant.size,
        cash_price: parseFloat(this.variant.cash_price),
        credit_price: parseFloat(this.variant.credit_price)
      });
      this.variant = {
        size: null,
        cash_price: null,
        credit_price: null
      };
    },
    deleteVariant(item) {
      const index = this.editProduct.variants.indexOf(item);
      this.editProduct.variants.splice(index, 1);
    },
    async deleteProduct() {
      try {
        await firebase
          .firestore()
          .collection("products")
          .doc(this.$route.params.product_id)
          .delete();
        this.$router.replace("/products");
      } catch (error) {
        alert(error.message);
      }
    },
    async saveProduct() {
      this.loader = true;
      this.addModal = false;
      try {
        let url = null;
        if (this.file) {
          const image = await firebase
            .storage()
            .ref(`products/${new Date().getTime()}-${this.file.name}`)
            .put(this.file);
          url = await image.ref.getDownloadURL();
        }
        await firebase
          .firestore()
          .collection("products")
          .doc(this.$route.params.product_id)
          .update({ ...this.editProduct, image: url });
        this.loader = false;
        this.edit = false;
      } catch (error) {
        this.edit = false;
        this.loader = false;
        alert(error.message);
      }
    }
  },
  created() {
    this.product = this.products.filter(item => {
      return item.id === this.$route.params.product_id;
    })[0];
  }
};
</script>
<style scoped>
.blush {
  opacity: 0.5;
}
.imgContainer {
  max-width: 500px;
  padding: 15px;
}
</style>
