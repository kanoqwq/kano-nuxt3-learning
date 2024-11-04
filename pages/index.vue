<template>
  <div>
    <div>
      <a-button type="primary" @click="good">counter++:{{ store.counter }}</a-button>
      <span>counter*2: {{ store.doubleCounter }}</span>
      <NuxtLink to="/kano">
        <a-button type="primary">跳转到kano</a-button>
      </NuxtLink>

      <a-button @click="toChild">跳转到child</a-button>
      <!--无需引入-->
      <Hello></Hello>
      <hr/>
      <!--plugin挂在到了实例上-->
      <h1>{{ $myPlugin("Nuxt Plugins") }}</h1>
      <hr/>
      <a-button @click="message.info('这是一条消息')">点我弹出消息</a-button>
      <div>我是useCookie['userInfo']：{{ userCk }}</div>
      <div>我是user2：{{ JSON.stringify(user2) }}</div>
<!--      <div><p>{{ caca }}</p></div>-->
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue"
import {useMyStore} from "~/store/myStore";
import {useConter, userInfoCookie} from "~/composables/state";
import {useHTTPFetch, userInfoFetch} from "~/composables/useHTTPFetch";
//使用外部的state（服务端客户端共享）
const c1 = useConter()
console.log(c1.value)
const store = useMyStore();


const userCk = userInfoCookie()

userCk.value = {
  uid: 1234,
  username: '李四'
}

const user2 = useCookie('userInfo')
console.log(user2)

// useState nuxt3客户端和服务端友好的响应式state
const caca = useState('caca', () => '我是nuxt3的响应式state')
caca.value += ' hahahah'

const router = useRouter()
const userInfo = ref({
  id: "1",
  username: '张三'
})

const count = ref(0)
const good = () => {
  store.add()
}

const toChild = () => {
  router.push({
    path: '/parent/child',
    query: {userInfo: JSON.stringify(userInfo.value)}
  })
}

// const {data} = await userInfoFetch({method:"POST"})
// const {data} = await useHTTPFetch('/user',{method:"GET"})
// console.log('userInfoFetch', data.value)


//数据库查询
const {data,status,error} = await useHTTPFetch('/api/user',{method:"POST"})
console.log('useHTTPFetch', data.value)

</script>

<style scoped></style>