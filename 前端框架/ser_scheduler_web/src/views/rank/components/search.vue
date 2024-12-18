<template>
    <div class="search-container">
        <div v-if="suggestions.length > 0" >
            <div
                v-for="(suggestion, index) in suggestions"
                :key="index"
                @click="selectSuggestion(suggestion)"
                style="padding-bottom: 0.5%;"
                class="suggestion-item"
            >
            {{ suggestion }}
            </div>
        </div>
    </div>
</template>
  
  <script>
  export default {
    props: {
        suggestions: {
            type: Array
        },
        searchQuery: {
            type: String
        }
    },
    data() {
      return {
        suggestions: [],
        result: ''
      };
    },
    watch: {
        searchQuery(newval) {
            console.log('data:', this.searchQuery)
        }

    },
    methods: {
      selectSuggestion(suggestion) {
        this.result = suggestion;
        this.suggestions = []; // 清空建议列表
        this.$emit('receiveData', this.result)
      }
    }
  };
  </script>
  
  <style scoped>

/* 设置每个建议项的样式 */
.suggestion-item {
    width: 270px; /* 根据需要调整宽度 */
    height: 40px; /* 根据需要调整高度 */
    padding: 10px; /* 内边距 */
    cursor: pointer; /* 鼠标悬停时显示为手型 */
    background-color: #fff; /* 背景颜色 */
    /* border-bottom: 1px solid #ddd; 分隔线 */
}
 
/* 设置鼠标悬停时的灰蓝色效果 */
.suggestion-item:hover {
    background-color: #e0f7fa;  /* 灰蓝色背景 */
}
  </style>