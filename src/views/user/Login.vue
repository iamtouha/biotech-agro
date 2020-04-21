<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="6">
        <v-card elevation="3" class="full-width">
          <v-card-title>Login to biotech agrovat</v-card-title>
          <v-card-text class="pb-0">
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
            </v-form>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn large :loading="loader" class="primary" @click="signin()"
              >Log in</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
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
