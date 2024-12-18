<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu :default-active="activeMenu" :collapse="isCollapse" :background-color="variables.menuBg" :text-color="variables.menuText" :unique-opened="false" :active-text-color="variables.menuActiveText" :collapse-transition="false" mode="vertical">
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

import { getPlatformList } from '@/api/api_platform'

export default {
  components: { SidebarItem, Logo },
  data () {
    return {
      routes: [
        // 静态添加“排行榜”路由（假设路径为/rank）
        {
          path: '/rank',
          component: () => import('@/views/rank/index.vue'),
          name: '排行榜',
          meta: { title: '排行榜' }
        },
      ],
    }
  },
  mounted () {
    this.getPlatList()
  },
  methods: {
    getPlatList () {
  
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    // routes () {
    //   let routesArr = this.$router.options.routes
    //   routesArr.forEach(item => {
    //     if (item.path === '/resource') {
    //       item.children = [...this.childMenu]
    //     }
    //   })
    //   console.info(JSON.stringify(routesArr))
    //   debugger
    //   return routesArr
    // },
    activeMenu () {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo () {
      return this.$store.state.settings.sidebarLogo
    },
    variables () {
      return variables
    },
    isCollapse () {
      return !this.sidebar.opened
    }
  }
}
</script>
