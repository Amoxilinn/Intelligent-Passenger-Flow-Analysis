"use strict";
const common_vendor = require("../../common/vendor.js");
const SvgIcon = () => "../../components/SvgIcon.js";
const customerObj = common_vendor.tr.importObject("CustomerInfor");
const _sfc_main = {
  components: { SvgIcon },
  data() {
    return {
      userInfo: {},
      currentStore: null,
      currentStoreName: "我的店铺",
      stores: [],
      showStoreDropdown: false,
      showNotificationPanel: false,
      showDataDetailModal: false,
      hasNotifications: false,
      todayFlow: "0",
      weekFlow: "0",
      peakHour: "-",
      peakCount: 0,
      activeTab: 0,
      showSkeleton: true,
      hourlyData: [],
      activityList: [],
      genderStats: { male: 0, female: 0 },
      ageStats: { "18-25": 0, "26-35": 0, "36-45": 0, "45+": 0 },
      weekData: [],
      selectedDate: (/* @__PURE__ */ new Date()).getDate(),
      calendarDays: [],
      weekDays: ["日", "一", "二", "三", "四", "五", "六"],
      deviceOfflineNotify: true,
      bottomTabs: [
        { label: "看板", icon: "pie-chart" },
        { label: "历史", icon: "history" },
        { label: "设置", icon: "cog" }
      ]
    };
  },
  computed: {
    userInitial() {
      return (this.userInfo.phone || "U").substring(0, 1).toUpperCase();
    },
    todayDate() {
      const now = /* @__PURE__ */ new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    },
    hasAgeData() {
      return this.ageStats["18-25"] > 0 || this.ageStats["26-35"] > 0 || this.ageStats["36-45"] > 0 || this.ageStats["45+"] > 0;
    },
    maxWeekValue() {
      if (this.weekData.length === 0)
        return 1;
      return Math.max(...this.weekData.map((item) => item.value), 1);
    }
  },
  onLoad() {
    this.loadUserInfo();
    this.initCalendar();
  },
  onShow() {
    this.loadUserInfo();
    if (this.userInfo.token) {
      this.loadDashboardData();
      this.loadHistoryData();
    }
  },
  methods: {
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = userInfo;
        this.stores = userInfo.stores || [];
        this.currentStore = userInfo.currentStore;
        if (this.currentStore) {
          this.currentStoreName = this.currentStore.name;
        } else if (this.stores.length > 0) {
          this.currentStore = this.stores[0];
          this.currentStoreName = this.stores[0].name;
        }
      }
    },
    async loadDashboardData() {
      var _a;
      if (!this.userInfo.token)
        return;
      this.showSkeleton = true;
      try {
        const result = await customerObj.getDashboardData({
          token: this.userInfo.token,
          storeId: (_a = this.currentStore) == null ? void 0 : _a._id
        });
        if (result.errCode === 0) {
          const data = result.data;
          this.todayFlow = data.todayTotal.toString();
          this.hourlyData = data.hourlyData;
          this.genderStats = data.genderStats;
          this.ageStats = data.ageStats;
          this.activityList = data.activityList;
          if (this.hourlyData.length > 0) {
            const peakItem = this.hourlyData.reduce((max, item) => item.value > max.value ? item : max, this.hourlyData[0]);
            this.peakHour = peakItem.label;
            this.peakCount = peakItem.value;
          }
        } else if (result.errCode === "TOKEN_MISSING" || result.errCode === "TOKEN_ERROR") {
          common_vendor.index.showToast({ title: "请重新登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.reLaunch({ url: "/pages/login/login" });
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/admin.vue:447", "加载看板数据失败:", error);
      } finally {
        this.showSkeleton = false;
      }
    },
    async loadHistoryData() {
      var _a;
      if (!this.userInfo.token)
        return;
      try {
        const result = await customerObj.getHistoryData({
          token: this.userInfo.token,
          storeId: (_a = this.currentStore) == null ? void 0 : _a._id
        });
        if (result.errCode === 0) {
          this.weekData = result.data.weekData;
          this.weekFlow = this.weekData.reduce((sum, item) => sum + item.value, 0).toString();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/admin.vue:466", "加载历史数据失败:", error);
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    goToSettings() {
      this.showStoreDropdown = false;
      common_vendor.index.navigateTo({ url: "/pages/settings/settings" });
    },
    toggleStoreDropdown() {
      this.showStoreDropdown = !this.showStoreDropdown;
      this.showNotificationPanel = false;
    },
    selectStore(store) {
      this.currentStore = store;
      this.currentStoreName = store.name;
      this.showStoreDropdown = false;
      let userInfo = common_vendor.index.getStorageSync("userInfo") || {};
      userInfo.currentStore = store;
      common_vendor.index.setStorageSync("userInfo", userInfo);
      this.userInfo = userInfo;
      this.loadDashboardData();
      this.loadHistoryData();
    },
    toggleNotificationPanel() {
      this.showNotificationPanel = !this.showNotificationPanel;
      this.showStoreDropdown = false;
    },
    clearNotifications() {
      this.hasNotifications = false;
      this.showNotificationPanel = false;
    },
    showDataDetail(type) {
      this.showDataDetailModal = true;
    },
    closeDataDetail() {
      this.showDataDetailModal = false;
    },
    switchTab(index) {
      this.activeTab = index;
    },
    initCalendar() {
      this.calendarDays = [];
      const now = /* @__PURE__ */ new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        this.calendarDays.push(i);
      }
      this.selectedDate = now.getDate();
    },
    selectDate(day) {
      this.selectedDate = day;
    },
    exportData() {
      common_vendor.index.showToast({ title: "导出功能开发中", icon: "none" });
    },
    openAccountModal() {
      common_vendor.index.showToast({ title: "编辑资料功能开发中", icon: "none" });
    },
    toggleDeviceNotify() {
      this.deviceOfflineNotify = !this.deviceOfflineNotify;
    },
    switchMode() {
      common_vendor.index.navigateTo({ url: "/pages/collector/collector" });
    },
    logout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.reLaunch({ url: "/pages/login/login" });
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_svg_icon = common_vendor.resolveComponent("svg-icon");
  _component_svg_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: common_vendor.p({
      type: "arrow-left",
      size: 18,
      color: "#ffffff"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.currentStoreName),
    d: common_vendor.p({
      type: "chevron-down",
      size: 12,
      color: "#ffffff"
    }),
    e: common_vendor.o((...args) => $options.toggleStoreDropdown && $options.toggleStoreDropdown(...args)),
    f: $data.showStoreDropdown
  }, $data.showStoreDropdown ? common_vendor.e({
    g: common_vendor.f($data.stores, (store, index, i0) => {
      return {
        a: common_vendor.t(store.name),
        b: store._id,
        c: common_vendor.o(($event) => $options.selectStore(store), store._id)
      };
    }),
    h: $data.stores.length > 0
  }, $data.stores.length > 0 ? {} : {}, {
    i: common_vendor.p({
      type: "plus",
      size: 14,
      color: "#003366"
    }),
    j: common_vendor.o((...args) => $options.goToSettings && $options.goToSettings(...args))
  }) : {}, {
    k: common_vendor.p({
      type: "bell",
      size: 18,
      color: "rgba(255,255,255,0.8)"
    }),
    l: $data.hasNotifications
  }, $data.hasNotifications ? {} : {}, {
    m: $data.showNotificationPanel
  }, $data.showNotificationPanel ? {
    n: common_vendor.o((...args) => $options.clearNotifications && $options.clearNotifications(...args))
  } : {}, {
    o: common_vendor.o((...args) => $options.toggleNotificationPanel && $options.toggleNotificationPanel(...args)),
    p: common_vendor.t($data.todayFlow),
    q: $data.todayFlow !== "0"
  }, $data.todayFlow !== "0" ? {
    r: common_vendor.p({
      type: "arrow-up",
      size: 10,
      color: "#86efac"
    })
  } : {}, {
    s: common_vendor.o(($event) => $options.showDataDetail("today")),
    t: common_vendor.t($data.weekFlow),
    v: common_vendor.t($data.peakHour),
    w: common_vendor.t($data.peakCount),
    x: $data.activeTab === 0
  }, $data.activeTab === 0 ? common_vendor.e({
    y: common_vendor.t($options.todayDate),
    z: $data.showSkeleton
  }, $data.showSkeleton ? {} : $data.hourlyData.length > 0 ? {
    B: common_vendor.f($data.hourlyData, (item, index, i0) => {
      return {
        a: item.height + "%",
        b: common_vendor.t(item.label),
        c: common_vendor.t(item.value),
        d: index
      };
    })
  } : {}, {
    A: $data.hourlyData.length > 0,
    C: $data.genderStats.male > 0 || $data.genderStats.female > 0
  }, $data.genderStats.male > 0 || $data.genderStats.female > 0 ? {
    D: $data.genderStats.male + "%",
    E: common_vendor.t($data.genderStats.male),
    F: $data.genderStats.female + "%",
    G: common_vendor.t($data.genderStats.female)
  } : {}, {
    H: $options.hasAgeData
  }, $options.hasAgeData ? {
    I: Math.max(10, $data.ageStats["18-25"]) + "%",
    J: common_vendor.t($data.ageStats["18-25"]),
    K: Math.max(10, $data.ageStats["26-35"]) + "%",
    L: common_vendor.t($data.ageStats["26-35"]),
    M: Math.max(10, $data.ageStats["36-45"]) + "%",
    N: common_vendor.t($data.ageStats["36-45"]),
    O: Math.max(10, $data.ageStats["45+"]) + "%",
    P: common_vendor.t($data.ageStats["45+"])
  } : {}, {
    Q: common_vendor.o((...args) => $options.loadDashboardData && $options.loadDashboardData(...args)),
    R: $data.activityList.length > 0
  }, $data.activityList.length > 0 ? {
    S: common_vendor.f($data.activityList, (activity, index, i0) => {
      return {
        a: common_vendor.n(activity.type),
        b: common_vendor.t(activity.text),
        c: common_vendor.t(activity.time),
        d: index
      };
    })
  } : {}) : {}, {
    T: $data.activeTab === 1
  }, $data.activeTab === 1 ? common_vendor.e({
    U: common_vendor.f($data.weekDays, (day, k0, i0) => {
      return {
        a: common_vendor.t(day),
        b: day
      };
    }),
    V: common_vendor.f($data.calendarDays, (day, index, i0) => {
      return {
        a: common_vendor.t(day),
        b: index,
        c: common_vendor.n($data.selectedDate === day ? "active" : ""),
        d: common_vendor.o(($event) => $options.selectDate(day), index)
      };
    }),
    W: $data.weekData.length > 0
  }, $data.weekData.length > 0 ? {
    X: common_vendor.f($data.weekData, (item, index, i0) => {
      return {
        a: Math.max(10, item.value / $options.maxWeekValue * 100) + "%",
        b: common_vendor.t(item.label),
        c: common_vendor.t(item.value),
        d: index
      };
    })
  } : {}, {
    Y: common_vendor.p({
      type: "download",
      size: 14,
      color: "#ffffff"
    }),
    Z: common_vendor.o((...args) => $options.exportData && $options.exportData(...args))
  }) : {}, {
    aa: $data.activeTab === 2
  }, $data.activeTab === 2 ? common_vendor.e({
    ab: common_vendor.t($options.userInitial),
    ac: common_vendor.t($data.userInfo.phone || "用户"),
    ad: common_vendor.t($data.userInfo._id || "-"),
    ae: common_vendor.p({
      type: "chevron-right",
      size: 16,
      color: "#d1d5db"
    }),
    af: common_vendor.o((...args) => $options.openAccountModal && $options.openAccountModal(...args)),
    ag: $data.deviceOfflineNotify
  }, $data.deviceOfflineNotify ? {} : {}, {
    ah: $data.deviceOfflineNotify ? 1 : "",
    ai: common_vendor.o((...args) => $options.toggleDeviceNotify && $options.toggleDeviceNotify(...args)),
    aj: common_vendor.p({
      type: "store",
      size: 16,
      color: "#22c55e"
    }),
    ak: common_vendor.t($data.currentStoreName),
    al: common_vendor.t(((_a = $data.currentStore) == null ? void 0 : _a.address) || "暂无地址"),
    am: common_vendor.p({
      type: "exchange-alt",
      size: 14,
      color: "#ffffff"
    }),
    an: common_vendor.o((...args) => $options.switchMode && $options.switchMode(...args)),
    ao: common_vendor.p({
      type: "sign-out",
      size: 14,
      color: "#ef4444"
    }),
    ap: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  }) : {}, {
    aq: common_vendor.f($data.bottomTabs, (tab, index, i0) => {
      return {
        a: "dbc77958-10-" + i0,
        b: common_vendor.p({
          type: tab.icon,
          size: 20,
          color: $data.activeTab === index ? "#003366" : "#9ca3af"
        }),
        c: common_vendor.t(tab.label),
        d: index,
        e: common_vendor.n($data.activeTab === index ? "active" : ""),
        f: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    ar: $data.showDataDetailModal
  }, $data.showDataDetailModal ? common_vendor.e({
    as: common_vendor.t($options.todayDate),
    at: common_vendor.p({
      type: "times",
      size: 18,
      color: "rgba(255,255,255,0.8)"
    }),
    av: common_vendor.o((...args) => $options.closeDataDetail && $options.closeDataDetail(...args)),
    aw: $data.hourlyData.length > 0
  }, $data.hourlyData.length > 0 ? {
    ax: common_vendor.f($data.hourlyData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: common_vendor.t(item.value),
        c: index
      };
    })
  } : {}, {
    ay: common_vendor.o((...args) => $options.closeDataDetail && $options.closeDataDetail(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dbc77958"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/admin.js.map
