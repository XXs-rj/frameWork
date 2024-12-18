
// import { NODE_ENV_PROD } from '../../configs/constants'
const NODE_ENV = process.env.NODE_ENV

export const API_URL_PREFIX = '/ui/api/v2'
export const API_V3_URL_PREFIX = '/ui/api/v3'
export const DEFAULT_IMAGE_POOL = 'k8s-pool'
export const DEFAULT_REGISTRY = 'default'
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
export const CREATE_APP_ANNOTATIONS = 'system/schemaPortname'
export const LABEL_APPNAME = 'system/appName'
export const USERNAME_REG_EXP = /^[a-z][-a-z0-9]{1,40}[a-z0-9]$/
export const USERNAME_REG_EXP_OLD = /^[a-z][-a-z0-9_]{1,40}[a-z0-9]$/
export const USERNAME_REG_EXP_NEW = /^[a-z][-a-z0-9]{3,38}[a-z0-9]$/
export const STORAGENAME_REG_EXP = /^[a-z][-a-z0-9_]{2,14}$/
export const EMAIL_REG_EXP = /^([a-z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/
export const VERSION_REG_EXP = /\bv\d\.\d\.\d/
export const URL_REG_EXP = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
export const SEARCH = /(^\s+)|(\s+$)/g
export const REG = /^(?:2)\d{2}$/
export const HOST = 'localhost:8003'
export const AVATAR_HOST = 'https://dn-tenx-avatars.qbox.me/'

// When these actions occurs the page will render to ErrorPage(StatusCode === 404 || StatusCode >= 500).
export const SHOW_ERROR_PAGE_ACTION_TYPES = [
  'APP_DETAIL_FAILURE',
  'CONTAINER_DETAIL_FAILURE',
  'USER_DETAIL_FAILURE'
]
export const LOGIN_EXPIRED_MESSAGE = 'LOGIN_EXPIRED'
export const MY_SPACE = {
  name: '我的个人项目',
  spaceName: '我的个人项目',
  teamName: '我的帐户',
  namespace: 'default',
  projectName: 'default',
  teamID: 'default'
}
export const MAX_LOGS_NUMBER = 500
// export const MIN_PAY_AMOUNT = (NODE_ENV === NODE_ENV_PROD ? 5 : 0.01)
export const MAX_PAY_AMOUNT = 50000
// export const PAY_AMOUNT_STEP = (NODE_ENV === NODE_ENV_PROD ? 1 : 0.01)
export const MIN_NOTIFY_AMOUNT = 1
export const EMAIL_HASH = {
  'qq.com': 'http://mail.qq.com',
  'gmail.com': 'http://mail.google.com',
  'sina.com': 'http://mail.sina.com.cn',
  '163.com': 'http://mail.163.com',
  'vip.163.com': 'vip.163.com',
  'vip.sina.com': 'vip.sina.com',
  '126.com': 'http://mail.126.com',
  'yeah.net': 'http://www.yeah.net/',
  'sohu.com': 'http://mail.sohu.com/',
  'tom.com': 'http://mail.tom.com/',
  'sogou.com': 'http://mail.sogou.com/',
  '139.com': 'http://mail.10086.cn/',
  'hotmail.com': 'http://www.hotmail.com',
  'live.com': 'http://login.live.com/',
  'live.cn': 'http://login.live.cn/',
  'live.com.cn': 'http://login.live.com.cn',
  '188.com': 'www.188.com',
  '189.com': 'http://webmail16.189.cn/webmail/',
  '189.cn': 'webmail15.189.cn/webmail',
  'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
  'yahoo.cn': 'http://mail.cn.yahoo.com/',
  'eyou.com': 'http://www.eyou.com/',
  '21cn.com': 'http://mail.21cn.com/',
  // '188.com': 'http://www.188.com/',
  'foxmail.coom': 'http://www.foxmail.com',
  'wo.com.cn': 'mail.wo.com.cn/smsmail'
}
export const TIMESTRAP = 1483084989915
export const PAYMENT_REQUIRED_CODE = 402
export const UPGRADE_EDITION_REQUIRED_CODE = 412
export const LICENSE_EXPRIED_CODE = 451
export const DATE_PIRCKER_FORMAT = 'YYYY-MM-DD'
export const ASYNC_VALIDATOR_TIMEOUT = 800
export const LOAD_STATUS_TIMEOUT = 2000
export const UPDATE_INTERVAL = 1000 * 60
export const LOAD_INSTANT_INTERVAL = 10000
export const USER_3RD_ACCOUNT_TYPES = ['wechat']
export const WECHAT_SIGNUP_HASH = '#wechat'
export const RESOURCES_DIY = 'DIY'
export const RESOURCES_MEMORY_MIN = 100
export const RESOURCES_MEMORY_STEP = 100
export const RESOURCES_MEMORY_MAX = 262144 // 256G
export const RESOURCES_CPU_MIN = 0.1
export const RESOURCES_GPU_MIN = 1
export const RESOURCES_NPU_MIN = 1
export const RESOURCES_CPU_DEFAULT = 0.5
export const RESOURCES_CPU_STEP = 0.1
export const RESOURCES_GPU_STEP = 1
export const RESOURCES_CPU_MAX = 128 // 128 CPU
export const RESOURCES_GPU_MAX = 128 // 128 GPU
export const RESOURCES_NPU_MAX = 8
export const RESOURCES_DCU_MAX = 8

export const SYSTEM_DEFAULT_SCHEDULE = 'tenx_system_default_schedule'
export const LITE = 'lite'
export const MAX_CHARGE = 200000
export const CHARGE_NUMBERS = [10, 20, 50, 100]
export const NOT_AVAILABLE = 'N/A'
export const BASE_IMAGE_TYPE = [
  {
    key: 1,
    text: '单元测试'
  },
  {
    key: 2,
    text: '代码编译'
  },
  {
    key: 3,
    text: '构建镜像'
  },
  {
    key: 4,
    text: '集成测试'
  },
  {
    key: 101,
    text: '依赖服务'
  },
  {
    key: 6,
    text: '人工审批'
  }
]
export const NEED_BUILD_IMAGE = false
export const PLUGIN_DEFAULT_CONFIG = {
  'bpm-operator': {
    limits: {
      cpu: 1,
      memory: 512
    },
    requests: {
      cpu: 0.1,
      memory: 256
    }
  },
  alertmanager: {
    limits: {
      cpu: 0.5,
      memory: 256
    },
    requests: {
      cpu: 0.5,
      memory: 256
    }
  },
  'metrics-server': {
    limits: {
      cpu: 1,
      memory: 512
    },
    requests: {
      cpu: 0.1,
      memory: 256
    }
  },
  'custom-metrics-apiserver': {
    limits: {
      cpu: 1,
      memory: 1000
    },
    requests: {
      cpu: 0.5,
      memory: 500
    }
  },
  'dubbo-operator': {
    limits: {
      cpu: 0.1,
      memory: 200
    },
    requests: {
      cpu: 0.1,
      memory: 200
    }
  },
  elastalert: {
    limits: {
      cpu: 1,
      memory: 512
    },
    requests: {
      cpu: 0.15,
      memory: 256
    }
  },
  'elasticsearch-logging': {
    limits: {
      cpu: 2,
      memory: 4096
    },
    requests: {
      cpu: 1,
      memory: 4096
    }
  },
  'fluentd-elk': {
    limits: {
      cpu: 1,
      memory: 1024
    },
    requests: {
      cpu: 0.2,
      memory: 1024
    }
  },
  grafana: {
    limits: {
      cpu: 0.1,
      memory: 512
    },
    requests: {
      cpu: 0.1,
      memory: 256
    }
  },
  'hadoop-cluster-operator': {
    limits: {
      cpu: 0.1,
      memory: 200
    },
    requests: {
      cpu: 0.1,
      memory: 200
    }
  },
  'iscsi-provisioner': {
    limits: {
      cpu: 0.1,
      memory: 200
    },
    requests: {
      cpu: 0.1,
      memory: 200
    }
  },
  'kube-keepalived-vip': {
    limits: {
      cpu: 0.1,
      memory: 100
    },
    requests: {
      cpu: 0.1,
      memory: 100
    }
  },
  'kube-state-metrics': {
    limits: {
      cpu: 0.01,
      memory: 50
    },
    requests: {
      cpu: 0.01,
      memory: 50
    }
  },
  'local-volume-provisioner': {
    limits: {
      cpu: 0.1,
      memory: 128
    },
    requests: {
      cpu: 0.1,
      memory: 8
    }
  },
  'mongodb-cluster-operator': {
    limits: {
      cpu: 1,
      memory: 512
    },
    requests: {
      cpu: 0.1,
      memory: 256
    }
  },
  'mysql-cluster-operator': {
    limits: {
      cpu: 1,
      memory: 512
    },
    requests: {
      cpu: 0.1,
      memory: 256
    }
  },
  'node-exporter': {
    limits: {
      cpu: 1,
      memory: 200
    },
    requests: {
      cpu: 0.01,
      memory: 100
    }
  },
  prometheus: {
    limits: {
      cpu: 1,
      memory: 2048
    },
    requests: {
      cpu: 1,
      memory: 2048
    }
  },
  'rabbitmq-cluster-operator': {
    limits: {
      cpu: 1,
      memory: 512
    },
    requests: {
      cpu: 0.1,
      memory: 256
    }
  },
  'redis-cluster-operator': {
    limits: {
      cpu: 0.1,
      memory: 200
    },
    requests: {
      cpu: 0.1,
      memory: 200
    }
  },
  tiller: {
    limits: {
      cpu: 0.5,
      memory: 512
    },
    requests: {
      cpu: 0.5,
      memory: 512
    }
  }
}
export const SHOW_BILLING = true
export const DEFAULT_SHARE_DIR = '/tenxcloud-tmp-dir'
export const DEACTIVE = 0
export const ACTIVE = 1
export const DEFAULT_ALGORITHM = 'X86'
export const GPU_ALGORITHM = 'GPU'
export const GPU_ALGORITHM_NV = 'GPU_NV'
export const GPU_ALGORITHM_OR = 'GPU_OR'
export const GPU_ALGORITHM_OR_ENV = [
  { value: 'ORION_CROSS_NODE=1', envValueType: '' },
  { value: 'ORION_ENABLE_LPC=1', envValueType: '' },
  { value: 'ORION_CLIENT_ID=orion_client1', envValueType: '' },
  { value: 'ORION_GROUP_ID=POD_IP', envValueType: 'Podkey' },
  { value: 'ORION_K8S_POD_NAME=POD_NAME', envValueType: 'Podkey' },
  { value: 'ORION_K8S_POD_UID=POD_IP', envValueType: 'Podkey' }
]

export const NPU_ALGORITHM = 'NPU'
export const DCU_ALGORITHM = 'DCU'
export const MLU_ALGORITHM = 'MLU'

export const NO_CLASSIFY = 'noclassify' // 未分类配置组
export const CONFIGMAP_CLASSIFY_CONNECTION = '-configmap-classify-'
export const GPU_KEY = 'nvidia.com/gpu'
export const AI_MODELAPP_URL = '/ai-deep-learning/ai-model-service'
export const OTHER_IMAGE = 'other/registry'
export const CONNECT_FLAG = '-connect-'
export const KEYCLOAK_TOKEN = 'KEYCLOAK_TOKEN'
export const KEYCLOAK_REFRESHTOKEN = 'KEYCLOAK_REFRESHTOKEN'
export const HEADER_HEIGHT = 50

export const flowContainerIN = 'kubernetes.io/ingress-bandwidth' // 入口流量
export const flowContainerOut = 'kubernetes.io/egress-bandwidth' // 出口流量
export const LOCALE_SCRIPT_ID = 'locale-js'
export const PodKeyMapping = {
  POD_NAME: 'metadata.name',
  POD_NAMESPACE: 'metadata.namespace',
  POD_IP: 'status.podIP',
  NODE_IP: 'status.hostIP'
}
export const LimitFlowContainer = 1024

export const FULL_TENANT_VIEW = 'TENANT-GLOBAL'

export const NOT_SHOW_403_MODAL_TODAY = 'not_show_403_modal_today'

export const CLUSTER_TYPE_OCP = 6

export const ES_LOG_MAX_PAGE = 1000
export const USER_CURRENT_CONFIG = 'tce_user_current_config'
export const METRICS_DEFAULT_SOURCE = 'prometheus' // influxdb || prometheus
export const METRICS_CPU = 'cpu/usage_rate'
export const METRICS_COMPUTE = 'gpu/ai_core_usage_rate' // nvidia
export const METRICS_COMPUTE_HUAWEI = 'npu/ai_core_usage_rate' // huawei
export const METRICS_MEMORY = 'memory/usage'
export const METRICS_GPU = 'gpu/memory_usage_rate'
export const METRICS_GPU_HUAWEI = 'npu/memory_usage_rate'
export const METRICS_NETWORK_RECEIVED = 'network/rx_rate'
export const METRICSS_NETWORK_TRANSMITTED = 'network/tx_rate'
export const METRICSS_DISK_READ = 'disk/readio'
export const METRICSS_DISK_WRITE = 'disk/writeio'
export const ANNOTATION_SVC_SCHEMA_PORTNAME = 'system/schemaPortname'
export const ANNOTATION_HTTPS = 'system/https'
export const ANNOTATION_LBGROUP_NAME = 'system/lbgroup'
export const CERT_REGEX = /^-----BEGIN CERTIFICATE-----\n(.+\n)+-----END CERTIFICATE-----$/
export const PRIVATE_KEY_REGEX = /^-----BEGIN RSA PRIVATE KEY-----\n(.+\n)+-----END RSA PRIVATE KEY-----$/
export const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const INSTANCE_AUTO_SCALE_MAX_CPU = 99
export const INSTANCE_AUTO_SCALE_MAX_MEMORY = 99
export const TENX_MARK = 'tenxcloud.com'
