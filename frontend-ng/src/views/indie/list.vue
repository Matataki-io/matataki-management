<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="用户ID">
        <el-input v-model="search.uid" placeholder="请输入用户ID" clearable size="small" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="序号ID" width="80" prop="id_g" align="center" fixed />
      <el-table-column label="用户ID" width="130" prop="uid_g" align="center" fixed />
      <el-table-column label="子站仓库" width="160" prop="article_repo" align="center" />
      <el-table-column label="用户名" prop="username" align="center" />
      <el-table-column label="主帐号平台" width="120" prop="platform_u" align="center" />
      <el-table-column label="用户昵称" width="200" prop="nickname" align="center" />
      <el-table-column label="最后登录时间" width="140" prop="last_login_time" align="center">
        <template slot-scope="scope">
          {{ formatToRelativeTime(scope.row.last_login_time) }}
        </template>
      </el-table-column>
      <el-table-column label="GitHub帐号" width="180" prop="account" align="center" />
      <el-table-column label="编辑配置" width="140" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            plain
            @click="editConfigStore(scope.row.uid_g, scope.row.article_repo)"
          >编辑我方配置</el-button>
        </template>
      </el-table-column>
      <el-table-column label="编辑仓库文件" width="110" align="center">
        <template slot-scope="scope">
          <el-button
            type="success"
            size="small"
            plain
            @click="editGithubFile(scope.row.uid_g)"
          >编辑文件</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        :total="count"
        background
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
      />
    </div>
    <EditStoreDialog
      :uid="editing.uid"
      :article-repo="editing.articleRepo"
      :is-editing="isEditingStore"
      @close="isEditingStore = false"
      @update="handleCurrentChange(pageIndex)"
    />
    <EditFileDialog
      :uid="editing.uid"
      :is-editing="isEditingFile"
      @close="isEditingFile = false"
    />
  </div>
</template>

<script>
import Dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { isNull } from '@/utils/validate'
import EditStoreDialog from './components/EditStoreDialog'
import EditFileDialog from './components/EditFileDialog'
export default {
  components: { EditStoreDialog, EditFileDialog },
  data() {
    return {
      list: null,
      count: 0,
      listLoading: true,
      pageSize: 10,
      pageIndex: 1,
      search: { uid: null },
      isEditingStore: false,
      isEditingFile: false,
      editing: {
        uid: null,
        articleRepo: ''
      }
    }
  },
  created() {
    this.getList(1)
  },
  methods: {
    formatToRelativeTime(dates) {
      Dayjs.extend(relativeTime)
      return Dayjs().locale('zh-cn').to(Dayjs(dates))
    },
    editConfigStore(uid, articleRepo) {
      this.editing.uid = uid
      this.editing.articleRepo = articleRepo
      this.isEditingStore = true
    },
    editGithubFile(uid) {
      this.editing.uid = uid
      this.isEditingFile = true
    },
    handleCurrentChange(v) {
      this.getList(v)
    },
    searchList() {
      this.getList(1)
    },
    getList(pageIndex) {
      this.listLoading = true
      const search = {}
      for (const item in this.search) {
        if (!isNull(this.search[item])) {
          search[item] = this.search[item]
        }
      }
      this.request({
        url: this.apis.indieUsers,
        method: 'get',
        noLoading: true,
        params: {
          pageSize: this.pageSize,
          pageIndex: pageIndex || this.pageIndex,
          ...search
        }
      })
        .then(res => {
          this.listLoading = false
          this.list = res.data.list
          this.count = res.data.count
        })
        .catch(error => {
          if (error.response.status === 401) {
            console.log('登录超时')
            this.$store.dispatch('FedLogOut').then(() => {
              location.reload() // 为了重新实例化vue-router对象 避免bug
            })
          }
        })
    }
  }
}
</script>

<style scoped>
.pagination {
  text-align: center;
  margin: 20px 0 0 0;
}
</style>
