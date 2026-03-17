"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "SvgIcon",
  props: {
    type: {
      type: String,
      default: "user"
    },
    size: {
      type: Number,
      default: 16
    },
    color: {
      type: String,
      default: "currentColor"
    }
  },
  computed: {
    iconStyle() {
      return {
        fontSize: this.size + "px",
        color: this.color
      };
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.type === "phone"
  }, $props.type === "phone" ? {} : $props.type === "lock" ? {} : $props.type === "arrow-left" ? {} : $props.type === "chevron-right" ? {} : $props.type === "chevron-down" ? {} : $props.type === "times" ? {} : $props.type === "arrow-up" ? {} : $props.type === "bell" ? {} : $props.type === "cog" ? {} : $props.type === "exchange-alt" ? {} : $props.type === "sign-out" ? {} : $props.type === "mobile-alt" ? {} : $props.type === "download" ? {} : $props.type === "pie-chart" ? {} : $props.type === "history" ? {} : $props.type === "plus" ? {} : $props.type === "chart-line" ? {} : $props.type === "video" ? {} : $props.type === "desktop" ? {} : $props.type === "clock" ? {} : $props.type === "play" ? {} : $props.type === "stop" ? {} : $props.type === "moon" ? {} : $props.type === "weixin" ? {} : $props.type === "shield" ? {} : $props.type === "store" ? {} : $props.type === "edit" ? {} : $props.type === "trash" ? {} : $props.type === "check" ? {} : {}, {
    b: $props.type === "lock",
    c: $props.type === "arrow-left",
    d: $props.type === "chevron-right",
    e: $props.type === "chevron-down",
    f: $props.type === "times",
    g: $props.type === "arrow-up",
    h: $props.type === "bell",
    i: $props.type === "cog",
    j: $props.type === "exchange-alt",
    k: $props.type === "sign-out",
    l: $props.type === "mobile-alt",
    m: $props.type === "download",
    n: $props.type === "pie-chart",
    o: $props.type === "history",
    p: $props.type === "plus",
    q: $props.type === "chart-line",
    r: $props.type === "video",
    s: $props.type === "desktop",
    t: $props.type === "clock",
    v: $props.type === "play",
    w: $props.type === "stop",
    x: $props.type === "moon",
    y: $props.type === "weixin",
    z: $props.type === "shield",
    A: $props.type === "store",
    B: $props.type === "edit",
    C: $props.type === "trash",
    D: $props.type === "check",
    E: common_vendor.s($options.iconStyle)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4c110535"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/SvgIcon.js.map
