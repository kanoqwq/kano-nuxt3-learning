<template>
  <a-row style="height: 100vh">
    <!--文集列表-->
    <a-col :span="4">
      <div class="notebook">
        <div class="notebook-top">
          <a-button @click="" class="go-btn" type="primary" ghost shape="round">回首页</a-button>
          <div @click="showModal" class="add-notebook">
            <icon name="mdi:plus-thick"></icon>
            新建文集
          </div>
          <div class="create-notebook" v-if="showCreateNb">
            <a-input v-model:value="notebookName" class="notebook-input" placeholder="请输入文集名称..."></a-input>
            <div class="action-box">
              <a-button @click="addNotebook" size="small" shape="round" ghost>提交</a-button>
              <a-button @click="showCreateNb=false" style="color: #9a9a9a" type="text">取消</a-button>
            </div>
          </div>
        </div>
        <div class="notebook-center">
          <template v-if="notebookData && notebookData.data">
            <div class="notebook-c-item" :class="currentNotebookIndex === notebookIndex ?'active':''"
                 v-for="(notebookItem,notebookIndex) in notebookData.data"
                 :key="notebookItem.id"
                 @click="selectNoteBook(notebookItem, notebookIndex)"
            >
              <span>{{ notebookItem.name }}</span>
              <a-dropdown
                  v-if="currentNotebookIndex === notebookIndex"
                  overlayClassName="overlayClassName">
                <a style="color: #ffffff" @click.prevent>
                  <icon name="ant-design:setting-filled"></icon>
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="showEditNotebook()">
                      <a-row type="flex" justify="center" align="middle">
                        <icon name="ep:edit" style="margin-right: 5px"></icon>
                        修改文集
                      </a-row>
                    </a-menu-item>
                    <a-menu-item @click="showDeleteNotebook()">
                      <a-row type="flex" justify="center" align="middle">
                        <icon name="ep:delete" style="margin-right: 5px"></icon>
                        删除文集
                      </a-row>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </template>

        </div>
      </div>
    </a-col>
    <a-col :span="5" class="note-writer-list">
      <!--文章列表-->
      <div class="create" @click="createNote">
        <icon name="ep:circle-plus-filled" style="margin-right: 5px"></icon>
        新建文章
      </div>
      <div class="note-create">
        <template v-if="notesData.length">
          <div
              class="note-create-item "
              :class="currentNoteIndex === noteIndex ? 'active':''"
              @click="changeCurrentNoteIndex(noteIndex)"
              v-for="(note,noteIndex) in notesData"
              :key="note.id"
          >
            <icon name="ph:file-text-fill" class="text-icon"></icon>
            <span>{{ note.title }}</span>
            <a-dropdown :trigger="['click']" overlayClassName="overlayClassName">
              <a style="color: #595959" @click.prevent>
                <icon name="ant-design:setting-filled"></icon>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <a-row type="flex" justify="center" align="middle">
                      <icon name="mdi:share" style="margin-right: 5px"></icon>
                      直接发布
                    </a-row>
                  </a-menu-item>
                  <a-menu-item>
                    <a-row type="flex" justify="center" align="middle">
                      <icon name="ep:folder-opened" style="margin-right: 5px"></icon>
                      移动文章
                    </a-row>
                  </a-menu-item>
                  <a-menu-item @click="isShowDeleteNoteModal = true">
                    <a-row type="flex" justify="center" align="middle">
                      <icon name="ep:delete" style="margin-right: 5px"></icon>
                      删除文章
                    </a-row>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </div>
    </a-col>
    <a-col :span="15">
      <a-spin tip="Loading..." :spinning="noteLoading">
        <!--编辑-->
        <div class="edit-note">
          <div style="height: 80px;line-height: 80px">
            <a-input style="font-size: 30px" :bordered="false" v-model:value="currentNoteData.title"
                     @change="handleInput"></a-input>
          </div>
          <Editor
              ref="editor"
              :plugins="plugins"
              v-model:value="currentNoteData.content_md"
              @change="mdChange"
              :uploadImages="handleUploadImages"
          />
        </div>
      </a-spin>
    </a-col>

  </a-row>
  <!--修改文集弹框-->
  <a-modal
      v-model:open="isShowNotebookEditModal"
      @ok="handleEditNotebook"
      width="25%"
      title="修改文集"
      okText="提交"
      cancelText="取消"
  >
    <a-input style="height: 40px" placeholder="输入文集名称" v-model:value="selectedNotebookItem.name"></a-input>
  </a-modal>
  <!--删除文集弹框-->
  <a-modal
      v-model:open="isShowDeleteNotebookModal"
      @ok="handleDeleteNotebook"
      width="20%"
      okText="提交"
      cancelText="取消"
  >
    <div>
      <p style="margin-top: 30px">确认删除文集《{{ selectedNotebookItem.name }}》?</p>
    </div>
  </a-modal>

  <!--删除文章弹框-->
  <a-modal
      v-model:open="isShowDeleteNoteModal"
      @ok="deleteNote"
      width="20%"
      okText="提交"
      cancelText="取消"
  >
    <div>
      <p style="margin-top: 30px">确认删除文章《{{ currentNote && currentNote.title }}》，文章将被移动到回收站。</p>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import 'bytemd/dist/index.css'
