import { createApp } from 'vue'
import './assets/styles/reset.css';
import '@/style.css';
import App from './App.vue'
import { initHighlightTheme } from './utils/highlightTheme';
import Antd from 'ant-design-vue';
import { createPinia } from 'pinia';

const app = createApp(App);


app.use(Antd); // 全局注册 antd
app.use(createPinia()); // 全局注册 Pinia

// 初始化代码高亮主题
initHighlightTheme();

app.mount('#app');
