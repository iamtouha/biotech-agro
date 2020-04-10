<template>
  <v-container>
    <v-progress-circular
      class="loader"
      v-if="loader"
      :size="50"
      color="primary"
      indeterminate
    ></v-progress-circular>
    <h1 class="header">Additional Information</h1>
    <v-layout>
      <v-flex sm8 xs12 offset-sm2>
        <v-form ref="info">
          <v-text-field
            :counter="32"
            outlined
            :rules="nameRules"
            v-model="name"
            label="Full Name"
          ></v-text-field>
          <v-text-field
            outlined
            v-model="phone"
            :counter="11"
            :rules="phoneRules"
            label="Phone No."
            required
          ></v-text-field>
          <v-file-input
            :rules="photoRules"
            v-model="file"
            accept="image/png, image/jpeg, image/bmp"
            placeholder="Pick an avatar"
            prepend-icon="mdi-camera"
            label="Avatar"
          ></v-file-input>
          <v-btn @click="submit">Submit</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
    <h1 class="header">Change Password</h1>
    <v-layout>
      <v-flex sm8 xs12 offset-sm2>
        <v-form ref="password">
          <v-text-field
            type="password"
            outlined
            validate-on-blur
            v-model="oldPass"
            :rules="[passValidate.lengthValidate]"
            label="Old Password"
            required
          ></v-text-field>
          <v-text-field
            type="password"
            outlined
            v-model="newPass"
            :rules="[passValidate.lengthValidate]"
            label="New Password"
            required
          ></v-text-field>
          <v-text-field
            outlined
            type="password"
            v-model="again"
            :rules="[passValidate.lengthValidate, passwordConfirmationRule]"
            label="Password Again"
            required
          ></v-text-field>
          <v-btn @click="changePass">Submit</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import firebase from "@/firebaseConfig";
import baseFirebase from "firebase/app";
export default {
  data: () => ({
    loader: false,
    name: "",
    phone: "",
    file: null,
    oldPass: "",
    newPass: "",
    again: "",
    nameRules: [
      v => v.length >= 4 || "Name must be at least four characters long"
    ],
    phoneRules: [
      v => /^\d+$/.test(v) || "input only numbers",
      v => v.slice(0, 2) == "01" || v.length < 2 || "phone no. starts with 01",
      v => v.length == 11 || "phone no. must be 11 digit long."
    ],
    photoRules: [
      value =>
        !value ||
        value.size < 1000000 ||
        "Avatar size should be less than 1 MB!"
    ],
    passValidate: {
      lengthValidate: v => v.length > 5 || "must be at least 6 characters long"
    }
  }),
  computed: {
    passwordConfirmationRule() {
      return () => this.newPass === this.again || "Passwords must match";
    },
    user() {
      return firebase.auth().currentUser;
    }
  },
  methods: {
    async submit() {
      if (this.$refs.info.validate()) {
        this.loader = true;
        try {
          let url = null;
          if (this.file) {
            const image = await firebase
              .storage()
              .ref(`user/${this.user.uid}-${this.file.name}`)
              .put(this.file);
            url = await image.ref.getDownloadURL();
          }

          await firebase
            .firestore()
            .collection("user")
            .doc(this.user.uid)
            .update(
              url
                ? {
                    image: url,
                    name: this.name,
                    phone: this.phone
                  }
                : {
                    name: this.name,
                    phone: this.phone
                  }
            );
          const doc = await firebase
            .firestore()
            .collection("user")
            .doc(this.user.uid)
            .get();
          this.$store.dispatch("getUser", { ...doc.data(), uid: doc.id });
          this.loader = false;
          this.$router.replace("/profile");
        } catch (error) {
          this.loader = false;
          alert(error.message);
        }
      }
    },
    async changePass() {
      try {
        this.loader = true;
        const cred = baseFirebase.auth.EmailAuthProvider.credential(
          this.user.email,
          this.oldPass
        );
        const user = firebase.auth().currentUser;
        await user.reauthenticateWithCredential(cred);
        await user.updatePassword(this.newPass);
        this.loader = false;
        this.$router.replace("/profile");
      } catch (error) {
        this.loader = false;
        alert(error.message);
      }
    }
  }
  // watch: {
  //   file() {
  //     console.log(this.file);
  //   }
  // }
};
</script>
<style scoped>
.header {
  width: 100%;
  text-align: center;
  font-weight: 300;
  margin-top: 30px;
}
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
