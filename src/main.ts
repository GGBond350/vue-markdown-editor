import { createApp } from 'vue'
import './assets/styles/reset.css';
import '@/style.css';
import App from './App.vue'
import Antd from 'ant-design-vue';
import { createPinia } from 'pinia';
import { useThemeStore } from './store/useThemeStore';

const app = createApp(App);


app.use(Antd); // 全局注册 antd
app.use(createPinia()); // 全局注册 Pinia
app.mount('#app');
