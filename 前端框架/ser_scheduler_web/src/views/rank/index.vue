<template>
    <div class="rank">
        <el-container>
          <el-header class="custom-header" style="height: 100px;">
            <span class="header-text">头条热榜</span>
          </el-header>  
          <el-footer class="custon-footer" style="width: 100%; ">
            <el-tabs v-model="activeName" @tab-click="handleClick" class="custom-tabs">
                <!-- <el-tab-pane label="今日头条" name="first">
                    <search></search>
                </el-tab-pane> -->
                <el-tab-pane label="今日搜索" name="second">
                    <div class="search-box">
                        <el-row>
                            <el-col :span="4">
                                <el-input
                                    type="text"
                                    v-model="searchQuery"
                                    @input="fetchSuggestions"
                                    placeholder="Search..."
                                    class="search-input"
                                    clearable
                                />
                                <!-- </el-input> -->
                            </el-col>
                            <el-col :span="1">
                                <el-button @click="getSearch">搜索</el-button>
                            </el-col>
                        </el-row>

                    <search :search-query="searchQuery" :suggestions="suggestions" @receiveData="ReceiveSearchQuery"
                    style="margin-left: 2.5%; margin-top: 1%;"></search>
                    </div>
                    <searchContext v-if="searchFlag" :good-data="goodData" style="margin-left: 2.5%; margin-top: 5%;"></searchContext>
                    <span v-else style="margin-left: 2%; margin-top:8%">暂无数据</span>
                </el-tab-pane>
                <el-tab-pane label="热点" name="third">
                    <hotspot :hotspot-flag="hotspotFlag"></hotspot>
                </el-tab-pane>
            </el-tabs>
          </el-footer>
        </el-container>
    </div>
</template>

<script>
import hotspot from './components/hotspot.vue'
import search from './components/search.vue'
import searchContext from './components/searchContext.vue'
import { getSearchInfo, searchGoods } from '@/api/api_rank'
import searchContextVue from './components/searchContext.vue'

export default {
    name: 'Rank',
    components: {
        hotspot,
        search,
        searchContext
    },
    data() {
        return {
            activeName: 'second',
            searchQuery: '',
            suggestions: [],
            searchFrom: {
                userId: '小刘',
                goodsId: '',
                tableName: 'business_goods_rank',
            },
            hotspotFlag: false,
            searchFlag: false,
            goodData: null
        }
    },
    watch: {
        searchQuery(newval) {
            this.searchQuery = newval
        }
    },
    methods: {
        handleClick() {
            if (this.activeName === 'third') {
                this.hotspotFlag = true
            }else {
                this.hotspotFlag = false
            }
        },
        fetchSuggestions() {
            if (this.searchQuery !== '') {
                getSearchInfo(this.searchQuery).then(res => {
                this.suggestions = res
                })
            }

        },
    //   selectSuggestion(suggestion) {
    //     this.searchQuery = suggestion;
    //     this.suggestions = []; // 清空建议列表
    //   },
        ReceiveSearchQuery(query) {
            console.log('data1:', query)
            this.suggestions = []
            this.searchQuery = query
        },
        getSearch() {
            this.searchFrom.goodsId = this.searchQuery
            if (this.searchQuery !== ''){
                searchGoods(this.searchFrom).then(res => {
                if(res.statusCode === 200) {
                    if(res.data !== null){
                        this.searchFlag = true
                        this.goodData = res.data
                    } else {
                        this.searchFlag = false
                    }
                    this.$message.success(res.message)
                    
                } else {
                    this.searchFlag = false
                    this.$message.error('查询失败')
                }
                })
            }

        }
    }
}
</script>

<style lang="scss" scoped>
.custom-header {
    background-image: url(../../assets/rank/rankHeader.png);
    background-size: cover;  // 确保背景图片覆盖整个Header
    display: flex;
    justify-content: center;  // 使内容居中
    align-items: center;  // 使内容垂直居中
    .header-text {
        font-size: 40px;
        color: #fff;
    }
}

::v-deep .custom-tabs  {
    width: 100%;
}

::v-deep .custom-tabs .el-tabs__nav-wrap {
    width: 100%;
}

::v-deep .custom-tabs .el-tabs__nav-wrap .el-tabs__item {
    font-size: 20px;
    height: 50px;
    width: 630px;
    padding-left: 550px;
    margin-top:20px;
    text-align: center;
    
}

.custon-footer {
    
}

.search-input {
    width: 300px; /* 根据需要调整宽度 */
    height: 40px; /* 根据需要调整高度 */
    // padding: 10px; /* 增加内边距使输入更舒适 */
    font-size: 16px; /* 调整字体大小 */
    border: 1px solid #ccc; /* 添加边框 */
    border-radius: 4px; /* 添加圆角 */
    box-sizing: border-box; /* 确保宽度包括内边距和边框 */
    margin-left: 10%;
    margin-top: 1%;
}
</style>