import 'highlight.js/styles/default.css'
import '@/public/css/github-markdown-light.css'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
//@ts-ignore
import {Editor} from "@bytemd/vue-next";
import {imageCosFetch, imageFetch, notebookFetch, noteFetch, notesFetch} from "~/composables/useHTTPFetch";
import {debounce} from '~/utils/helper/index'

const plugins = [
  gfm(),
  highlight(),
  {
    actions: [{
      title: '立即发布',
      icon: '<span>立即发布</span>',
      position: "right",
      handler: {
        type: 'action',
        click(ctx: any) {
          notePush()
        }
      }
    }]
  }
]


const handleUploadImages = async (file: FileList) => {
  //上传图片
  console.log(file)
  let formData = new FormData()
  formData.append('file', file[0])
  const {data}: any = await imageFetch({
    method: 'POST',
    body: formData
  })
  // const {data}: any = await imageCosFetch({
  //   method: 'POST',
  //   body: formData
  // })

  if (data.value.code === 0) {
    message.success('上传图片成功！', 1)
  }
  console.log(data.value)
  return [{url: data.value.data.imgUrl}]
}

/**
 * 文集相关
 */


const checkDataAndRefresh = (data: any, refresh: () => any, needMsg?: boolean = true) => {
  if (data.value.code === 0) {
    if (needMsg) message.success(data.value.message, 1)
    refresh && refresh()
  }
}

const notebookName = ref<string>('')
//添加文集相关
const showCreateNb = ref(false)
const showModal = () => {
  showCreateNb.value = !showCreateNb.value;
}

//被选中的文集index
const currentNotebookIndex = ref(0)

//获取文集
const {data: notebookData, refresh: refreshNotebook}: any = await notebookFetch({
  method: 'get',
  server: true,
})

if (notebookData.value) {
  if (notebookData.value.code === 1) {
    throw createError({statusCode: 500, statusMessage: notebookData.value.message})
  }
}

const refetchNotebook = async () => {
  await refreshNotebook()
  const data = notebookData.value.data
  //如果删除的是最后一个文集
  if (currentNotebookIndex.value === data.length) {
    selectNoteBook(data[data.length - 1], data.length - 1)
  }
  //如果删除的是第一个文集
  else if (currentNotebookIndex.value === data.length) {
    selectNoteBook(data[0], 0)
  } else {
    // 如果删除的是中间的文集
    selectNoteBook(data[currentNotebookIndex.value], currentNotebookIndex.value)
  }

}


//当前选中的文集
const selectedNotebookItem = ref<any>({})

//选中文集
const selectNoteBook = (item: any, index: number) => {
  currentNotebookIndex.value = index
  selectedNotebookItem.value = toRaw(item)
  //重置文章的index
  currentNoteIndex.value = 0
}

//文集数据准备完成时初始化selectedNotebookItem第一项
if (notebookData.value.data) {
  selectedNotebookItem.value = notebookData.value.data[0]
}

//文集请求操作
const handleNotebookAction = (options: { method: string, body: any }) => {
  return new Promise((resolve) => {
    notebookFetch({
      method: options.method,
      body: options.body,
      server: false,
    }).then(({data}: any) => {
      checkDataAndRefresh(data, refetchNotebook)
    }).finally(() => {
      resolve(true)
    })
  })
}

