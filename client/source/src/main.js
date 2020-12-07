// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueMaterial from 'vue-material'
import Vuelidate from 'vuelidate'
import VuelidateErrorExtractor, { templates } from 'vuelidate-error-extractor'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import App from './App'
import router from './router'

Vue.config.productionTip = false
Vue.use(VueMaterial)
Vue.use(Vuelidate)

Vue.use(VuelidateErrorExtractor, {
  i18n: false,
  // TODO:  define common validation messages for components using "VuelidateErrorExtractor" /
  //        to replace hard-coded inline messages in the pages.
  messages: {
    required: '{attribute} is required!',
    email: '{attribute} is not a valid Email address.'
  }
})

Vue.component('form-group', templates.singleErrorExtractor.foundation6)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
