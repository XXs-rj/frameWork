export default {
  namespaced: true,
  state: {
    pageHeight: window.innerHeight,
    showTab: true,
    layout: '', // 导航方式
    overallStyle: '', // 整体风格
    primaryColor: {}, // 主题色
    tabStyle: {}, // 标签页样式
    asideWidth: 0, // 侧边导航宽度
    hideHeader: false,
    hideAside: false,
    hideTabs: false,
    isFromAi: false

  },
  mutations: {
    SET_PAGEHEIGHT: (state, pageHeight) => {
      state.pageHeight = pageHeight
    },
    SET_SHOWTAB: (state, showTab) => {
      state.showTab = showTab
    },
    SET_LAYOUT: (state, mode) => {
      state.layout = mode
    },
    SET_OVERALLSTYLE: (state, style) => {
      state.overallStyle = style
    },
    SET_PRIMARYCOLOR: (state, style) => {
      state.primaryColor = style
    },
    SET_ASIDEWIDTH: (state, w) => {
      state.asideWidth = w
    },
    SET_TABSTYLE: (state, style) => {
      state.tabStyle = style
    },
    SET_HIDEHEADER: (state, bool) => {
      state.hideHeader = bool
    },
    SET_HIDEASIDE: (state, bool) => {
      state.hideAside = bool
    },
    SET_HIDETABS: (state, bool) => {
      state.hideTabs = bool
    },
    SET_ISFORMAI: (state, bool) => {
      state.isFromAi = bool
    }
  },
  getters: {
    getPageHeight: state => state.pageHeight - (state.showTab ? 50 : 0),
    getShowTab: state => state.showTab,
    getLayout: state => state.layout,
    getOverallStyle: state => state.overallStyle,
    getPrimaryColor: state => state.primaryColor,
    getTabStyle: state => state.tabStyle,
    getAsideWidth: state => state.asideWidth,
    getHideHeader: state => state.hideHeader,
    getHideAside: state => state.hideAside,
    getHideTabs: state => state.hideTabs,
    getIsFromAi: state => state.isFromAi

  },
  actions: {
    setPageHeight ({ commit }, pageHeight) {
      commit('SET_PAGEHEIGHT', pageHeight)
    },
    setShowTab ({ commit }, showTab) {
      commit('SET_SHOWTAB', showTab)
    },
    setLayout ({ commit }, mode) {
      commit('SET_LAYOUT', mode)
    },
    setOverallStyle ({ commit }, style) {
      commit('SET_OVERALLSTYLE', style)
    },
    setPrimaryColor ({ commit }, style) {
      commit('SET_PRIMARYCOLOR', style)
    },
    setTabStyle ({ commit }, style) {
      commit('SET_TABSTYLE', style)
    },
    setAsideWidth ({ commit }, w) {
      commit('SET_ASIDEWIDTH', w)
    },
    setHideHeader ({ commit }, bool) {
      commit('SET_HIDEHEADER', bool)
    },
    setHideAside ({ commit }, bool) {
      commit('SET_HIDEASIDE', bool)
    },
    setHideTabs ({ commit, state }, bool) {
      commit('SET_HIDETABS', bool)
      if (bool) {
        const tabStyle = state.tabStyle || {}
        tabStyle.isOpen = false
        commit('SET_TABSTYLE', tabStyle)
      }
    },
    setIsFromAi ({ commit }, bool) {
      commit('SET_ISFORMAI', bool)
    }
  }
}
