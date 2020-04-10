import Vue from "vue";
import Vuex from "vuex";
import firebase from "../firebaseConfig";
// import router from './router'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    printMode: false,
    designations: {
      mo: "Marketing Officer",
      am: "Area Manager",
      asm: "Regional Sales Manager",
      dsm: "Divisional Sales Manager",
      md: "Managing Director"
    },
    invoices: [],
    products: [],
    dealers: []
  },
  getters: {
    userState(state) {
      return state.user;
    },
    dealers(state) {
      return state.dealers;
    },
    products(state) {
      return state.products;
    },
    printMode(state) {
      return state.printMode;
    }
  },
  mutations: {
    setUser(state, payload) {
      payload["designation"] = state.designations[payload.post];
      state.user = { ...state.user, ...payload };
    },
    pushProduct(state, payload) {
      state.products.push(payload);
    },
    setProducts(state, payload) {
      state.products = payload;
    },
    setDealers(state, payload) {
      state.dealers = payload;
    },
    printModeEnable(state) {
      state.printMode = true;
    },
    printModeDisable(state) {
      state.printMode = false;
    }
  },
  actions: {
    async getUser({ commit }) {
      const user = firebase.auth().currentUser;
      if (user)
        try {
          const doc = await firebase
            .firestore()
            .collection("user")
            .doc(user.uid)
            .get();

          if (doc.exists) {
            commit("setUser", {
              ...doc.data(),
              email: user.email,
              uid: user.uid
            });
          }
          return doc.data();
        } catch (error) {
          alert(error.message);
        }
    },
    getProducts({ state, commit }) {
      firebase
        .firestore()
        .collection("products")
        .where(
          "addedBy",
          "==",
          state.user.post == "am" ? state.user.uid : state.user.supirior
        )
        .onSnapshot(
          querySnapshot => {
            const products = [];
            querySnapshot.forEach(doc => {
              products.push({ id: doc.id, ...doc.data() });
            });
            commit("setProducts", products);
          },
          err => alert(err)
        );
    },
    async getDealers({ state, commit }) {
      const db = firebase.firestore();
      const uid = firebase.auth().currentUser.uid;

      db.collection("dealers")
        .where(state.user.post, "==", uid)
        .onSnapshot(
          querySnapshot => {
            const dealers = [];
            querySnapshot.forEach(doc => {
              dealers.push({ id: doc.id, ...doc.data() });
            });
            commit("setDealers", dealers);
          },
          err => alert(err)
        );
    },
    printScr({ commit }) {
      commit("printModeEnable");
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          commit("printModeDisable");
        }, 10);
      }, 10);
    }
  }
});
