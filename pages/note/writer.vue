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
      <div class="create">
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
                  <a-menu-item>
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
      <!--编辑-->
      <div class="edit-note">
        <div style="height: 80px;line-height: 80px">
          <a-input style="font-size: 30px" :bordered="false"></a-input>
        </div>
        <Editor
            ref="editor"
            :plugins="plugins"
            :value="mdValue"
            @change="mdChange"
        />
      </div>
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
      width="20%"
      okText="提交"
      cancelText="取消"
  >
    <div>
      <p style="margin-top: 30px">确认删除文章《{{ 2 }}》，文章将被移动到回收站。</p>
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
import {notebookFetch, notesFetch} from "~/composables/useHTTPFetch";

const plugins = [
  gfm(),
  highlight()
]

//markdown传入的字符串
const mdValue = ref('')
const mdChange = (value: string) => {
  mdValue.value = value
}

/**
 * 文集相关
 */

const checkDataAndRefresh = (data: any) => {
  if (data.value.code === 0) {
    message.success(data.value.message, 1)
    refetchNotebook()
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
const {data: notebookData, refresh: refetchNotebook}: any = await notebookFetch({
  method: 'get',
  server: true,
})

if (notebookData.value) {
  if (notebookData.value.code === 1) {
    throw createError({statusCode: 500, statusMessage: notebookData.value.message})
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
      checkDataAndRefresh(data)
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
//文章请求操作
// const handleNotesAction = (options: { method: string, body: any }) => {
//   return new Promise((resolve) => {
//     notesFetch({
//       method: options.method,
//       body: options.body,
//       server: false,
//     }).then(({data}: any) => {
//       checkDataAndRefresh(data)
//     }).finally(() => {
//       resolve(true)
//     })
//   })
// }

    //当前文章的索引
const currentNoteIndex = ref(0)
// watch(currentNoteIndex, () => {
//   changeCurrentNoteIndex(0)
// },{immediate:true})

const changeCurrentNoteIndex = (index: number) => {
  //获取数据。。好像获取好了
  console.log('改变index', notesData.value[index])
  currentNoteIndex.value = index
  mdValue.value = notesData.value[index].content_md
}

//获取文集下面的文章
const notesData = ref<any>([])
const getNotes = async (isServer: boolean, notebookId: number | string) => {
  const {data}: any = await notesFetch({
    method: "get",
    server: isServer,
    params: {notebookId}
  })
  if (data && data.value && data.value.code === 0) {
    message.success(data.value.message, 1)
    console.log(data.value.data)
    notesData.value = data.value.data.list
    return data.value.data.list[0] ? data.value.data.list[0] : {}
  } else {
    return {}
  }
}
//监听文集选中，自动加载文章
watch(selectedNotebookItem, async (item) => {
  const firstNote = await getNotes(true, item.id)
  //第一次进入文集显示第一个md的内容
  mdValue.value = firstNote.content_md ? firstNote.content_md : ''
}, {immediate: true})


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
      }

      span {
        font-size: 16px;
        color: #595959;
        margin-left: 10px;
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
    }
  }

}

.edit-note {

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

.edit-note .bytemd-body img {
  width: 100%;
}

</style>
