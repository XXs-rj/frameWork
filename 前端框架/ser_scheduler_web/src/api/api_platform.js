import request from '@/utils/request'

//获取可用平台列表
export function getPlatformList() {
    return request({
        url: `/api/v1/compute/platform/info/list`,
        method: 'get'
    })
}

//获取平台基本信息
export function getPlatformInfo(params) {
    return request({
        // url: `/api/v1/control/task/info/selPage?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
        url: `/api/v1/compute/platform/info/getByCode?platformCode=${params.platformCode}`,
        method: 'get',
        data: params
    })
}

//获取平台统计信息
export function getPlatformStatisticsInfo(params) {
    return request({
        url: `/api/v1/compute/platform/info/statisticsByCode?platformCode=${params.platformCode}`,
        method: 'get'
    })
}

//获取平台节点统计信息
export function getPlatformNodeStatisticsInfo(params) {
    return request({
        url: `/api/v1/compute/platform/info/node/statisticsByCode?platformCode=${params.platformCode}`,
        method: 'get'
    })
}

//获取集群基本信息
export function getPlatformClusterInfo(params) {
    return request({
        url: `/api/v1/compute/platform/cluster/info/getByCode`,
        method: 'post',
        data: params
    })
}

//获取集群详情
export function getClusterInfoDetail(params) {
    return request({
        url: `/api/v1/compute/platform/cluster/info/get/detail?id=${params.id}`,
        method: 'get'
    })
}


//获取集群节点列表
export function getClusterNodeList(params) {
    return request({
        url: `/api/v1/compute/platform/node/info/page`,
        method: 'post',
        data: params
    })
}

//获取集群节点详情
export function getNodeInfoDetail(params) {
    return request({
        url: `/api/v1/compute/platform/node/info/detailByID?id=${params.id}`,
        method: 'get'
    })
}

//获取集群基本信息
export function getApplicationInfo(params) {
    return request({
        url: `/api/v1/compute/platform/application/info/getInfoPage`,
        method: 'post',
        data: params
    })
}

//获取调度详情
export function getDispatchScheduleDetail(params) {
    return request({
        url: `/api/v1/compute/dispatch/resourceScheduling/getScheduleInfo?scheduleId=${params.scheduleId}`,
        method: 'get'
    })
}

//获取集群映射关系
export function getDispatchClusterRelId(params) {
    return request({
        url: `/api/v1/compute/dispatch/cluster/rel/getClusterRel?sourceId=${params.sourceId}`,
        method: 'get'
    })
}

//创建应用
export function submitCreateSchedule(params) {
    return request({
        url: `/api/v1/compute/dispatch/resourceScheduling/createSchedule`,
        method: 'post',
        data: params
    })
}

//启动应用
export function startApp(appId) {
    return request({
        url: `/api/v1/compute/platform/application/info/start/app?appId=${appId}`,
        method: 'get'
    })
}

//停止应用
export function stopApp(appId) {
    return request({
        url: `/api/v1/compute/platform/application/info/stop/app?appId=${appId}`,
        method: 'get'
    })
}

//删除应用
export function deleteApp(params) {
    return request({
        url: `/api/v1/compute/dispatch/resourceScheduling/app/delete`,
        method: 'post',
        data: params
    })
}

//获取镜像信息
export function getImageRespositoryByName(params) {
    return request({
        url: `/api/v1/compute/platform/image/repository/byName?imageName=${params.imageName}`,
        method: 'get'
    })
}

//分页查询镜像列表
export function getImageRespositoryPage(params) {
    return request({
        url: `/api/v1/compute/platform/image/repository/page`,
        method: 'post',
        data: params
    })
}

//获取Pod详情
export function getNativePodDetail(params) {
    return request({
        url: `/api/v1/compute/platform/application/info/pod/detail`,
        method: 'post',
        data: params
    })
}
