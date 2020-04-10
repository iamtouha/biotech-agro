<template>
  <v-dialog class="transparent" v-model="dialog" width="300" persistent>
    <template v-slot:activator="{ on }">
      <v-btn small class="elevation-0" tile outlined color="primary" v-on="on"
        >{{ field ? field + ":" : "" }} {{ dateDMY }}</v-btn
      >
    </template>
    <v-card tile>
      <v-card-text class="pa-0">
        <v-date-picker
          full-width
          class="elevation-0"
          v-model="date"
        ></v-date-picker>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="submit">done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: [Number, Date],
      required: false
    },
    field: String
  },
  data: () => ({
    date: `${new Date().getFullYear()}-${new Date().getMonth() +
      1}-${new Date().getDate()}`,
    dialog: false
  }),
  computed: {
    timeStamp() {
      return new Date(this.date);
    },
    dateDMY() {
      const time = this.timeStamp.toString().split(" ");
      const string = time.reduce((acc, cr, index) => {
        if (index > 0 && index < 4)
          if (index === 3) acc += ", " + cr;
          else acc += " " + cr;
        return acc;
      }, "");
      return string;
    }
  },
  methods: {
    submit() {
      this.dialog = false;
      // this.$emit("changedVal", this.timeStamp);
    }
  },
  watch: {
    timeStamp(val) {
      this.$emit("changedVal", val);
    }
  },
  mounted() {
    if (this.value) {
      const value = new Date(this.value);
      this.date = `${value.getFullYear()}-${value.getMonth() +
        1}-${value.getDate()}`;
    }
    this.$emit("changedVal", this.timeStamp);
  }
};
</script>
