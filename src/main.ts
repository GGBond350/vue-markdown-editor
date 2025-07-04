import { createApp } from 'vue'
import './assets/styles/reset.css';
import App from './App.vue'
import Antd from 'ant-design-vue';

const app = createApp(App);
app.use(Antd); // 全局注册 antd
app.mount('#app');
