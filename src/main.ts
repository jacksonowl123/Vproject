import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './global.css';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
};

createApp(App)
  .use(VueSweetalert2)
  .use(router)
  .use(Toast, toastOptions)
  .mount('#app');
