"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/mode-select/mode-select.js";
  "./pages/collector/collector.js";
  "./pages/admin/admin.js";
  "./pages/settings/settings.js";
}
const requiredPrivateInfos = [
  "getLocation"
];
const App = {
  requiredPrivateInfos
};
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
