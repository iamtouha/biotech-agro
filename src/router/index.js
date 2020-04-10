import Vue from "vue";
import VueRouter from "vue-router";

import firebase from "../firebaseConfig";
import Home from "@/views/Home.vue";

import Login from "@/views/user/Login.vue";
import Profile from "@/views/user/Profile.vue";
import AccountInfo from "@/views/user/AccountInfo.vue";

import Dealers from "@/views/dealer/Dealers.vue";
import Transactions from "@/views/dealer/Transactions.vue";

import Product from "@/views/product/Product.vue";
import Products from "@/views/product/Products.vue";
import Challans from "@/views/product/Challans.vue";
import Challan from "@/views/product/Challan.vue";
import Statement from "@/views/product/Statement.vue";
import Stock from "@/views/product/Stock.vue";
import AddStock from "@/views/product/AddStock.vue";

import Invoice from "@/views/invoice/Invoice.vue";
import Order from "@/views/invoice/Order.vue";
import Orders from "@/views/invoice/Orders.vue";
import NewOrder from "@/views/invoice/NewOrder.vue";
import Invoices from "@/views/invoice/Invoices.vue";
import printInvoice from "@/views/invoice/InvoicePrint.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/login",
    name: "login",
    component: Login
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/accountinfo",
    name: "accountinfo",
    component: AccountInfo,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/dealers",
    name: "dealers",
    component: Dealers,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/invoices",
    name: "invoices",
    component: Invoices,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/inv-print",
    name: "inv-print",
    component: printInvoice,
    props: {}
  },
  {
    path: "/invoices/:invoice_id",
    name: "invoice",
    component: Invoice,
    params: true,
    meta: {
      access: ["mo", "am"]
    }
  },

  {
    path: "/orders",
    name: "orders",
    component: Orders,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/orders/add",
    name: "neworder",
    component: NewOrder,
    meta: {
      access: ["mo"]
    }
  },
  {
    path: "/orders/id/:order_id",
    name: "order",
    component: Order,
    params: true,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/products",
    name: "products",
    component: Products,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/products/:product_id",
    name: "product",
    component: Product,
    params: true,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/stock",
    name: "stock",
    component: Stock,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/challan",
    name: "challans",
    component: Challans,
    meta: {
      access: ["am"]
    }
  },
  {
    path: "/challan/:id",
    name: "challan",
    component: Challan,
    meta: {
      access: ["am"]
    }
  },
  {
    path: "/stock/add",
    name: "addstock",
    component: AddStock,
    meta: {
      access: ["am"]
    }
  },
  {
    path: "/transactions",
    name: "transactions",
    component: Transactions,
    meta: {
      access: ["mo", "am"]
    }
  },
  {
    path: "/statement",
    name: "statement",
    component: Statement,
    meta: {
      access: ["am", "mo"]
    }
  },

  {
    path: "/about",
    name: "about",
    component: () => import("@/views/About.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  const user = firebase.auth().currentUser;
  let post;
  let access;
  if (user) {
    post = user.email.slice(0, 2);
  }
  if (to.meta.access) {
    access = to.meta.access.includes(post);
    if (access) next();
    else next("/login");
  } else if (to.name == "inv-print" && !to.params.invoice) next("/invoices");
  else next();
});

export default router;
