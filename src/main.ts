import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'highlight.js/styles/a11y-light.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'

const app = createApp(App)
app.use(hljsVuePlugin)
app.mount('#app')

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    next();
});
