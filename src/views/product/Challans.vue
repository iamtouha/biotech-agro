<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-data-table
          calculate-widths
          @click:row="openChallan"
          :loading="loader"
          sort-by
          :items="challans"
          :headers="header"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Challans</v-toolbar-title>
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
                  <v-btn class="primary" @click="getChallans(range)">
                    <v-icon>mdi-magnify</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-toolbar>
          </template>
          <template v-slot:item.created_at="{ item }">
            {{ item.created_at.toDate().getDate() }}-{{
              item.created_at.toDate().getMonth() + 1
            }}-{{ item.created_at.toDate().getFullYear() }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn @click.stop="deleteItem(item)" text small>
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig";
const db = firebase.firestore();
import Datefield from "@/components/Datefield";

export default {
  components: {
    Datefield
  },
  data() {
    return {
      range: {
        start: null,
        end: null
      },
      modal: false,
      id: null,
      challans: [],
      loader: false,
      header: [
        {
          text: "Challan No.",
          value: "challan_no"
        },
        {
          text: "Created",
          value: "created_at"
        },
        { text: "Actions", width: "150", value: "actions", sortable: false }
      ],
      months: [
        "jan.",
        "feb.",
        "mar.",
        "apr.",
        "may",
        "jun",
        "july",
        "aug.",
        "sept.",
        "oct.",
        "nov.",
        "dec."
      ]
    };
  },
  computed: {
    user() {
      return this.$store.getters.userState;
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
    setStart(e) {
      this.range.start = e;
    },
    setEnd(e) {
      this.range.end = e;
    },
    openChallan(challan) {
      console.dir(challan);

      this.$router.push({
        name: "challan",
        params: {
          id: challan.id,
          challan
        }
      });
    },
    async getChallans(time) {
      try {
        this.loader = true;
        const challans = [];
        if (this.user.post == "am") {
          const querySnapshot = await db
            .collection("challans")
            .where("created_by", "==", this.user.uid)
            .where("created_at", ">=", new Date(time.start))
            .where("created_at", "<=", new Date(time.end))
            .orderBy("created_at", "desc")
            .get();
          querySnapshot.forEach(doc => {
            challans.push({ id: doc.id, ...doc.data() });
          });
        }
        this.challans = challans;
        this.loader = false;
      } catch (error) {
        console.log(error);
        alert(error.message);
        this.loader = false;
      }
    },
    deleteItem(item) {
      confirm("delete challan " + item.challan_no + "?") &&
        db
          .collection("challans")
          .doc(item.id)
          .delete()
          .then(() => {
            const index = this.challans.indexOf(item);
            this.challans.splice(index, 1);
          })
          .catch(err => alert(err.message));
    }
  },

  created() {
    this.getChallans({
      start: this.startDate,
      end: this.endDate
    });
  }
};
</script>
