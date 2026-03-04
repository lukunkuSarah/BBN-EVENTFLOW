import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("../views/Home.vue");
const Login = () => import("../views/Login.vue");
const Dashboard = () => import("../views/Dashboard.vue");

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/login", name: "login", component: Login },
    { path: "/dashboard", name: "dashboard", component: Dashboard },
  ],
});
