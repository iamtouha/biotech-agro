import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import firebase from "./firebaseConfig";

import "./registerServiceWorker";

Vue.config.productionTip = false;

let app;

Vue.config.productionTip = false;
firebase.auth().onAuthStateChanged(async user => {
  if (user) await store.dispatch("getUser");
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      render: h => h(App)
    }).$mount("#app");
  }
  if (user) {
    store.dispatch("getProducts");
    store.dispatch("getDealers");
  }
});