//添加文集
const addNotebook = () => {
  if (notebookName.value.trim() === '') {
    message.warn("请填写文集名称", 1)
    return
  }
  handleNotebookAction({
    method: 'post', body: {
      name: notebookName.value,
    }
  }).then(() => {
    notebookName.value = ''
  })
}


//编辑文集
const isShowNotebookEditModal = ref(false)
const showEditNotebook = () => {
  isShowNotebookEditModal.value = true
}
const handleEditNotebook = () => {
  if (selectedNotebookItem.value) {
    if (selectedNotebookItem.value.name.trim() === '') {
      message.warn('请填写文集名称');
      return
    }
    //修改文集名称
    handleNotebookAction({
      method: 'put', body: {
        name: selectedNotebookItem.value.name,
        id: selectedNotebookItem.value.id,
      }
    })
    isShowNotebookEditModal.value = false
  }
}


//删除文集
const isShowDeleteNotebookModal = ref(false)
const showDeleteNotebook = () => {
  isShowDeleteNotebookModal.value = true
}
const handleDeleteNotebook = () => {
  if (selectedNotebookItem.value) {
    //修改文集名称
    handleNotebookAction({
      method: 'delete',
      body: {
        id: selectedNotebookItem.value.id,
      }
    })
    isShowDeleteNotebookModal.value = false
  }
}


/**
 * 文章相关
 */
const noteLoading = ref(true)
//当前文章的索引
const currentNoteIndex = ref(0)
//当前文章（不含md）
const currentNote = computed(() => notesData.value[currentNoteIndex.value])
//当前选中文章的完整数据
const currentNoteData = ref<any>({})

//改变noteindex，获取文章内容
let loadDebounce: any = null
const changeCurrentNoteIndex = async (index: number) => {
  noteLoading.value = true
  currentNoteIndex.value = index
  currentNoteData.value = {content_md: ''}
  //获取具体文章数据
  if (currentNote.value && currentNote.value.id) {
    const {data}: any = await noteFetch({
      method: "get",
      server: true,
      params: {noteId: currentNote.value.id}
    })
    if (data && data.value && data.value.code === 0) {
      currentNoteData.value = data.value.data
    }
  }
  clearTimeout(loadDebounce)
  loadDebounce = setTimeout(() => {
    noteLoading.value = false
  }, 300)
}

//获取文集下面的文章(不含md内容)（暂时用不着分页）
const notesData = ref<any>([])
const getNotes = async (isServer: boolean, notebookId: number | string, needMsg?: boolean = true) => {
  const {data}: any = await notesFetch({
    method: "get",
    server: isServer,
    params: {notebookId, pageSize: 99999999}
  })
  if (data && data.value && data.value.code === 0) {
    notesData.value = data.value.data.list
    return data.value.data.list[0] ? data.value.data.list[0] : {}
  } else {
    return {}
  }
}

//notesData重新获取时刷新当前noteIndex位置
watch(notesData, () => {
  //如果删除的是最后一个文章
  if (currentNoteIndex.value === notesData.value.length) {
    changeCurrentNoteIndex(notesData.value.length - 1)
  }
  //如果删除的是第一个文章
  else if (currentNoteIndex.value === notesData.value.length) {
    changeCurrentNoteIndex(0)
  } else {
    // 如果删除的是中间的文章
    changeCurrentNoteIndex(currentNoteIndex.value)
  }
})

//监听文集选中，自动加载文章
watch(selectedNotebookItem, async (item) => {
  await getNotes(true, item.id)
}, {immediate: true})


//文章请求需要用到当前notebook的id
const currentNotebookId = computed(() => notebookData.value.data[currentNotebookIndex.value].id)

//文章请求操作
const handleNoteAction = (options: { method: string, body?: any, params?: any }, needMsg?: boolean = true) => {
  return new Promise((resolve) => {
    noteFetch({
      method: options.method,
      body: options.body || {},
      params: options.params || {},
      server: false,
    }).then(({data}: any) => {
      checkDataAndRefresh(data, () => getNotes(true, currentNotebookId.value), needMsg)
    }).finally(() => {
      resolve(true)
    })
  })
}

