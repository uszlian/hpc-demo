module.exports = Behavior({
  properties: {
    show: {
      type: String,
      observer(newVal, oldVal) {
        if (newVal === 'true') {
          this.setData({
            result: null,
            inputEnabled: false
          })
        }
      },
    }
  },
  methods: {
    getDialog() {
      return this.selectComponent("#dialog")
    },
    showDialog() {
      this.getDialog().showDialog()
    },
    dismissDialog() {
      this.getDialog().dismissDialog()
    },
    isShowing() {
      return this.getDialog().isShowing()
    }
  }
})