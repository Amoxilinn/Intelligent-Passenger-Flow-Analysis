"use strict";
const common_vendor = require("../../common/vendor.js");
const SvgIcon = () => "../../components/SvgIcon.js";
const _sfc_main = {
  components: { SvgIcon },
  data() {
    return {};
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    selectMode(mode) {
      if (mode === "collector") {
        common_vendor.index.navigateTo({ url: "/pages/collector/collector" });
      } else {
        common_vendor.index.navigateTo({ url: "/pages/admin/admin" });
      }
    }
  }
};
if (!Array) {
  const _component_svg_icon = common_vendor.resolveComponent("svg-icon");
  _component_svg_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      type: "arrow-left",
      size: 16,
      color: "#ffffff"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.p({
      type: "chart-line",
      size: 48,
      color: "#ffffff"
    }),
    d: common_vendor.p({
      type: "video",
      size: 32,
      color: "#22c55e"
    }),
    e: common_vendor.p({
      type: "chevron-right",
      size: 16,
      color: "rgba(255,255,255,0.4)"
    }),
    f: common_vendor.o(($event) => $options.selectMode("collector")),
    g: common_vendor.p({
      type: "desktop",
      size: 32,
      color: "#22d3ee"
    }),
    h: common_vendor.p({
      type: "chevron-right",
      size: 16,
      color: "rgba(255,255,255,0.4)"
    }),
    i: common_vendor.o(($event) => $options.selectMode("admin"))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-42f88db3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mode-select/mode-select.js.map
