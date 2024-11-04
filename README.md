### 坑1：安装Nuxt3报错

RT,安装nuxt3报错，网络错误，Clash全局TUN也无效

```bash
➜  nuxt-in-action npx nuxi init nuxt3-app                               
Nuxi 3.x.x                                                                   
 ERROR  Failed to download template from registry: request to 
 https://raw.githubusercontent.com/nuxt/starter/templates/templates/v3.json failed, 
 reason: connect ECONNREFUSED 0.0.0.0:443
```

解决方案：**给 raw.githubusercontent.com 做一下手动hosts**

### 坑2：为AntD支持自动导入模块

本来按照网上教程应该使用 `unplugin-vue-components` 进行自动导入（~~CSDN害人不浅~~）,但经过仔细查询，发现更为官方的解法：[Ant-design-vue · Nuxt Modules](https://nuxt.com/modules/ant-design-vue)

```bash
yarn add ant-design-vue
npx nuxi@latest module add ant-design-vue
```

当然，这一步有可能会碰到网络问题，网络问题详见 **#坑1**

```javascript
//nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@ant-design-vue/nuxt'
  ],
  antd:{
    // Options
  }
})
```

**顺带附上老方法：**

```javascript
import Components from 'unplugin-vue-components/vite'
import {
    AntDesignVueResolver,
    ElementPlusResolver,
    VantResolver
} from "unplugin-vue-components/resolvers";

//在vite配置中添加AntD自动导入(unplugin-vue-components)
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: {enabled: true},
    vite: {
        plugins: [
            Components({
                resolvers: [
                    //新版本的antd不需要impotStyle了，使用了CSS-in-JS
                    AntDesignVueResolver({
                        importStyle: false
                    }),
                    ElementPlusResolver(),
                    VantResolver()
                ]
            })
        ]
    }
})
```

### 坑3:Pinia持久化配置问题

使用pinia持久化时Nuxt服务器报错`can not find localStorage`，是因为node服务端本身无这个属性，所以需要判断`process.client`

```javascript
// 由于localStorage只能在客户端使用，所以需要先声明: process.client
persist: process.client && {
    storage: localStorage,
}
```

经过查询，发现 `piniaPluginPersistedstate` 属性，即可解决该问题,[在 Nuxt 中使用 | Pinia Plugin Persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/zh/frameworks/nuxt.html)

```javascript
import { defineStore } from 'pinia'

export const useStore = defineStore('xxx', {
  state: () => {
    //.....
  },
  //....
  persist: {
    storage: piniaPluginPersistedstate.cookies(),
  },
})
```

注：`.cookies()` 而不是 `.cookies`(~~脑抽忘写括号半天没找到错误~~)

**另外说一点，v4+版本的patchs已经改为pick:**[Release v4.0.0 · prazdevs/pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate/releases/tag/v4.0.0)

