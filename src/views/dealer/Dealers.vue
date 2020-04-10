<template>
  <v-container>
    <v-progress-circular
      class="loader"
      v-if="loader"
      :size="50"
      color="primary"
      indeterminate
    ></v-progress-circular>

    <v-row>
      <v-col cols="12" class="text-center">
        <v-data-table
          dense
          sort-by="code"
          :items-per-page="20"
          :items="dealers"
          :headers="headers"
        >
        </v-data-table>
      </v-col>

      <v-col sm="8" cols="12" offset-sm="2" v-if="userState.post == 'mo'">
        <v-dialog v-model="dialog" persistent max-width="350">
          <v-card>
            <v-card-title class="headline">Add new Dealer?</v-card-title>
            <v-card-text>
              Once you add a new dealer, it cannot be deleted after 60 minuites.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click.stop="addDealer()"
                >Proceed</v-btn
              >
              <v-btn text @click="dialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-card>
          <v-card-title class="headline">Add Dealer</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newDealer.name"
              :counter="32"
              label="Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newDealer.address"
              :counter="255"
              label="Address"
              required
            ></v-text-field>
            <v-row>
              <v-col sm="6" cols="12" pr-3>
                <v-text-field
                  v-model="newDealer.code"
                  :counter="4"
                  label="Dealer Code"
                  required
                ></v-text-field>
              </v-col>
              <v-col sm="6" cols="12">
                <v-text-field
                  v-model="newDealer.phone"
                  :counter="11"
                  :rules="phoneRules"
                  placeholder="01xxxxxxxxx"
                  label="Phone"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-btn
                  color="primary"
                  @click.stop="dialog = true"
                  dark
                  depressed
                  >Add</v-btn
                >
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import firebase from "../../firebaseConfig";
const db = firebase.firestore();

export default {
  data: () => ({
    loader: false,
    dialog: false,
    newDealer: {
      name: null,
      address: null,
      code: null,
      phone: "01"
    },
    headers: [
      { text: "Code", value: "code" },
      { text: "Name", value: "name" },
      { text: "Address", value: "address" },
      { text: "marketing_officer", value: "marketing_officer.name" }
    ],
    phoneRules: [
      v => /^\d+$/.test(v) || "input only numbers",
      v => v.slice(0, 2) == "01" || v.length < 2 || "phone no. starts with 01",
      v => v.length == 11 || "phone no. must be 11 digit long."
    ]
  }),
  computed: {
    ...mapGetters(["userState", "dealers"])
    // dealers
  },
  methods: {
    async addDealer() {
      this.loader = true;
      try {
        this.dialog = false;
        const supirior = await db
          .collection("user")
          .doc(this.userState.supirior)
          .get();
        await db
          .collection("dealers")
          .doc()
          .set({
            mo: this.userState.uid,
            marketing_officer: this.userState,
            am: supirior.id,
            area_manager: supirior.data(),
            added: new Date(),
            ...this.newDealer
          });
        this.newDealer = {
          name: null,
          address: null,
          code: null,
          phone: "01"
        };
        this.loader = false;
      } catch (error) {
        this.loader = false;
        alert(error.message);
      }
    },
    canDelete(obj) {
      const added = obj.added.toDate
        ? obj.added.toDate().getTime()
        : obj.added.getTime();
      const current = new Date().getTime();
      let diff = (current - added) / (1000 * 60 * 60);
      diff = Math.floor(diff);
      return diff ? false : true;
    },
    deleteDlr(obj) {
      this.loader = true;
      db.collection("dealers")
        .doc(obj.id)
        .delete()
        .then(() => {
          const index = this.dealers.indexOf(obj);
          this.dealers.splice(index, 1);
          this.loader = false;
        });
    }
  }
};
</script>
<style scoped>
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
