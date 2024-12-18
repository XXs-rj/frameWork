
import DictApi from '../api/api_sysdict'
/**
 * 返回字典值对应的label
 * @param {*} dataList 字典数据列表
 * @param {*} value  字典值
 */
const findLabel = function (dataList, value) {
  if (!dataList || !dataList.length || !value) {
    return ''
  }
  for (const dataItem of dataList) {
    if (dataItem.value === value) {
      return dataItem.label
    }
    const children = dataItem.children
    if (!children || !children.length) {
      continue
    }
    const sublabel = findLabel(children, value)
    if (sublabel) { return sublabel }
  }
  return ''
}
export default {
  namespaced: true,
  state: {
    // 数据字典 key：字典标识  ：value List
    dictDataMap: {},
    // 字典列表，不包含数据
    dictList: [],
    // 字典标识-->  字典值-->字典值对象
    treeDictMap: {}
  },
  mutations: {
    SET_DICT_DATAMAP (state, dictDataMap) {
      state.dictDataMap = dictDataMap
    },
    SET_DICT_List (state, dictList) {
      state.dictList = dictList
    },
    SET_TREE_MAP (state, treeDictMap) {
      state.treeDictMap = treeDictMap
    }
  },
  actions: {
    loadDict ({ commit }) {
      DictApi.getAllDictWithData().then(result => {
        commit('SET_DICT_DATAMAP', result)
      })
      DictApi.getDictList().then(result => {
        commit('SET_DICT_List', result)
      })
      DictApi.getTreeWithData().then(result => {
        commit('SET_TREE_MAP', result)
      })
    }
  },
  getters: {
    /**
     * 获取字典数据
     * @param {*} state
     * @param dictName  字典标识
     */
    // useage: this.$store.getters['dict/getDict'](this.dictName)
    getDict: (state) => (dictName) => {
      if (state.dictDataMap[dictName]) { return state.dictDataMap[dictName] } else { return [] }
    },
    /**
     * 获取字典列表
     * @param {} state
     */
    // useage: this.$store.getters['dict/getDictList']
    getList: (state) => {
      return state.dictList
    },
    /**
     * 获取分类字典的子分类
     * 如省市字典表，值获取其中一个省的数据
     * useage: this.$store.getters['dict/getSubTree'](dictName, dicValue)
     * @param {*} state
     * @param {*} dictName : 字典名
     * @param {*} dicValue : 字典值
     */
    getSubTree: (state) => (dictName, dicValue) => {
      const dictTree = state.treeDictMap[dictName]
      if (!dictTree || !dictTree[dicValue]) { return [] }
      return dictTree[dicValue]
    },
    /**
     * 字典值翻译,用于通过字典值,获取字典值标签
     * useage: this.$store.getters['dict/getLabel'](dictName, dicValue)
     * @param {*} state
     * @param {*} dictName : 字典名
     * @param {*} dicValue : 字典值
     */
    getLabel: (state) => (dictName, dicValue) => {
      const dictDataList = state.dictDataMap[dictName]
      return findLabel(dictDataList, dicValue)
    }
  }

}
