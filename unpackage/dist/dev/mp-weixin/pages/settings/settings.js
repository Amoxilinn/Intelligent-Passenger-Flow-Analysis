"use strict";
const common_vendor = require("../../common/vendor.js");
const SvgIcon = () => "../../components/SvgIcon.js";
const storeObj = common_vendor.tr.importObject("store");
const _sfc_main = {
  components: { SvgIcon },
  data() {
    return {
      userInfo: {},
      stores: [],
      currentStore: null,
      showModal: false,
      isEditMode: false,
      storeForm: {
        _id: "",
        name: "",
        address: ""
      }
    };
  },
  onLoad() {
    this.loadUserInfo();
    this.loadStores();
  },
  onShow() {
    this.loadUserInfo();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = userInfo;
        this.currentStore = userInfo.currentStore || null;
      }
    },
    async loadStores() {
      try {
        const token = this.userInfo.token;
        const result = await storeObj.getStores({ token });
        if (result.errCode === 0) {
          this.stores = result.data;
          if (this.stores.length > 0 && !this.currentStore) {
            this.currentStore = this.stores[0];
            this.updateCurrentStore();
          }
        } else if (result.errCode === "TOKEN_MISSING" || result.errCode === "TOKEN_ERROR") {
          common_vendor.index.showToast({ title: "请重新登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.reLaunch({ url: "/pages/login/login" });
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:173", "加载店铺列表失败:", error);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    },
    selectStore(store) {
      this.currentStore = store;
      this.updateCurrentStore();
      common_vendor.index.showToast({ title: "已切换店铺", icon: "success" });
    },
    updateCurrentStore() {
      let userInfo = common_vendor.index.getStorageSync("userInfo") || {};
      userInfo.currentStore = this.currentStore;
      userInfo.stores = this.stores;
      common_vendor.index.setStorageSync("userInfo", userInfo);
      this.userInfo = userInfo;
    },
    showAddStoreModal() {
      this.isEditMode = false;
      this.storeForm = {
        _id: "",
        name: "",
        address: ""
      };
      this.showModal = true;
    },
    showEditStoreModal(store) {
      this.isEditMode = true;
      this.storeForm = {
        _id: store._id,
        name: store.name,
        address: store.address || ""
      };
      this.showModal = true;
    },
    hideModal() {
      this.showModal = false;
    },
    async saveStore() {
      if (!this.storeForm.name) {
        common_vendor.index.showToast({ title: "请输入店铺名称", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        const token = this.userInfo.token;
        let result;
        if (this.isEditMode) {
          result = await storeObj.updateStore({
            _id: this.storeForm._id,
            name: this.storeForm.name,
            address: this.storeForm.address,
            token
          });
        } else {
          result = await storeObj.addStore({
            name: this.storeForm.name,
            address: this.storeForm.address,
            token
          });
        }
        common_vendor.index.hideLoading();
        if (result.errCode === 0) {
          this.showModal = false;
          await this.loadStores();
          common_vendor.index.showToast({
            title: this.isEditMode ? "更新成功" : "添加成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({ title: result.errMsg, icon: "none" });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/settings/settings.vue:250", "保存店铺失败:", error);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      }
    },
    async deleteStore(store) {
      if (this.stores.length <= 1) {
        common_vendor.index.showToast({ title: "至少需要保留一个店铺", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除店铺「${store.name}」吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "删除中..." });
              const token = this.userInfo.token;
              const result = await storeObj.deleteStore({
                _id: store._id,
                token
              });
              common_vendor.index.hideLoading();
              if (result.errCode === 0) {
                if (this.currentStore && this.currentStore._id === store._id) {
                  this.currentStore = null;
                }
                await this.loadStores();
                common_vendor.index.showToast({ title: "删除成功", icon: "success" });
              } else {
                common_vendor.index.showToast({ title: result.errMsg, icon: "none" });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/settings/settings.vue:285", "删除店铺失败:", error);
              common_vendor.index.showToast({ title: "删除失败", icon: "none" });
            }
          }
        }
      });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
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
  return common_vendor.e({
    a: common_vendor.p({
      type: "arrow-left",
      size: 20,
      color: "#ffffff"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.currentStore
  }, $data.currentStore ? common_vendor.e({
    d: common_vendor.t($data.currentStore.name),
    e: $data.currentStore.address
  }, $data.currentStore.address ? {
    f: common_vendor.t($data.currentStore.address)
  } : {}) : {}, {
    g: common_vendor.p({
      type: "plus",
      size: 16,
      color: "#22c55e"
    }),
    h: common_vendor.o((...args) => $options.showAddStoreModal && $options.showAddStoreModal(...args)),
    i: common_vendor.f($data.stores, (store, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(store.name),
        b: store.address
      }, store.address ? {
        c: common_vendor.t(store.address)
      } : {}, {
        d: "7fad0a1c-2-" + i0,
        e: common_vendor.o(($event) => $options.showEditStoreModal(store), store._id),
        f: "7fad0a1c-3-" + i0,
        g: common_vendor.o(($event) => $options.deleteStore(store), store._id),
        h: $data.currentStore && $data.currentStore._id === store._id
      }, $data.currentStore && $data.currentStore._id === store._id ? {
        i: "7fad0a1c-4-" + i0,
        j: common_vendor.p({
          type: "check",
          size: 18,
          color: "#22c55e"
        })
      } : {}, {
        k: store._id,
        l: $data.currentStore && $data.currentStore._id === store._id ? 1 : "",
        m: common_vendor.o(($event) => $options.selectStore(store), store._id)
      });
    }),
    j: common_vendor.p({
      type: "edit",
      size: 16,
      color: "#3b82f6"
    }),
    k: common_vendor.p({
      type: "trash",
      size: 16,
      color: "#ef4444"
    }),
    l: $data.stores.length === 0
  }, $data.stores.length === 0 ? {} : {}, {
    m: common_vendor.t($data.userInfo.phone || "-"),
    n: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args)),
    o: $data.showModal
  }, $data.showModal ? {
    p: common_vendor.t($data.isEditMode ? "编辑店铺" : "添加店铺"),
    q: $data.storeForm.name,
    r: common_vendor.o(($event) => $data.storeForm.name = $event.detail.value),
    s: $data.storeForm.address,
    t: common_vendor.o(($event) => $data.storeForm.address = $event.detail.value),
    v: common_vendor.o((...args) => $options.hideModal && $options.hideModal(...args)),
    w: common_vendor.o((...args) => $options.saveStore && $options.saveStore(...args)),
    x: common_vendor.o(() => {
    }),
    y: common_vendor.o((...args) => $options.hideModal && $options.hideModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7fad0a1c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/settings.js.map
