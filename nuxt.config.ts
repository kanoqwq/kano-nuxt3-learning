// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: {enabled: false},
    modules: ['@ant-design-vue/nuxt', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@nuxt/icon'],
    antd: {
        // Options
    },
    vite: {
        ssr: {
            //作为外部模块，不打包在一起
            noExternal: ['ant-design-vue'],
        }
    },
    runtimeConfig: {
        // 使用 useRuntimeConfig 可以获取这些数据
        //敏感数据
        bucket: process.env["BUCKET_NAME"],
        region: process.env["BUCKET_REGION"],
        secretId: process.env["SECRET_ID"],
        secretKey: process.env["SECRET_KEY"],
        public: {
            //公开数据
            api: ''
        }
    }
})