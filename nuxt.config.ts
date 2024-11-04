// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: {enabled: false},
    modules: ['@ant-design-vue/nuxt','@pinia/nuxt','pinia-plugin-persistedstate/nuxt'],
    antd: {
        // Options
    },
    vite:{
        ssr:{
            //作为外部模块，不打包在一起
            noExternal:['ant-design-vue'],
        }
    },
})