<template>
  <v-container>
    <v-progress-circular
      class="loader"
      v-if="loader"
      :size="50"
      color="primary"
      indeterminate
    ></v-progress-circular>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3 class="px-4 py-3 mt-5">
        <v-form>
          <v-text-field
            type="email"
            outlined
            v-model="credentials.email"
            label="e-mail"
            required
          ></v-text-field>
          <v-text-field
            outlined
            v-model="credentials.password"
            label="password"
            type="password"
            required
          ></v-text-field>
          <v-snackbar v-model="alert" bottom>
            {{ error }}
            <v-btn text @click="dismiss()">Close</v-btn>
          </v-snackbar>
          <v-btn @click="signin()">Log in</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import firebase from "../../firebaseConfig";
export default {
  data() {
    return {
      loader: false,
      credentials: {
        email: "",
        password: ""
      },
      error: null,
      alert: false
    };
  },
  methods: {
    dismiss() {
      this.alert = false;
    },
    async signin() {
      try {
        this.loader = true;
        const request = await firebase
          .auth()
          .signInWithEmailAndPassword(
            this.credentials.email,
            this.credentials.password
          );
        const doc = await firebase
          .firestore()
          .collection("user")
          .doc(request.user.uid)
          .get();
        if (doc.exists) {
          this.$store.dispatch("getUser");
          this.$router.replace("/");
        } else {
          this.$router.replace("/accountinfo");
        }
        this.loader = false;
      } catch (error) {
        this.loader = false;
        this.alert = true;
        this.error = error.message;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
