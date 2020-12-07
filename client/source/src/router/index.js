import Vue from 'vue'
import Router from 'vue-router'
import EmailForm from '@/components/EmailForm'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'EmailForm',
      component: EmailForm
    }
  ]
})
