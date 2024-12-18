import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import entities from './modules/entities'
import errorLog from './modules/errorLog'
import global from './modules/global'
import layout from './modules/layout'
import sysInfo from './modules/sysInfo'
import systemLock from './modules/systemLock'
import terminal from './modules/terminal'
import viewCache from './modules/viewCache'
import loading from './modules/loading'

import appCenter from './appModules/appCenter'
import appStore from './appModules/appStore'
import cluster from './appModules/cluster'
import clusterNode from './appModules/clusterNode'
import configReducers from './appModules/config'
import databaseCache from './appModules/databaseCache'
import harbor from './appModules/harbor'
import ipPool from './appModules/ipPool'
import loadBalance from './appModules/loadBalance'
import overviewCluster from './appModules/overviewCluster'
import quickCreateApp from './appModules/quickCreateApp'
import secrets from './appModules/secrets.js'
import serviceMesh from './appModules/serviceMesh'
import storage from './appModules/storage'
import terminalApp from './appModules/terminal'
import workloadItem from './appModules/workloadItem'
import workloadTerminal from './appModules/workloadTerminal'
import app4Paas from './modules/app4Paas'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    entities,
    global,
    layout,
    errorLog,
    sysInfo,
    systemLock,
    terminal,
    viewCache,
    loading,

    appCenter,
    appStore,
    databaseCache,
    harbor,
    quickCreateApp,
    serviceMesh,
    storage,
    overviewCluster,
    cluster,
    clusterNode,
    ipPool,
    loadBalance,
    configReducers,
    secrets,
    terminalApp,
    workloadItem,
    workloadTerminal,
    app4Paas
  },
  getters
})

export default store
