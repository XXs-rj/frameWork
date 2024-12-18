
export default {
  userStatusTypeList: [
    {
      value: 'normal',
      label: '正常'
    },
    {
      value: 'forbidden',
      label: '禁用'
    },
    {
      value: 'lock',
      label: '锁定'
    }
  ],
  // vdc状态
  vdcStatusList: [
    {
      value: 'normal',
      label: '正常',
      className: 'putOn',
      classIcon: 'el-icon-circle-check',
      tag: ''
    },
    {
      value: 'disable',
      label: '禁用',
      className: 'putDown',
      classIcon: 'el-icon-circle-close',
      tag: 'danger'

    },
    {
      value: 'deleted',
      label: '删除',
      className: 'putDown',
      classIcon: 'el-icon-circle-close',
      tag: 'danger'
    },
    {
      value: 'arrears',
      label: '欠费',
      className: 'putAlarm',
      classIcon: 'el-icon-lock',
      tag: 'warning'
    },
    {
      value: 'halt',
      label: '停机',
      className: 'putDown',
      classIcon: 'el-icon-circle-close',
      tag: 'warning'
    },
    {
      value: 'freeze',
      label: '冻结',
      className: 'putAlarm',
      classIcon: 'el-icon-lock',
      tag: 'warning'
    },
    {
      value: 'cancel',
      label: '销户',
      className: 'putDown',
      classIcon: 'el-icon-circle-close',
      tag: 'danger'
    }
  ],
  // 交易类型
  tradeTypeList: [
    {
      value: 'recharge',
      label: '充值'
    },
    {
      value: 'payMoney',
      label: '支付扣款'
    },
    {
      value: 'refund',
      label: '退款'
    },
    {
      value: 'credit',
      label: '授信'
    },
    {
      value: 'release',
      label: '解冻'
    },
    {
      value: 'freeze',
      label: '冻结'
    }
  ],
  // 状态
  statusList: [
    {
      value: 'success',
      label: '成功'
    },
    {
      value: 'failure',
      label: '失败'
    }
  ],
  // 产品类型
  prodCodeList: [
    {
      value: 'SERVICESOURCE_ECOLOGY-inference',
      label: 'AI推理'
    },
    {
      value: 'SERVICESOURCE_ECOLOGY-aitrain',
      label: 'AI训练'
    },
    {
      value: 'OPENSTACK_BM',
      label: '云物理机'
    },
    {
      value: 'OPENSTACK_VM',
      label: '云主机'
    }
  ],
  expireList: [
    {
      value: 'SERVICESOURCE_ECOLOGY-inference',
      label: 'AI推理'
    },
    // {
    //   value: 'SERVICESOURCE_ECOLOGY-aitrain',
    //   label: 'AI训练'
    // },
    {
      value: 'OPENSTACK_BM',
      label: '云物理机'
    }
    // {
    //   value: 'OPENSTACK_VM',
    //   label: '云主机'
    // }
  ],
  // 包年or包月类型
  billTypeList: [
    {
      value: 'byYear',
      label: '包年'
    },
    {
      value: 'byMonth',
      label: '包月'
    },
    {
      value: 'byHour',
      label: '按小时'
    },
    {
      value: 'byNeed',
      label: '按量'
    },
    {
      value: 'byNumber',
      label: '按次'
    },
    {
      value: 'none',
      label: '不计费'
    }
  ],
  billList: [
    {
      value: 'byYear',
      label: '包年'
    },
    {
      value: 'byMonth',
      label: '包月'
    },
    {
      value: 'byHour',
      label: '按小时'
    },
    {
      value: 'byNeed',
      label: '按量'
    },
    {
      value: 'byNumber',
      label: '按次'
    }
  ],
  // 订单类型
  orderTypeList: [
    {
      value: 'apply',
      label: '订购'
    },
    {
      value: 'modify',
      label: '变更'
    },
    {
      value: 'cancel',
      label: '退订'
    },
    {
      value: 'delay',
      label: '延期'
    },
    {
      value: 'renew',
      label: '续订'
    }
  ],
  // 订单状态
  orderStatus: [
    {
      value: 'feeFreeze',
      label: '已冻结',
      className: 'putAlarm',
      classIcon: 'el-icon-lock'
    },
    {
      value: 'UnsubscribeSuccessfully',
      label: '退订成功',
      className: 'putOn',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'resReleaseSuccess',
      label: '资源释放成功',
      className: 'putOn',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'resReleaseFail',
      label: '资源释放失败',
      className: 'putDown',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'resCreateSuccess',
      label: '资源已创建',
      className: 'putOn',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'resCreateFail',
      label: '资源创建失败',
      className: 'putDown',
      classIcon: 'el-icon-circle-close'
    },
    {
      value: 'feePay',
      label: '已支付',
      className: 'putOn',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'finished',
      label: '已完成',
      className: 'putOn',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'refund',
      label: '已退款',
      className: 'putOn',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'running',
      label: '处理中',
      className: 'putOn',
      classIcon: 'el-icon-loading'
    },
    {
      value: 'UnsubscribeFailed',
      label: '退订失败',
      className: 'putDown',
      classIcon: 'el-icon-circle-close'
    },
    {
      value: 'resPartCreateSuccess',
      label: '部分成功',
      className: 'putAlarm',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'resRenewSuccess',
      label: '续订成功',
      className: 'putOn',
      classIcon: 'el-icon-circle-check'
    },
    {
      value: 'resRenewFail',
      label: '续订失败',
      className: 'putDown',
      classIcon: 'el-icon-circle-close'
    }

  ],
  permissionTypeList: [
    // {
    //   label: '菜单',
    //   value: 'menu'
    // },
    {
      label: '页面',
      value: 'page'
    }
    // {
    //   label: '按钮',
    //   value: 'button'
    // },
    // {
    //   label: '文件',
    //   value: 'file'
    // }
  ],
  userTypeList: [
    {
      label: '系统用户',
      value: 'sys_user'
    }
    // {
    //   label: '云平台用户',
    //   value: 'cloud_user'
    // }
  ],
  // 到期时间
  expiredTime: [
    {
      label: '1天内到期',
      value: 'withInOne'
    },
    {
      label: '7天内到期',
      value: 'withInSeven'
    },
    {
      label: '15天内到期',
      value: 'withInFifteen'
    },
    {
      label: '30天内到期',
      value: 'withInThirty'
    }
  ],
  operUserTypeList: [
    {
      label: '云平台',
      value: 'user'
    },
    {
      label: '计费子系统',
      value: 'manager'
    },
    {
      label: 'none',
      value: 'none'
    }
  ]
}

