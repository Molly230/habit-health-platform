import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Consultation from '../views/Consultation.vue'
import Prescription from '../views/Prescription.vue'
import Knowledge from '../views/Knowledge.vue'
import Chat from '../views/Chat.vue'
import DoctorConsultation from '../views/DoctorConsultation.vue'
import Admin from '../views/Admin.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import OrderSuccess from '../views/OrderSuccess.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/consultation',
    name: 'Consultation',
    component: Consultation
  },
  {
    path: '/prescription',
    name: 'Prescription',
    component: Prescription
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: Knowledge
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/doctor-consultation',
    name: 'DoctorConsultation',
    component: DoctorConsultation
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/order-success',
    name: 'OrderSuccess',
    component: OrderSuccess
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router