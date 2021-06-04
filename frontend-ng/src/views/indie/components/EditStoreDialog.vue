<template>
  <div>
    <el-dialog
      :title="`编辑用户信息中，用户id：${uid}`"
      :visible="isEditing"
      :before-close="handleClose"
      width="510px"
      center
    >
      <el-form ref="form" style="padding-top: 15px" :model="form" label-position="left" label-width="120px">
        <el-form-item label="仓库名称">
          <el-input
            v-model="form.repo"
            type="text"
            placeholder="请输入仓库名称"
          />
        </el-form-item>
        <el-form-item label="子站状态（int）">
          <el-input
            v-model="form.siteStatus"
            type="text"
            placeholder="1或0，代表子站已创建与否"
            maxlength="1"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <div class="postform">
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
    },
    articleRepo: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      form: {
        uid: null,
        repo: null,
        siteStatus: null
      }
    }
  },
  watch: {
    articleRepo() {
      this.form.repo = this.articleRepo
    }
  },
  methods: {
    submit() {
      this.form.uid = this.uid

      this.request({
        url: this.apis.indieSettings,
        method: 'post',
        data: this.form
      }).then(() => {
        this.$notify({
          title: '修改成功',
          message: '内容已刷新',
          type: 'success'
        })
        this.$emit('update')
      }).catch((error) => {
        this.$notify({
          title: '修改失败',
          message: error,
          type: 'error'
        })
      })

      this.handleClose()
    },
    handleClose() {
      /* clear the last used content */
      this.status = null
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.postform {
  display: flex;
  justify-content: space-between;
  padding: 0;
  font-size: 16px;
}

.postform-message {
  padding-left: 20px;
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
