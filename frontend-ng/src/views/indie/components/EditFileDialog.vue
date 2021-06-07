<template>
  <div>
    <el-dialog
      :title="`正在${isCreate ? '新建' : '编辑'}用户id：${uid}的${editingFile}文件`"
      :visible="isEditing"
      :before-close="handleClose"
      width="510px"
      center
    >
      <div class="postform">
        <el-switch
          v-model="isCreate"
          style="display: block"
          active-color="#13ce66"
          inactive-color="#409eff"
          active-text="创建新文件"
          inactive-text="编辑现有文件"
        />
      </div>
      <div class="postform">
        <div style="flex: 2" class="postform-message">
          <el-input
            v-model="filename"
            type="text"
            placeholder="source/_posts/filename.md"
            @change="editingFile = filename"
          >
            <template slot="prepend">/</template>
          </el-input>
        </div>
        <div class="postform-button">
          <el-button size="small" type="success" :disabled="isCreate" @click="readFile">加载文件内容</el-button>
        </div>
      </div>

      <el-input
        v-model="content"
        type="textarea"
        :autosize="{ minRows: 10 }"
        placeholder="此处输入文件内容…"
      />

      <div slot="footer" class="dialog-footer">
        <div class="postform" style="margin-bottom: 0;">
          <div class="postform-message">
            <span>提交之前请务必仔细确认用户id和编辑项目！警示！</span>
          </div>
          <div class="postform-button">
            <el-button style="width: 60%" type="primary" @click="submit">确定</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    isEditing: {
      type: Boolean,
      default: () => false
    },
    uid: {
      type: Number,
      default: () => null
    }
  },
  data() {
    return {
      isCreate: false,
      filename: '',
      editingFile: '',
      editingFileHash: '',
      content: '',
      branch: 'source'
    }
  },
  methods: {
    readFile() {
      this.request({
        url: this.apis.indieFile,
        method: 'get',
        params: {
          uid: this.uid,
          branch: this.branch,
          path: encodeURIComponent(this.editingFile)
        }
      }).then((res) => {
        if (res.code === 0) {
          this.editingFileHash = res.data.hash
          this.content = res.data.content
          this.$notify({
            title: '文件读取成功',
            message: '内容已写入编辑框',
            type: 'success'
          })
        } else {
          throw new Error(res.data.message)
        }
      }).catch((error) => {
        this.$notify({
          title: '文件读取失败',
          message: error,
          type: 'error'
        })
      })
    },
    submit() {
      const data = { content: this.content }

      if (this.editingFileHash !== '') {
        data.originHash = this.editingFileHash
      }

      this.request({
        url: this.apis.indieFile,
        method: 'post',
        params: {
          uid: this.uid,
          branch: this.branch,
          path: encodeURIComponent(this.editingFile)
        },
        data
      }).then((res) => {
        if (res.code === 0) {
          this.$notify({
            title: '文件编辑成功',
            message: '数据已写入仓库',
            type: 'success'
          })
        } else {
          throw new Error(res.data.message)
        }
      }).catch((error) => {
        this.$notify({
          title: '文件编辑失败',
          message: error,
          type: 'error'
        })
      })
      this.handleClose()
    },
    handleClose() {
      /* clear the last used content */
      this.isCreate = false
      this.filename = ''
      this.editingFile = ''
      this.editingFileHash = ''
      this.content = ''
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.postform {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  font-size: 16px;
  padding-left: 20px;
}

.postform-message {
  display: inline-flex;
  align-items: center;
  justify-content: space-around;
  flex: 1;
}

.postform-button {
  display: inline-flex;
  align-items: center;
  justify-content: space-around;
  flex: 1;
}
</style>
