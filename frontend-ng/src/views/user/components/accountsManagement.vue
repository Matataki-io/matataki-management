<template>
  <div>
    <el-switch
      v-model="switchStatus"
      active-text="显示"
      inactive-text="隐藏"
    />
    <div v-if="switchStatus" style="margin: 20px 0 0 0;">
      <el-table
        :data="userAccounts"
        style="width: 100%"
      >
        <el-table-column
          prop="account"
          label="账号"
        />
        <el-table-column
          prop="platform"
          label="平台"
          width="200"
        />
        <el-table-column
          prop="platform"
          label="操作"
          width="120"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.platform === 'email'"
              size="mini"
              type="danger"
              @click="mode = 'modify'"
            >修改密码</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button
        v-if="!haveEmail"
        type="primary"
        size="mini"
        style="margin: 20px 0;"
        @click="mode = 'bind'"
      >绑定邮箱</el-button>
      <el-form v-if="mode === 'modify'" ref="ruleFormPassword" :model="ruleFormPassword" :rules="rulesPassword" label-width="100px" style="margin: 20px 0 0 0;">
        <el-form-item label="原密码" prop="name">
          <el-input value="**********" type="password" disabled="disabled" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="ruleFormPassword.password" show-password placeholder="请输入密码" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPassword">
          <el-input v-model="ruleFormPassword.checkPassword" show-password placeholder="请输入密码" autocomplete="new-password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleFormPassword')">立即修改</el-button>
        </el-form-item>
      </el-form>
      <el-form v-if="mode === 'bind'" ref="ruleFormEmail" :model="ruleFormEmail" :rules="rulesEmail" label-width="100px" style="margin: 20px 0 0 0;">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="ruleFormEmail.email" type="text" placeholder="请输入邮箱" autocomplete="off" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="ruleFormEmail.password" show-password placeholder="请输入密码" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPassword">
          <el-input v-model="ruleFormEmail.checkPassword" show-password placeholder="请输入密码" autocomplete="new-password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleFormEmail')">立即绑定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const validatePass = (rule, value, callback) => {
      if (value !== this.ruleFormPassword.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    const validatePassEmail = (rule, value, callback) => {
      if (value !== this.ruleFormEmail.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      ruleFormPassword: {
        password: '',
        checkPassword: ''
      },
      rulesPassword: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ]
      },
      ruleFormEmail: {
        email: '',
        password: '',
        checkPassword: ''
      },
      rulesEmail: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' }
        ],
        checkPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' },
          { validator: validatePassEmail, trigger: 'blur' }
        ]
      },
      userAccounts: [],
      switchStatus: false,
      mode: '' // modify bind
    }
  },
  computed: {
    haveEmail() {
      return this.userAccounts.find(i => i.platform === 'email')
    }
  },
  watch: {
    switchStatus() {
      this.getUsers()
    }
  },
  mounted() {
    if (this.switchStatus) {
      this.getUsers()
    }
  },
  methods: {
    async getUsers() {
      try {
        const res = await this.request({
          url: `${this.apis.userAccounts}`,
          method: 'get',
          params: {
            uid: this.$route.params.id
          }
        })
        if (res.code === 0) {
          console.log('res', res)
          this.userAccounts = res.data
        }
      } catch (e) {
        console.log('e', e)
      }
    },
    async userAccountsUpdatePass({ password, key }) {
      try {
        const res = await this.request({
          url: `${this.apis.userAccountsUpdatePass}`,
          method: 'put',
          data: {
            uid: this.$route.params.id,
            password: password,
            key
          }
        })
        if (res.code === 0) {
          console.log('res', res)
          this.$message.success('更新成功')
        }
      } catch (e) {
        console.log('e', e)
      }
    },
    async userAccountsBindEmail({ email, password, key }) {
      try {
        const res = await this.request({
          url: `${this.apis.userAccountsBindEmail}`,
          method: 'post',
          data: {
            email,
            uid: this.$route.params.id,
            password: password,
            key
          }
        })
        if (res.code === 0) {
          console.log('res', res)
          this.$message.success('绑定成功')
          this.getUsers()
          this.mode = ''
        }
      } catch (e) {
        console.log('e', e)
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const submit = ({ key }) => {
            if (formName === 'ruleFormPassword') {
              this.userAccountsUpdatePass({ password: this.ruleFormPassword.password, key })
            } else if (formName === 'ruleFormEmail') {
              this.userAccountsBindEmail({ email: this.ruleFormEmail.email, password: this.ruleFormEmail.password, key })
            }
          }

          this.$prompt('请输入安全码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPlaceholder: '请输入安全码',
            inputType: 'password'
          }).then(({ value }) => {
            submit({ key: value })
          }).catch(() => {
          })
        } else {
          this.$message.error('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
