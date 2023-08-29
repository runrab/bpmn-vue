import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'highlight.js/styles/a11y-light.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import {createPinia} from "pinia";
const app = createApp(App)
const pinia = createPinia()
app.use(hljsVuePlugin)


app.use(pinia)
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
//     next();
// });



app.mount('#app')


