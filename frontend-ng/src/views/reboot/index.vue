<template>
  <div class="reboot-page">
    <h1 class="title">重启服务</h1>
      <el-alert
      title="仅在无法完成后端交互时使用"
      type="warning">
    </el-alert>
    <p>先 Stop ，等待停止完成且返回结果无异常后，再操作 Start。</p>
    <el-button
      :disabled="isSendingCmd"
      type="danger"
      @click="trigger('start')"
    >Start</el-button>
    <el-button
      :disabled="isSendingCmd"
      type="danger"
      @click="trigger('stop')"
    >Stop</el-button>
    <div v-if="apiResult" class="output">
      <h2 class="subtitle">操作结果</h2>
      <pre class="cmd-output">{{ apiResult }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Reboot',
  data: () => ({
    apiResult: null,
    isSendingCmd: false
  }),
  methods: {
    async trigger(scriptName) {
      try {
        this.isSendingCmd = true
        const { data: result } = await axios.get('/_switch_status_api/', {
          params: {
            scriptName
          }
        })
        this.apiResult = result.cmdExecResult
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.$message.error(`Server Error: ${error.response.data}`)
        } else {
          this.$message.error(`Error when switching server: ${error}`)
        }
      } finally {
        this.isSendingCmd = false
      }
    }
  }
}
</script>

<style scoped>
.reboot-page {
    margin: 2rem;
}
.cmd-output {
    background: black;
    color: gray;
}
</style>
