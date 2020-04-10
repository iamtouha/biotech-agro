<template>
  <v-snackbar :timeout="10000" v-model="alert" bottom>
    {{ message }}
    <v-btn icon @click="dismiss()">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    message: String
  },
  data: () => ({
    alert: false
  }),
  watch: {
    message(val) {
      if (val) {
        this.alert = true;
      }
    }
  },
  methods: {
    dismiss() {
      this.alert = false;
    }
  }
};
</script>
