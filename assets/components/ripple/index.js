import {
  debounce
} from '../../js/eventUtil'

const duration = 1000

const longpressDebounce = debounce((that) => {
  if (that.data._log) console.log('longpressDebounce')

  const time = Date.now() - that.data._hoverTime >= 800
  that.setData({
    longpress: that.data._hover && !that.data._over && time
  })
}, 800)

const animDebounce = debounce((that) => {
  if (that.data._log) console.log('animDebounce')

  const list = that.calcOvertime()
  // 防止特殊情况duration与动画结束不一致
  // if(list.length != 0){
  //   animDebounce(that)
  //   return
  // }

  that.setData({
    rippleOverlays: list
  })
}, duration)

Component({
  externalClasses: ['ripple-class', 'disabled-class'],
  properties: {
    hidden: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    },
    rippleStyle: String,
    rippleDisabledStyle: {
      type:String,
      value:'background-color: #DEDEE0;color: #9C9CA4;'
    },
    rippleColor: {
      type: String,
      observer(newVal) {
        if (newVal.indexOf('--ripple-color') === -1) {
          this.setData({
            rippleColor: '--ripple-color:' + newVal + ';'
          })
        }
      }
    },
    radius: {
      type: String,
      observer(newVal) {
        if (newVal.indexOf('--radius') === -1) {
          this.setData({
            radius: '--radius:' + newVal + ';'
          })
        }
      }
    }
  },
  data: {
    _hover: false, // 鼠标悬停
    _hoverTime: 0, // 鼠标悬停时长
    _over: false, // 鼠标悬停组件范围越界
    _rect: [], // 组件范围
    _duration: duration, // 动画时长
    _log: false, // 日志
    longpress: false, // 长按
    rippleOverlays: [], // 波纹数组
  },
  // attached() { //性能分析
  //   this.setUpdatePerformanceListener({withDataPaths: true}, (res) => {
  //     console.log(res)
  //   })
  // },
  ready() {

  },
  methods: {
    tapEvent() {
      if (this.data._log) console.log('tapEvent')
    },
    longpressEvent() {
      if (this.data._log) console.log('longpressEvent')
    },
    touchForceEvent() {
      if (this.data._log) console.log('touchForceEvent')
    },
    longTapEvent() {
      if (this.data._log) console.log('longTapEvent')
    },
    touchStartEvent(e) {
      if (this.data._log) console.log('touchStartEvent')

      this.data._hover = true
      this.data._over = false
      this.data._hoverTime = Date.now()

      const that = this
      const view = wx.createSelectorQuery().in(this).select('.ripple')
      view.boundingClientRect((rect) => {
        that.data._rect = rect
        const size = Math.max(that.data._rect.width, that.data._rect.height)
        const offset = -(size / 2)
        that.data.rippleOverlays.push({
          createTime: Date.now().toString(),
          x: '--x:' + (e.touches[0].clientX - that.data._rect.left) + 'px;',
          y: '--y:' + (e.touches[0].clientY - that.data._rect.top) + 'px;',
          size: '--size:' + size + 'px;',
          offset: '--offset:' + offset + 'px;',
          duration: '--duration:' + (that.data._duration / 1000) + 's;',
          animEnd: false
        })
        that.setData({
          rippleOverlays: that.data.rippleOverlays
        })

        longpressDebounce(that)
        animDebounce(that)
      }).exec()
    },
    touchMoveEvent(e) {
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      const left = this.data._rect.left
      const top = this.data._rect.top
      const right = this.data._rect.right
      const bottom = this.data._rect.bottom
      if (x < left || x > right || y > bottom || y < top) {
        if (this.data._log) console.log('touchMoveCancelEvent')

        this.data._over = true

        if (this.data.longpress) {
          this.setData({
            longpress: false
          })
        }
      }
    },
    touchCancelEvent() {
      if (this.data._log) console.log('touchCancelEvent')

      this.data._hover = false
    },
    touchEndEvent() {
      if (this.data._log) console.log('touchEndEvent')

      this.data._hover = false

      if (this.data.longpress) {
        this.setData({
          longpress: false
        })
      }

      if (!this.data._over && !this.data.disabled) this.triggerEvent('click')
    },
    animEndEvent() {
      if (this.data._log) console.log('animEndEvent')
    },
    calcOvertime() {
      const overlays = this.data.rippleOverlays
      const time = Date.now()
      const diff = []
      overlays.forEach((item) => {
        // 动画结束
        if (time - item.createTime < this.data._duration) diff.push(item)
      })

      return diff
    }
  }
})
