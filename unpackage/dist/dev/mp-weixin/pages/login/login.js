"use strict";
const common_vendor = require("../../common/vendor.js");
const SvgIcon = () => "../../components/SvgIcon.js";
const userInfro = common_vendor.tr.importObject("userInfro");
const _sfc_main = {
  components: { SvgIcon },
  data() {
    return {
      activeTab: "login",
      loginForm: {
        phone: "",
        password: ""
      },
      registerForm: {
        phone: "",
        code: "",
        password: ""
      },
      codeBtnText: "获取",
      countdown: 0,
      timer: null
    };
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab;
    },
    async handleLogin() {
      if (!this.loginForm.phone) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.loginForm.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (!this.loginForm.password) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中..." });
      try {
        common_vendor.index.__f__("log", "at pages/login/login.vue:128", "开始登录验证...");
        const result = await userInfro.login({
          phone: this.loginForm.phone,
          password: this.loginForm.password
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:134", "登录结果:", result);
        if (result.errCode === 0) {
          common_vendor.index.setStorageSync("userInfo", result.data);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/mode-select/mode-select" });
          }, 500);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: result.errMsg, icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:148", "登录失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "登录失败，请稍后重试", icon: "none" });
      }
    },
    async handleRegister() {
      if (!this.registerForm.phone) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (!this.registerForm.code) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      if (!this.registerForm.password) {
        common_vendor.index.showToast({ title: "请设置密码", icon: "none" });
        return;
      }
      if (this.registerForm.password.length < 6) {
        common_vendor.index.showToast({ title: "密码长度不能少于6位", icon: "none" });
        return;
      }
      if (this.registerForm.code !== "1111") {
        common_vendor.index.showToast({ title: "验证码错误", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "注册中..." });
      try {
        common_vendor.index.__f__("log", "at pages/login/login.vue:183", "开始调用云对象注册...");
        const result = await userInfro.register({
          phone: this.registerForm.phone,
          password: this.registerForm.password
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:189", "云对象调用结果:", result);
        if (result.errCode === 0) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "注册成功", icon: "success" });
          this.switchTab("login");
          this.loginForm.phone = this.registerForm.phone;
          this.registerForm = { phone: "", code: "", password: "" };
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: result.errMsg, icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:202", "注册失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "注册失败，请稍后重试", icon: "none" });
      }
    },
    handleForgotPassword() {
      common_vendor.index.showToast({ title: "请联系管理员重置密码", icon: "none" });
    },
    handleWechatLogin() {
      common_vendor.index.showToast({ title: "微信登录", icon: "none" });
    },
    sendCode() {
      if (this.countdown > 0)
        return;
      if (!this.registerForm.phone) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      this.countdown = 60;
      this.timer = setInterval(() => {
        this.countdown--;
        this.codeBtnText = `${this.countdown}s`;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.codeBtnText = "获取";
        }
      }, 1e3);
      common_vendor.index.showToast({ title: "验证码已发送（测试用：1111）", icon: "none" });
    }
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
};
if (!Array) {
  const _component_svg_icon = common_vendor.resolveComponent("svg-icon");
  _component_svg_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      type: "chart-line",
      size: 48,
      color: "#ffffff"
    }),
    b: common_vendor.n($data.activeTab === "login" ? "active" : ""),
    c: common_vendor.o(($event) => $options.switchTab("login")),
    d: common_vendor.n($data.activeTab === "register" ? "active" : ""),
    e: common_vendor.o(($event) => $options.switchTab("register")),
    f: $data.activeTab === "login"
  }, $data.activeTab === "login" ? {
    g: common_vendor.p({
      type: "phone",
      size: 16,
      color: "rgba(255,255,255,0.4)"
    }),
    h: $data.loginForm.phone,
    i: common_vendor.o(($event) => $data.loginForm.phone = $event.detail.value),
    j: common_vendor.p({
      type: "lock",
      size: 16,
      color: "rgba(255,255,255,0.4)"
    }),
    k: $data.loginForm.password,
    l: common_vendor.o(($event) => $data.loginForm.password = $event.detail.value),
    m: common_vendor.o((...args) => $options.handleForgotPassword && $options.handleForgotPassword(...args)),
    n: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    o: common_vendor.p({
      type: "weixin",
      size: 24,
      color: "#22c55e"
    }),
    p: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args))
  } : {
    q: common_vendor.p({
      type: "phone",
      size: 16,
      color: "rgba(255,255,255,0.4)"
    }),
    r: $data.registerForm.phone,
    s: common_vendor.o(($event) => $data.registerForm.phone = $event.detail.value),
    t: common_vendor.p({
      type: "shield",
      size: 16,
      color: "rgba(255,255,255,0.4)"
    }),
    v: $data.registerForm.code,
    w: common_vendor.o(($event) => $data.registerForm.code = $event.detail.value),
    x: common_vendor.t($data.codeBtnText),
    y: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    z: common_vendor.p({
      type: "lock",
      size: 16,
      color: "rgba(255,255,255,0.4)"
    }),
    A: $data.registerForm.password,
    B: common_vendor.o(($event) => $data.registerForm.password = $event.detail.value),
    C: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
