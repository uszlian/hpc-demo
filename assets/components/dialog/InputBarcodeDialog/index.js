var behavior = require('../behavior')

import {
  throttl
} from '../../../js/eventUtil';

Component({
  externalClasses: ['btn-class'],
  behaviors: [behavior],
  properties: {

  },
  data: {
    rippleStyle: 'background-color:#FEE002;width: 600rpx;height: 88rpx;border-radius: 44rpx;font-size: 32rpx;font-weight: bold;justify-content: center; margin-top: 23rpx;',
    inputEnabled: false,
    dialogBarcodePath: "https://img.hpcang.com/mp_hpc/queryPrice/ico_manual_input_dialog_barcode.png",
    dialogHeaderClosePath: "https://img.hpcang.com/mp_hpc/queryPrice/ico_manual_input_dialog_close.png",
    result: null
  },
  observers:{
    'show'(show){
      if(show === 'true'){
        this.setData({
          result: null,
          inputEnabled: false
        })
      }
    }
  },
  methods: {
    dialogInputEvevt(event) {
      this.setData({
        result: event.detail.value,
        inputEnabled: event.detail.value.trim() !== ""
      })
    },
    dialogInputCloseEvevt(event){
      this.setData({
        result: null,
        inputEnabled: false
      })
    },
    dialogConfirmEvevt(event) {
      confirmThrottl(this)
    }
  }
})

const confirmThrottl = throttl((context)=>{
  context.triggerEvent('confirm', {
    result: context.data.result.trim()
  })
})