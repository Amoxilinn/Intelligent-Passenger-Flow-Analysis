"use strict";
const common_vendor = require("../../common/vendor.js");
const SvgIcon = () => "../../components/SvgIcon.js";
const _sfc_main = {
  components: { SvgIcon },
  data() {
    return {
      statusBarHeight: 44,
      isCollecting: false,
      currentCount: 0,
      totalInCount: 0,
      totalOutCount: 0,
      runTime: "00:00:00",
      runSeconds: 0,
      timer: null,
      scanLineTop: 0,
      scanTimer: null,
      detectionDots: [],
      detectionTimer: null,
      showScreenOff: false,
      showDebug: true,
      debugMessage: "准备就绪",
      sensitivity: 50,
      privacyMode: false,
      cameraPosition: "front",
      baiduConfig: {
        accessToken: "24.1cda255fca624d93740c112f0b666085.2592000.1774279365.282335-122120011"
      },
      cameraContext: null,
      isCameraReady: false,
      lastFrameSamples: [],
      lastDetectionTime: 0,
      detectionInterval: 2e3,
      caseInit: true,
      currentLocation: "正门A",
      errorCount: 0,
      maxErrorCount: 5,
      frameChangeCount: 0,
      checkCameraTimeout: null,
      userInfo: {},
      currentStore: null,
      currentStoreName: "我的店铺",
      lastSavedPerson: null,
      lastSavedTime: 0,
      personCooldown: 1e4,
      recentPersons: []
    };
  },
  onLoad() {
    this.loadUserInfo();
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 44;
    this.debugMessage = "页面加载完成";
    common_vendor.index.__f__("log", "at pages/collector/collector.vue:162", "页面加载完成");
    common_vendor.index.__f__("log", "at pages/collector/collector.vue:163", "系统信息:", systemInfo);
    common_vendor.index.__f__("log", "at pages/collector/collector.vue:164", "初始摄像头状态 - isCameraReady:", this.isCameraReady, "cameraContext:", this.cameraContext);
    this.getDeviceLocation();
    common_vendor.index.__f__("log", "at pages/collector/collector.vue:167", "设置延迟摄像头状态检查...");
    this.checkCameraTimeout = setTimeout(() => {
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:169", "延迟检查摄像头状态...");
      if (!this.isCameraReady && this.cameraContext) {
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:171", "摄像头上下文已存在但状态未更新，手动设置就绪");
        this.isCameraReady = true;
        this.debugMessage = "摄像头已通过延迟检查就绪";
      } else if (!this.isCameraReady) {
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:175", "摄像头仍未就绪，尝试重新初始化");
        this.initCamera();
        this.debugMessage = "摄像头重新初始化中...";
      }
    }, 3e3);
  },
  onShow() {
    this.loadUserInfo();
  },
  onUnload() {
    this.stopAllTimers();
  },
  methods: {
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = userInfo;
        this.currentStore = userInfo.currentStore;
        if (this.currentStore) {
          this.currentStoreName = this.currentStore.name;
        }
      }
    },
    goToSettings() {
      common_vendor.index.navigateTo({ url: "/pages/settings/settings" });
    },
    goBack() {
      this.stopAllTimers();
      common_vendor.index.navigateBack();
    },
    stopAllTimers() {
      if (this.timer)
        clearInterval(this.timer);
      if (this.scanTimer)
        clearInterval(this.scanTimer);
      if (this.detectionTimer)
        clearInterval(this.detectionTimer);
      if (this.checkCameraTimeout)
        clearTimeout(this.checkCameraTimeout);
    },
    toggleCollection() {
      if (this.isCollecting) {
        this.stopCollection();
      } else {
        this.startCollection();
      }
    },
    toggleDebug() {
      this.showDebug = !this.showDebug;
    },
    cameraReady() {
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:222", "cameraReady事件触发");
      this.debugMessage = "摄像头准备就绪";
      this.isCameraReady = true;
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:225", "isCameraReady设置为true");
      this.initCamera();
    },
    cameraError(e) {
      common_vendor.index.__f__("error", "at pages/collector/collector.vue:229", "cameraError事件触发:", e);
      this.isCameraReady = false;
      this.debugMessage = "摄像头错误: " + JSON.stringify(e);
      common_vendor.index.__f__("error", "at pages/collector/collector.vue:232", "摄像头错误:", e);
      common_vendor.index.showToast({ title: "摄像头初始化失败", icon: "none" });
    },
    initCamera() {
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:237", "开始初始化摄像头上下文...");
      this.cameraContext = common_vendor.index.createCameraContext();
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:239", "摄像头上下文创建完成:", this.cameraContext ? "成功" : "失败");
      this.isCameraReady = true;
      this.debugMessage = "摄像头初始化完成";
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:242", "摄像头初始化完成，isCameraReady设置为true");
    },
    async getCameraImageBase64() {
      return new Promise((resolve, reject) => {
        if (!this.cameraContext) {
          reject(new Error("摄像头未初始化"));
          return;
        }
        this.debugMessage = "正在拍照...";
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:253", "正在拍照...");
        this.cameraContext.takePhoto({
          quality: "low",
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:258", "拍照成功:", res);
            const tempFilePath = res.tempImagePath;
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:260", "临时文件路径:", tempFilePath);
            common_vendor.index.getFileSystemManager().readFile({
              filePath: tempFilePath,
              encoding: "base64",
              success: (fileRes) => {
                common_vendor.index.__f__("log", "at pages/collector/collector.vue:267", "读取文件成功，数据长度:", fileRes.data ? fileRes.data.length : 0);
                common_vendor.index.__f__("log", "at pages/collector/collector.vue:268", "数据前100字符:", fileRes.data ? fileRes.data.substring(0, 100) : "无数据");
                if (fileRes.data && fileRes.data.length > 100) {
                  this.debugMessage = "获取图像成功";
                  resolve(fileRes.data);
                } else {
                  reject(new Error("图像数据长度不足: " + (fileRes.data ? fileRes.data.length : 0)));
                }
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/collector/collector.vue:277", "读取文件失败:", err);
                this.debugMessage = "读取文件失败: " + err.errMsg;
                reject(err);
              }
            });
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/collector/collector.vue:284", "拍照失败:", err);
            this.debugMessage = "拍照失败: " + err.errMsg;
            reject(err);
          }
        });
      });
    },
    async detectBodyAttribute(imageBase64) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      try {
        this.debugMessage = "调用人体属性识别API...";
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:295", "调用人体属性识别API...");
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:296", "图像Base64长度:", imageBase64.length);
        let cleanBase64 = imageBase64;
        if (imageBase64.includes("base64,")) {
          cleanBase64 = imageBase64.split("base64,")[1];
        }
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:303", "清理后Base64长度:", cleanBase64.length);
        if (!cleanBase64 || cleanBase64.length < 100) {
          common_vendor.index.__f__("error", "at pages/collector/collector.vue:307", "Base64数据无效，长度:", cleanBase64 ? cleanBase64.length : 0);
          return { success: false, message: "Base64数据无效" };
        }
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:311", "access_token:", this.baiduConfig.accessToken);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:312", "Base64前50字符:", cleanBase64.substring(0, 50));
        const requestBody = "image=" + encodeURIComponent(cleanBase64) + "&type=gender,age,upper_wear,lower_wear,upper_color,lower_color,headwear,glasses,face_mask,bag,cellphone,smoke,orientation,upper_cut,lower_cut,occlusion,is_human";
        const res = await common_vendor.index.request({
          url: "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_attr?access_token=" + this.baiduConfig.accessToken,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: requestBody
        });
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:328", "人体属性识别API原始响应:", res);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:329", "响应状态码:", res.statusCode);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:330", "响应数据:", res.data);
        if (res.statusCode !== 200) {
          common_vendor.index.__f__("error", "at pages/collector/collector.vue:334", "HTTP请求失败，状态码:", res.statusCode);
          this.debugMessage = `HTTP请求失败: ${res.statusCode}`;
          return {
            success: false,
            message: `HTTP请求失败，状态码: ${res.statusCode}`,
            statusCode: res.statusCode
          };
        }
        const response = res.data || res;
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:345", "解析后响应:", response);
        if (response.error_code) {
          common_vendor.index.__f__("error", "at pages/collector/collector.vue:349", "百度AI API错误:", response.error_code, response.error_msg);
          this.debugMessage = `API错误: ${response.error_msg || response.error_code}`;
          return {
            success: false,
            message: `API错误: ${response.error_msg || response.error_code}`,
            errorCode: response.error_code
          };
        }
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:360", "=== API响应详细分析 ===");
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:361", "person_num:", response.person_num);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:362", "person_info:", JSON.stringify(response.person_info, null, 2));
        if (response.person_info && response.person_info.length > 0 && response.person_num > 0) {
          const person = response.person_info[0];
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:366", "person_info[0]:", JSON.stringify(person, null, 2));
          const location = person.location || {};
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:370", "location对象:", location);
          const hasValidLocation = (location.left !== void 0 || location.x !== void 0) && (location.top !== void 0 || location.y !== void 0) && location.width !== void 0 && location.height !== void 0;
          const attributes = person.attributes || {};
          const hasValidAttributes = Object.keys(attributes).length > 0;
          const isHuman = ((_a = attributes.is_human) == null ? void 0 : _a.name) || "";
          const isNormalHuman = isHuman === "正常人体";
          const occlusion = ((_b = attributes.occlusion) == null ? void 0 : _b.name) || "";
          const isHeavyOcclusion = occlusion === "重度遮挡";
          const upperCut = ((_c = attributes.upper_cut) == null ? void 0 : _c.name) || "";
          const lowerCut = ((_d = attributes.lower_cut) == null ? void 0 : _d.name) || "";
          const hasSevereCut = upperCut === "有上方截断" || lowerCut === "有下方截断";
          const score = person.score || person.confidence || 0;
          const hasHighConfidence = score > 0.5;
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:403", "hasValidLocation:", hasValidLocation);
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:404", "hasValidAttributes:", hasValidAttributes, "属性数量:", Object.keys(attributes).length);
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:405", "is_human:", isHuman, "isNormalHuman:", isNormalHuman);
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:406", "occlusion:", occlusion, "isHeavyOcclusion:", isHeavyOcclusion);
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:407", "upperCut:", upperCut, "lowerCut:", lowerCut, "hasSevereCut:", hasSevereCut);
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:408", "score:", score, "hasHighConfidence:", hasHighConfidence);
          if (!hasValidLocation) {
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:412", "位置信息无效，可能是误识别");
            this.debugMessage = "检测到人体但位置无效";
            return {
              success: false,
              message: "位置信息无效，可能是误识别",
              personCount: 0
            };
          }
          if (!isNormalHuman) {
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:423", "非正常人体，可能是误识别或严重截断/遮挡");
            this.debugMessage = "非正常人体: " + isHuman;
            return {
              success: false,
              message: "非正常人体: " + isHuman,
              personCount: 0
            };
          }
          if (isHeavyOcclusion) {
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:434", "重度遮挡，跳过");
            this.debugMessage = "重度遮挡，跳过";
            return {
              success: false,
              message: "重度遮挡",
              personCount: 0
            };
          }
          if (score > 0 && !hasHighConfidence) {
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:445", "置信度过低，可能是误识别");
            this.debugMessage = "检测置信度过低";
            return {
              success: false,
              message: "检测置信度过低，可能是误识别",
              personCount: 0
            };
          }
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:454", "=== 确认检测到有效人体 ===");
          return {
            success: true,
            personCount: response.person_num,
            attributes: {
              gender: ((_e = attributes.gender) == null ? void 0 : _e.name) || "unknown",
              age: ((_f = attributes.age) == null ? void 0 : _f.name) || "unknown",
              upperWear: ((_g = attributes.upper_wear) == null ? void 0 : _g.name) || "unknown",
              upperColor: ((_h = attributes.upper_color) == null ? void 0 : _h.name) || "unknown",
              lowerWear: ((_i = attributes.lower_wear) == null ? void 0 : _i.name) || "unknown",
              lowerColor: ((_j = attributes.lower_color) == null ? void 0 : _j.name) || "unknown",
              headWear: ((_k = attributes.headwear) == null ? void 0 : _k.name) || "unknown",
              glasses: ((_l = attributes.glasses) == null ? void 0 : _l.name) || "unknown",
              mask: ((_m = attributes.face_mask) == null ? void 0 : _m.name) || "unknown",
              bag: ((_n = attributes.bag) == null ? void 0 : _n.name) || "unknown",
              cellphone: ((_o = attributes.cellphone) == null ? void 0 : _o.name) || "unknown",
              smoke: ((_p = attributes.smoke) == null ? void 0 : _p.name) || "unknown",
              orientation: ((_q = attributes.orientation) == null ? void 0 : _q.name) || "unknown",
              isHuman,
              occlusion
            }
          };
        } else {
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:477", "未检测到人体，响应数据:", response);
          this.debugMessage = "未检测到人体";
          return {
            success: false,
            message: "未检测到人体",
            personCount: 0
          };
        }
      } catch (error) {
        this.debugMessage = "人体属性识别失败: " + error.message;
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:487", "人体属性识别失败:", error);
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:488", "错误详情:", error.errMsg || error);
        return {
          success: false,
          message: "网络请求失败: " + (error.errMsg || error.message)
        };
      }
    },
    async detectBodyTracking(imageBase64) {
      try {
        this.debugMessage = "调用人流量统计API...";
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:499", "调用人流量统计API...");
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:500", "图像Base64长度:", imageBase64.length);
        let cleanBase64 = imageBase64;
        if (imageBase64.includes("base64,")) {
          cleanBase64 = imageBase64.split("base64,")[1];
        }
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:506", "清理后Base64长度:", cleanBase64.length);
        const res = await common_vendor.index.request({
          url: "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_tracking?access_token=" + this.baiduConfig.accessToken,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: "image=" + encodeURIComponent(cleanBase64) + "&case_id=collector_case_001&case_init=" + (this.caseInit ? "true" : "false") + "&show=false"
        });
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:521", "人流量统计API原始响应:", res);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:522", "响应状态码:", res.statusCode);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:523", "响应数据:", res.data);
        if (res.statusCode !== 200) {
          common_vendor.index.__f__("error", "at pages/collector/collector.vue:527", "HTTP请求失败，状态码:", res.statusCode);
          this.debugMessage = `HTTP请求失败: ${res.statusCode}`;
          return {
            success: false,
            message: `HTTP请求失败，状态码: ${res.statusCode}`,
            statusCode: res.statusCode
          };
        }
        const response = res.data || res;
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:538", "解析后响应:", response);
        if (response.error_code) {
          common_vendor.index.__f__("error", "at pages/collector/collector.vue:542", "百度AI API错误:", response.error_code, response.error_msg);
          this.debugMessage = `API错误: ${response.error_msg || response.error_code}`;
          return {
            success: false,
            message: `API错误: ${response.error_msg || response.error_code}`,
            errorCode: response.error_code
          };
        }
        this.caseInit = false;
        if (response.person_info && response.person_info.length > 0 && response.person_num > 0) {
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:554", "人流量统计API成功响应，检测到人数:", response.person_num, "person_info数组长度:", response.person_info.length);
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:555", "完整person_info数组:", response.person_info);
          let inCount = 0;
          let outCount = 0;
          response.person_info.forEach((person, index) => {
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:561", `人流量统计 - 第${index}个人:`, person);
            if (person.action && person.action.length > 0) {
              const action = person.action[0];
              common_vendor.index.__f__("log", "at pages/collector/collector.vue:564", `人流量统计 - 第${index}个人动作:`, action);
              if (action.type === "in") {
                inCount++;
              } else if (action.type === "out") {
                outCount++;
              }
            }
          });
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:573", "人流量统计结果 - 人数:", response.person_num, "进入:", inCount, "离开:", outCount);
          return {
            success: true,
            personCount: response.person_num,
            inCount,
            outCount,
            persons: response.person_info
          };
        } else {
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:583", "未检测到人体跟踪数据，响应:", response);
          this.debugMessage = "未检测到人体";
          return {
            success: false,
            message: "未检测到人体",
            personCount: 0
          };
        }
      } catch (error) {
        this.debugMessage = "人流量统计失败: " + error.message;
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:593", "人流量统计失败:", error);
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:594", "错误详情:", error.errMsg || error);
        return {
          success: false,
          message: "网络请求失败: " + (error.errMsg || error.message)
        };
      }
    },
    async saveToUniCloud(data) {
      var _a, _b, _c;
      try {
        this.debugMessage = "正在保存到云数据库...";
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:605", "正在保存到云数据库:", data);
        const saveData = {
          ...data,
          storeId: ((_a = this.currentStore) == null ? void 0 : _a._id) || "",
          userId: ((_b = this.userInfo) == null ? void 0 : _b._id) || "",
          token: ((_c = this.userInfo) == null ? void 0 : _c.token) || ""
        };
        const customerInfor = common_vendor.tr.importObject("CustomerInfor");
        const result = await customerInfor.saveCustomerInfo(saveData);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:617", "云数据库返回:", result);
        if (result.errCode === 0) {
          this.currentCount++;
          if (data.inCount)
            this.totalInCount += data.inCount;
          if (data.outCount)
            this.totalOutCount += data.outCount;
          this.debugMessage = "保存成功！当前: " + this.currentCount;
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:624", "保存成功，当前:", this.currentCount, "进入:", this.totalInCount, "离开:", this.totalOutCount);
          return true;
        } else if (result.errCode === "TOKEN_MISSING" || result.errCode === "TOKEN_ERROR") {
          this.debugMessage = "登录已过期，请重新登录";
          common_vendor.index.showToast({ title: "请重新登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.reLaunch({ url: "/pages/login/login" });
          }, 1500);
          return false;
        } else {
          this.debugMessage = "保存失败: " + result.errMsg;
          common_vendor.index.__f__("error", "at pages/collector/collector.vue:635", "保存失败:", result.errMsg);
          return false;
        }
      } catch (error) {
        this.debugMessage = "保存异常: " + error.message;
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:640", "保存到云数据库异常:", error);
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:641", "错误堆栈:", error.stack);
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:642", "错误详细信息:", JSON.stringify(error));
        return false;
      }
    },
    // 检查人员是否重复（去重机制）
    checkPersonDuplicate(fingerprint, currentTime) {
      this.recentPersons = this.recentPersons.filter(
        (person) => currentTime - person.time < this.personCooldown
      );
      const existingPerson = this.recentPersons.find(
        (person) => person.fingerprint === fingerprint
      );
      return !!existingPerson;
    },
    // 记录人员检测
    recordPersonDetection(fingerprint, currentTime) {
      this.recentPersons.push({
        fingerprint,
        time: currentTime
      });
      if (this.recentPersons.length > 100) {
        this.recentPersons = this.recentPersons.slice(-100);
      }
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:674", "记录人员检测:", fingerprint, "当前列表长度:", this.recentPersons.length);
    },
    detectFrameChange(imageBase64) {
      const sampleSize = 100;
      const samples = [];
      for (let i = 0; i < imageBase64.length; i += sampleSize) {
        samples.push(imageBase64.charCodeAt(i));
      }
      if (!this.lastFrameSamples || this.lastFrameSamples.length === 0) {
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:690", "帧变化检测 - 首次运行，保存参考帧");
        this.lastFrameSamples = samples;
        return false;
      }
      let sameCount = 0;
      const compareLength = Math.min(samples.length, this.lastFrameSamples.length);
      for (let i = 0; i < compareLength; i++) {
        if (samples[i] === this.lastFrameSamples[i]) {
          sameCount++;
        }
      }
      const similarity = sameCount / compareLength;
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:705", "帧变化检测 - 相似度:", similarity.toFixed(3), "相同点:", sameCount, "总点数:", compareLength);
      const hasSignificantChange = similarity < 0.85;
      if (hasSignificantChange) {
        this.frameChangeCount++;
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:712", "帧变化检测 - 检测到显著变化，frameChangeCount:", this.frameChangeCount);
        this.lastFrameSamples = samples;
      } else {
        this.frameChangeCount = 0;
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:718", "帧变化检测 - 画面无显著变化，重置计数");
      }
      const result = this.frameChangeCount >= 2;
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:723", "帧变化检测 - 最终结果:", result);
      return result;
    },
    simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash.toString();
    },
    arrayBufferToBase64(arrayBuffer) {
      try {
        if (typeof common_vendor.wx$1 !== "undefined" && common_vendor.wx$1.arrayBufferToBase64) {
          return common_vendor.wx$1.arrayBufferToBase64(arrayBuffer);
        }
        let binary = "";
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return common_vendor.index.arrayBufferToBase64 ? common_vendor.index.arrayBufferToBase64(arrayBuffer) : binary;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:752", "arrayBufferToBase64转换失败:", error);
        return "";
      }
    },
    async processFrame() {
      if (!this.isCollecting) {
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:759", "processFrame: 未在采集中，直接返回");
        return;
      }
      if (!this.cameraContext) {
        this.debugMessage = "等待摄像头初始化...";
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:765", "processFrame: 摄像头上下文未初始化");
        return;
      }
      const now = Date.now();
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:770", "processFrame: 当前时间:", now, "上次检测时间:", this.lastDetectionTime, "间隔:", this.detectionInterval);
      if (now - this.lastDetectionTime < this.detectionInterval) {
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:773", `processFrame: 间隔不足，跳过 (${now - this.lastDetectionTime}ms < ${this.detectionInterval}ms)`);
        return;
      }
      try {
        this.debugMessage = "正在获取摄像头图片...";
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:779", "processFrame: 正在获取摄像头图片...");
        const imageBase64 = await this.getCameraImageBase64();
        this.lastDetectionTime = now;
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:784", `processFrame: 更新lastDetectionTime: ${now}, 图像长度: ${imageBase64.length}`);
        const hasChange = this.detectFrameChange(imageBase64);
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:787", `processFrame: 画面变化检测结果: ${hasChange}, 当前frameChangeCount: ${this.frameChangeCount}`);
        if (hasChange) {
          this.frameChangeCount = 0;
          this.debugMessage = "画面变动，开始识别...";
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:793", "processFrame: 画面变动，开始识别...");
          const attrResult = await this.detectBodyAttribute(imageBase64);
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:798", "processFrame: 识别结果:", {
            attrSuccess: attrResult == null ? void 0 : attrResult.success,
            attrData: attrResult
          });
          if (attrResult == null ? void 0 : attrResult.success) {
            const attrs = attrResult.attributes || {};
            const personFingerprint = [
              attrs.gender || "unknown",
              // 性别
              attrs.age || "unknown",
              // 年龄
              attrs.upperWear || "unknown",
              // 上衣类型
              attrs.upperColor || "unknown",
              // 上衣颜色
              attrs.lowerWear || "unknown",
              // 下装类型
              attrs.lowerColor || "unknown",
              // 下装颜色
              attrs.glasses || "unknown",
              // 是否戴眼镜
              attrs.mask || "unknown",
              // 是否戴口罩
              attrs.headWear || "unknown"
              // 是否戴帽子
            ].join("_");
            const currentTime = Date.now();
            const isDuplicate = this.checkPersonDuplicate(personFingerprint, currentTime);
            if (isDuplicate) {
              this.debugMessage = "检测到重复人员，跳过计数";
              common_vendor.index.__f__("log", "at pages/collector/collector.vue:825", "processFrame: 检测到重复人员，跳过计数:", personFingerprint);
            } else {
              this.recordPersonDetection(personFingerprint, currentTime);
              const saveData = {
                location: this.currentLocation,
                gender: attrs.gender || "unknown",
                age: attrs.age || "unknown",
                upperWear: attrs.upperWear || "unknown",
                upperColor: attrs.upperColor || "unknown",
                lowerWear: attrs.lowerWear || "unknown",
                lowerColor: attrs.lowerColor || "unknown",
                glasses: attrs.glasses || "unknown",
                mask: attrs.mask || "unknown",
                headWear: attrs.headWear || "unknown",
                bag: attrs.bag || "unknown"
              };
              common_vendor.index.__f__("log", "at pages/collector/collector.vue:845", "processFrame: 准备保存的数据:", saveData);
              await this.saveToUniCloud(saveData);
            }
          } else {
            this.debugMessage = "未检测到人体或识别失败";
            common_vendor.index.__f__("log", "at pages/collector/collector.vue:850", "processFrame: 未检测到人体或识别失败，attrResult:", attrResult);
          }
        } else {
          this.debugMessage = "画面无变化，跳过识别";
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:854", "processFrame: 画面无变化，跳过识别");
        }
      } catch (error) {
        this.errorCount++;
        this.debugMessage = `处理帧失败 (${this.errorCount}/${this.maxErrorCount}): ` + error.message;
        common_vendor.index.__f__("error", "at pages/collector/collector.vue:859", "processFrame: 处理帧失败:", error);
        if (this.errorCount >= this.maxErrorCount) {
          this.debugMessage = `错误次数过多，自动停止采集`;
          common_vendor.index.__f__("error", "at pages/collector/collector.vue:863", "processFrame: 错误次数过多，自动停止采集");
          this.stopCollection();
          common_vendor.index.showToast({ title: "采集异常，已自动停止", icon: "error" });
        }
      }
    },
    startCollection() {
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:871", "点击开始采集，当前isCameraReady:", this.isCameraReady);
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:872", "当前cameraContext:", this.cameraContext ? "已初始化" : "未初始化");
      if (!this.isCameraReady) {
        if (this.cameraContext) {
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:878", "摄像头上下文已存在但isCameraReady为false，自动修复状态");
          this.isCameraReady = true;
          this.debugMessage = "摄像头状态已自动修复为就绪";
          common_vendor.index.__f__("log", "at pages/collector/collector.vue:881", "已设置isCameraReady为true");
        } else {
          common_vendor.index.showToast({ title: "摄像头未就绪，请等待", icon: "none" });
          this.debugMessage = `摄像头未就绪，无法开始采集 (isCameraReady: ${this.isCameraReady}, cameraContext: ${this.cameraContext ? "已初始化" : "未初始化"})`;
          return;
        }
      }
      this.isCollecting = true;
      this.runSeconds = 0;
      this.currentCount = 0;
      this.totalInCount = 0;
      this.totalOutCount = 0;
      this.lastFrameHash = "";
      this.frameChangeCount = 0;
      this.lastDetectionTime = 0;
      this.caseInit = true;
      this.debugMessage = "开始采集...";
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:901", "开始采集...");
      this.timer = setInterval(() => {
        this.runSeconds++;
        this.updateRunTime();
      }, 1e3);
      this.scanTimer = setInterval(() => {
        this.scanLineTop = (this.scanLineTop + 2) % 110;
      }, 50);
      this.errorCount = 0;
      this.detectionTimer = setInterval(() => {
        this.generateDetectionDots();
        this.processFrame();
      }, 1e3);
    },
    stopCollection() {
      this.isCollecting = false;
      this.debugMessage = "已停止采集";
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:921", "已停止采集");
      this.stopAllTimers();
      this.detectionDots = [];
    },
    updateRunTime() {
      const hours = Math.floor(this.runSeconds / 3600);
      const minutes = Math.floor(this.runSeconds % 3600 / 60);
      const seconds = this.runSeconds % 60;
      this.runTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
    generateDetectionDots() {
      const count = Math.floor(Math.random() * 3) + 1;
      this.detectionDots = [];
      for (let i = 0; i < count; i++) {
        this.detectionDots.push({
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60
        });
      }
    },
    enableScreenOff() {
      if (!this.isCollecting) {
        common_vendor.index.showToast({ title: "请先开始采集", icon: "none" });
        return;
      }
      this.showScreenOff = true;
    },
    disableScreenOff() {
      this.showScreenOff = false;
    },
    checkCameraState() {
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:952", "手动检查摄像头状态...");
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:953", "当前isCameraReady:", this.isCameraReady);
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:954", "当前cameraContext:", this.cameraContext ? "已初始化" : "未初始化");
      if (this.cameraContext) {
        this.debugMessage = "摄像头上下文已存在，尝试手动设置就绪状态";
        this.isCameraReady = true;
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:959", "已手动设置isCameraReady为true");
      } else {
        this.debugMessage = "摄像头上下文未初始化，尝试重新初始化";
        common_vendor.index.__f__("log", "at pages/collector/collector.vue:962", "尝试重新初始化摄像头...");
        this.initCamera();
      }
      common_vendor.index.showToast({ title: "摄像头状态检查完成", icon: "none" });
    },
    forceCameraReady() {
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:969", "强制设置摄像头为就绪状态");
      this.isCameraReady = true;
      this.debugMessage = "摄像头已强制设置为就绪状态";
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:972", "isCameraReady设置为true");
      common_vendor.index.showToast({ title: "摄像头已强制就绪", icon: "success" });
    },
    async getDeviceLocation() {
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:979", "使用静态位置（位置权限配置问题临时解决方案）");
      this.currentLocation = "采集点A";
      this.debugMessage = "位置已设置为静态值: 采集点A";
      common_vendor.index.__f__("log", "at pages/collector/collector.vue:982", "设备位置: 静态位置 - 采集点A");
    }
  }
};
if (!Array) {
  const _component_svg_icon = common_vendor.resolveComponent("svg-icon");
  _component_svg_icon();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.statusBarHeight + 40 + "px",
    b: common_vendor.p({
      type: "arrow-left",
      size: 16,
      color: "rgba(255,255,255,0.8)"
    }),
    c: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    d: common_vendor.t($data.currentStoreName),
    e: common_vendor.p({
      type: "clock",
      size: 16,
      color: "rgba(255,255,255,0.6)"
    }),
    f: common_vendor.t($data.runTime),
    g: common_vendor.p({
      type: "cog",
      size: 18,
      color: "rgba(255,255,255,0.8)"
    }),
    h: common_vendor.o((...args) => $options.goToSettings && $options.goToSettings(...args)),
    i: common_vendor.o((...args) => $options.cameraError && $options.cameraError(...args)),
    j: common_vendor.o((...args) => $options.cameraReady && $options.cameraReady(...args)),
    k: common_vendor.o((...args) => $options.cameraReady && $options.cameraReady(...args)),
    l: $data.showDebug
  }, $data.showDebug ? {
    m: common_vendor.t($data.debugMessage),
    n: common_vendor.t($data.isCameraReady ? "就绪" : "未就绪"),
    o: common_vendor.t($data.currentLocation)
  } : {}, {
    p: $data.isCollecting
  }, $data.isCollecting ? {
    q: $data.scanLineTop + "%"
  } : {}, {
    r: common_vendor.f($data.detectionDots, (dot, index, i0) => {
      return {
        a: index,
        b: dot.x + "%",
        c: dot.y + "%"
      };
    }),
    s: common_vendor.t($data.isCollecting ? "识别中" : "等待开始"),
    t: common_vendor.t($data.currentCount),
    v: common_vendor.p({
      type: $data.isCollecting ? "stop" : "play",
      size: 20,
      color: "#ffffff"
    }),
    w: common_vendor.t($data.isCollecting ? "停止采集" : "开始采集"),
    x: common_vendor.n($data.isCollecting ? "stop" : ""),
    y: common_vendor.o((...args) => $options.toggleCollection && $options.toggleCollection(...args)),
    z: common_vendor.t($data.showDebug ? "隐藏调试" : "显示调试"),
    A: common_vendor.o((...args) => $options.toggleDebug && $options.toggleDebug(...args)),
    B: $data.showDebug
  }, $data.showDebug ? {
    C: common_vendor.o((...args) => $options.checkCameraState && $options.checkCameraState(...args)),
    D: common_vendor.o((...args) => $options.forceCameraReady && $options.forceCameraReady(...args))
  } : {}, {
    E: $data.showScreenOff
  }, $data.showScreenOff ? {
    F: common_vendor.p({
      type: "times",
      size: 16,
      color: "rgba(255,255,255,0.5)"
    }),
    G: common_vendor.o((...args) => $options.disableScreenOff && $options.disableScreenOff(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4e07a26f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collector/collector.js.map
