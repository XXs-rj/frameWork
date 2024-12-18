<template>
    <div class="searchContext-container">
        <el-descriptions title="商品信息">
            <el-descriptions-item label="商品名">{{ goodData.goodsId }}</el-descriptions-item>
            <el-descriptions-item label="商品评分">{{ goodData.goodsScore }}</el-descriptions-item>
            <el-descriptions-item label="商品价格">{{ goodData.price  }}</el-descriptions-item>
            <el-descriptions-item label="厂商名称">
            <el-tag size="small">{{  goodData.goodsName }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="热度">{{ goodData.popularity}}</el-descriptions-item>
        </el-descriptions>
    </div>
</template>

<script>

export default {
    props: {
        goodData: {
            type: Array,
            default: null
        }
        
    },
    data() {
        return {
            
        }
    },
}
</script>

<style scoped>

</style>


