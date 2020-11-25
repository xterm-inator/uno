import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlusCircle, faRocket, faTimesCircle, faTimes, faRobot, faGrinBeam, faCrown, faShareSquare, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faPlusCircle, faRocket, faTimesCircle, faTimes, faRobot, faGrinBeam, faCrown, faShareSquare, faSpinner);

import VueChatScroll from 'vue-chat-scroll'
Vue.use(VueChatScroll)

import router from './router';
import network from './mixins/network';

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(network, { local: true });

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
