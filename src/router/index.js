import Vue from 'vue'
import VueRouter from 'vue-router'
import Welcome from '../components/Welcome.vue'
import Bill from '../components/Bill.vue'
import Index from '../components/Index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/Index'
  },
  {
    path: '/Welcome',
    component: Welcome,
    children: [{
      path: '/Bill',
      component: Bill
    },
    {
      path: '/Index',
      component: Index
    }]
  },

]

const router = new VueRouter({
  routes
})

export default router
