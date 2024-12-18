<template>
    <div class="hotspot">
        <el-table 
        :data="tableData"
        style="width: 100%; "
        class="custom-table">
        <el-table-column
        prop="id">
        </el-table-column>
        <el-table-column
        prop="goodsId">
        </el-table-column>
        <el-table-column prop="goodsScore">

        </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { getRank } from '@/api/api_rank'
export default {
    name: 'hotspot',
    props: {
        hotspotFlag: {
            type: Boolean
        }
    },
    data() {
        return {
            tableData:null
        }
    },
    watch: {
        hotspotFlag(newval) {
            if (newval) {
                this.hotspotFlag = newval
                console.log('hos:', this.hotspotFlag)
                this.getRankInfo()
            }
        }
    },
    mounted() {
        // this.getRankInfo()

        this.intervalId = setInterval(this.getRankInfo, 5000); // 使用setInterval 设置定时器，每5秒调用一次getRankInfo方法
    },
    beforeDestroy() {
        clearInterval(this.intervalId); // 在组件销毁前清楚定时器，避免内存泄漏
    },
    methods: {
        getRankInfo() {
            getRank(10).then(res => {
                if (res !== null) {
                    this.tableData = res
                    for (let i = 0; i < this.tableData.length; i++) {
                        this.tableData[i].id = i + 1
                    }
                }
            }).catch(err => {
                this.$message.error('Failed to fetch rank info');
            })
        }
    }
}
</script>

<style scoped>

.custom-table ::v-deep .el-table__header-wrapper th {
    display: none; /* 这应该隐藏表头 */
}

.custom-table ::v-deep .el-table__cell {
    text-align: center;
    vertical-align: middle;
}

</style>