//新建文章
const createNote = async () => {
  //新建文章
  await handleNoteAction({method: 'post', body: {notebookId: currentNotebookId.value}})
  //选中到新建的文章
  await changeCurrentNoteIndex(0)
}

//发布文章
const notePush = async (state?: number, needMsg?: boolean = true) => {
  if (currentNoteData.value.title && currentNoteData.value.content_md) {
    await handleNoteAction({
      method: 'put', body: {
        noteId: currentNoteData.value.id,
        title: currentNoteData.value.title,
        content_md: currentNoteData.value.content_md,
        state: state ? state : currentNoteData.value.state,
      }
    }, needMsg)
  }
}

//标题改变时自动保存
const handleInput = debounce(() => notePush.bind(null, 1, false), 1000)

//内容改变时自动保存(1分钟一次)
let timer: any = null
const mdChange = (value: string) => {
  currentNoteData.value.content_md = value
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    notePush(1, false)
    console.log('change')
  }, 60000)
}

//删除文章是否显示
const isShowDeleteNoteModal = ref()

//删除文章
const deleteNote = async () => {
  await handleNoteAction({method: 'delete', body: {noteId: currentNote.value.id}})
  isShowDeleteNoteModal.value = false
}

</script>

<style lang="scss" scoped>
.notebook {
  height: 100%;
  background-color: #404040;

  .notebook-top {
    padding: 20px;

    .go-btn {
      width: 100%;
      height: 40px;
      font-size: 16px;
    }

    .add-notebook {
      margin-top: 20px;
      color: #ffffff;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .notebook-input {
      margin-top: 20px;
      background-color: #595959;
      border: none;
      height: 36px;
      color: #ffffff;
    }

    .action-box {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center
    }
  }

  .notebook-center {
    .active {
      background-color: #666666;
      border-left: 3px solid #EC7259 !important;
      padding-left: 14px !important;
    }

    .notebook-c-item {
      height: 40px;
      line-height: 40px;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 17px;

      &:hover {
        background-color: #666666;
      }

      span {
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

    }
  }
}

.note-writer-list {
  overflow: hidden;
  display: flex;
  flex-direction: column;

  border-right: 1px #E8E8E8 solid;
  height: 100%;

  .create {
    padding: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #595959;
    font-size: 15px;
    border-bottom: 1px solid #E8E8E8;

    svg {
      margin-right: 6px;
    }
  }

  .note-create {
    overflow: auto;
    display: flex;
    flex-direction: column;
    height: 100%;

    .active {
      background-color: #E6E6E6;
      border-left: 3px #EC7259 solid;
      padding-left: 17px !important;
    }

    .note-create-item {
      border-bottom: 1px #E8E8E8 solid;
      padding: 20px;
      display: flex;
      justify-content: space-between;

      .text-icon {
        color: #BEBEBE;
        font-size: 25px;
        flex-shrink: 0;
      }

      span {
        font-size: 16px;
        color: #595959;
        margin-left: 10px;
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

}

</style>

<style>
.overlayClassName .ant-dropdown-content .ant-dropdown-menu {
  border-radius: 8px !important;
  width: 130px;
  padding: 10px 0 !important;
}

.notebook-top .ant-input:focus, .ant-input-focused {
  border-color: #595959;
  box-shadow: 0 0 0 2px #595959 !important;
  border-right-width: 1px !important;
  outline: 0;
}

.create-notebook .ant-btn.ant-btn-background-ghost {
  color: #42C02E;
  border-color: #42C02E;
  height: 30px;
}

.ant-modal-footer {
  padding: 10px 16px;
  text-align: right;
  background: transparent;
  border-top: none;
  border-radius: 0 0 2px 2px;
}

.ant-modal-header {
  padding: 16px 24px;
  color: rgba(0, 0, 0, 0.85);
  background: #fff;
  border-bottom: none;
  border-radius: 2px 2px 0 0;
}

.edit-note .bytemd {
  height: calc(100vh - 80px) !important;
}

.edit-note .bytemd-toolbar-right [bytemd-tippy-path='5'] {
  display: none;
}

.edit-note .bytemd-toolbar-right [bytemd-tippy-path='6'] {
  padding: 5px;
}

.edit-note .bytemd-body img {
  width: 100%;
}

</style>
