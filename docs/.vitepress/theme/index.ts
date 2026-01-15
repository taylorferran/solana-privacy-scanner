// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import PrivacyScanner from '../components/PrivacyScanner.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register the component globally
    app.component('PrivacyScanner', PrivacyScanner)
  }
}
