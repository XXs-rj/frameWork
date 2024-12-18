// src/i18n.js  
import Vue from 'vue';  
import VueI18n from 'vue-i18n';  

Vue.use(VueI18n);  

const messages = {  
//   en: require('./lang/en/index.json'),
  // 你可以在这里添加其他语言的翻译文件  
  zh: require('./lang/zh/index.js')  
};  

const i18n = new VueI18n({  
  locale: 'zh', // 设置默认语言  
  messages, // 设置翻译信息  
});  

export default i18n;