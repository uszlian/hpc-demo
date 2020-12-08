Component({
  externalClasses: ['dialog-class', 'anim-in', 'anim-out'],
  properties: {
    show: {
      type: String,
      observer(newVal, oldVal) {
        if (newVal != "") {
          if (newVal === "true") {
            this.showDialog()
          } else {
            this.dismissDialog()
          }
        }
      }
    },
    dialogStyle:String,
    dialogAnimInStyle:String,
    dialogAnimOutStyle:String,
    cancelable: {
      type: Boolean,
      value: true
    },
    animType: {
      type: String,
      value: null,
      observer(newVal, oldVal) {
        if (newVal === "bottom") {
          this.setData({
            animIn: 'dialogBottom bottomAnimIn',
            animOut: 'dialogBottom bottomAnimOut',
          })
        } else if (newVal === "center") {
          this.setData({
            animIn: 'dialogCenter centerAnimIn',
            animOut: 'dialogCenter centerAnimOut',
          })
        } else if (newVal === "none") {
          this.setData({
            animIn: 'dialogCenter',
            animOut: null,
          })
        } else if (newVal === "custom") {
          this.setData({
            animIn: 'anim-in',
            animOut: 'anim-out',
          })
        }
      }
    }
  },
  data: {
    animIn: 'dialogCenter centerAnimIn',
    animOut: 'dialogCenter centerAnimOut',
    showDialog: null,
    _internalTime: 400,
    _lastTime: 0
  },
  methods: {
    showDialog() {
      if (!this.isShowing()) {
        this.setData({
          show: true,
          showDialog: true,
          _lastTime: Date.now()
        })
      }
    },
    dismissDialog() {
      if (this.isShowing()) {
        this.setData({
          show: false,
          showDialog: false,
          _lastTime: Date.now()
        })
      }
    },
    isShowing() {
      return this.data.showDialog
    },
    touchMoveEvent(e) {
      
    }
  }
})