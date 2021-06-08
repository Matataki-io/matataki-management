<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="id">
        <el-input v-model="search.id" placeholder="请输入用户ID" clearable size="small" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="search.username" placeholder="请输入用户名" clearable size="small" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="search.nickname" placeholder="请输入昵称" clearable size="small" />
      </el-form-item>
      <el-form-item label="只看推荐">
        <el-switch v-model="search.is_recommend" @change="getList(1)" />
      </el-form-item>
      <el-form-item label="有权限发币">
        <el-switch v-model="search.isMint" @change="getList(1)" />
      </el-form-item>
      <el-form-item label="有权限免验证码">
        <el-switch v-model="search.no_captcha" @change="getList(1)" />
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
      <el-table-column label="id" prop="id" width="60" align="center" fixed>
        <template slot-scope="scope">
          <el-link :href="getMatatakiArticleUrl(scope.row.id)" target="_blank" type="primary">
            {{ scope.row.id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="头像" width="60" align="center" fixed>
        <template slot-scope="scope">
          <a :href="getMatatakiArticleUrl(scope.row.id)" target="_blank">
            <img v-if="scope.row.avatar" :src="getImg(scope.row.avatar)" alt="头像" width="100%">
          </a>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="130" prop="username" align="center" fixed />
      <el-table-column label="邮箱" width="160" prop="email" align="center" />
      <el-table-column label="昵称" prop="nickname" align="center" />
      <el-table-column label="自我介绍" width="110" align="center" prop="introduction" />
      <el-table-column label="来源平台" width="80" align="center" prop="platform" />
      <el-table-column label="注册时间" width="90" align="center" prop="create_time">
        <template slot-scope="scope">
          {{ formatToRelativeTime(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="最后登录时间" width="90" align="center" prop="last_login_time">
        <template slot-scope="scope">
          {{ formatToRelativeTime(scope.row.last_login_time) }}
        </template>
      </el-table-column>
      <el-table-column label="注册IP" width="110" align="center" prop="reg_ip" />
      <el-table-column label="最后登录IP" width="110" align="center" prop="last_login_ip" />
      <el-table-column label="是否推荐" width="80" align="center" fixed="right">
        <template slot-scope="scope">
          <el-switch
            :value="Boolean(scope.row.is_recommend)"
            @change="handleChange(scope.$index, $event, 'isRecommend')"
          />
        </template>
      </el-table-column>
      <el-table-column label="是否免验证码" width="80" align="center" fixed="right">
        <template slot-scope="scope">
          <el-switch
            :value="Boolean(scope.row.no_captcha)"
            @change="handleChange(scope.$index, $event, 'noCaptcha')"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="种子用户" width="80" align="center" fixed="right">
        <template slot-scope="scope">
          <el-switch
            :value="(scope.row.status & userStatus.isSeed) === userStatus.isSeed"
            @change="handleChange(scope.$index, $event, 'isSeed')"
          />
        </template>
      </el-table-column>
      <el-table-column label="发币用户" width="80" align="center" fixed="right">
        <template slot-scope="scope">
          <el-switch
            :value="(scope.row.status & userStatus.isMint) === userStatus.isMint"
            @change="handleChange(scope.$index, $event, 'isMint')"
          />
        </template>
      </el-table-column>
      <el-table-column label="交易权限" width="80" align="center" fixed="right">
        <template slot-scope="scope">
          <el-switch
            :value="(scope.row.status & userStatus.isExchange) === userStatus.isExchange"
            @change="handleChange(scope.$index, $event, 'isExchange')"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="60" fixed="right">
        <template slot-scope="scope">
          <router-link :to="`/user/detail/${scope.row.id}`" target="_blank">
            <el-button type="text" size="small">详情</el-button>
          </router-link>
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
  </div>
</template>

<script>
import Dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { isNull } from '@/utils/validate'
import { userStatus } from '@/utils/consts'
export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      count: 0,
      listLoading: true,
      pageSize: 10,
      pageIndex: 1,
      search: {
        id: '',
        username: '',
        nickname: '',
        is_recommend: false,
        no_captcha: false,
        isMint: false
      },
      userStatus: userStatus
    }
  },
  computed: {
    getMatatakiHostByEnv() {
      switch (process.env.NODE_ENV) {
        case 'development': return 'https://test.matataki.io'
        case 'production': return 'https://www.matataki.io'
        default: return 'http://local-dev.matataki.io:8080'
      }
    }
  },
  created() {
    this.getList(1)
  },
  methods: {
    handleChange(idx, value, type) {
      console.log(value, type)
      const user = this.list[idx]
      this.request({
        url: `${this.apis.user}/${user.id}`,
        method: 'put',
        data: {
          [type]: value
        }
      }).then(res => {
        if (res.code === 0) {
          this.$message.success('修改成功')
          this.getList(this.pageIndex)
        }
      })
    },
    getMatatakiArticleUrl(id) {
      const host = this.getMatatakiHostByEnv
      return `${host}/user/${id}`
    },
    getImg(hash) {
      return `${this.apis.imgHost}${hash}`
    },
    fromUnixTimestamp(v) {
      return v * 1000
    },
    formatToRelativeTime(dates) {
      Dayjs.extend(relativeTime)
      return Dayjs().locale('zh-cn').to(Dayjs(dates))
    },
    toUnixTimestamp(v) {
      return Math.round(v / 1000)
    },
    searchList() {
      this.getList(1)
    },
    handleCurrentChange(v) {
      this.getList(v)
    },
    toDetail(id) {
      this.$router.push({
        path: `/user/detail/${id}`
      })
    },
    getList(pageIndex) {
      this.listLoading = true
      const search = {}
      for (const item in this.search) {
        if (!isNull(this.search[item])) {
          if (['is_recommend', 'isMint'].indexOf(item) >= 0) {
            search[item] = this.search[item] ? '1' : ''
          } else {
            search[item] = this.search[item]
          }
        }
      }
      this.request({
        url: this.apis.user,
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
          this.list = res.data.rows
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
