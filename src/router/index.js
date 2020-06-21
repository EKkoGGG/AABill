import Vue from 'vue'
import VueRouter from 'vue-router'
import Welcome from '../components/Welcome.vue'
import Bill from '../components/Bill.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/Welcome'
  },
  {
    path: '/Welcome',
    component: Welcome,
    redirect: '/Bill',
    children: [{
      path: '/Bill',
      component: Bill
    }]
  },

]

const router = new VueRouter({
  routes
})

export default router
