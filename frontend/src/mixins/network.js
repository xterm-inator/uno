import VueSocketio from 'vue-socket.io';
import router from '../router';

export default {
  install(Vue) {
    const $network = {
      get baseUrl() {
        return process.env.VUE_APP_BASE_URL
      },

      get offline() {
        return router.currentRoute.path.indexOf('offline') > -1;
      },

      get online() {
        return router.currentRoute.path.indexOf('offline') == -1;
      },

      emit(eventName, payload) {
        if(!this.offline) {
          Vue.prototype.$socket.emit(eventName, payload);
        }
        else {
          console.log('Attempted to emit an event while offline: ' + eventName);
        }
      },

      setupSocketio() {
        Vue.use(VueSocketio, process.env.VUE_APP_SERVER_URL);
      }
    };

    Vue.prototype.$network = $network;
  }
}
