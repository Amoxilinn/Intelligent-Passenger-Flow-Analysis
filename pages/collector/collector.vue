<template>
	<view class="collector-page">
		<view class="status-bar" :style="{ height: (statusBarHeight + 40) + 'px' }"></view>
		
		<view class="header-bar">
			<view class="header-left">
				<view class="back-btn" @click="goBack">
					<svg-icon type="arrow-left" :size="16" color="rgba(255,255,255,0.8)"></svg-icon>
					<text class="back-text">返回</text>
				</view>
				<view class="divider"></view>
				<view class="location-info">
					<view class="status-dot"></view>
					<text class="location-name">{{ currentStoreName }}</text>
				</view>
			</view>
			<view class="header-right">
				<view class="network-status">
					<view class="status-dot online"></view>
					<text class="status-text">网络正常</text>
				</view>
				<view class="runtime">
					<svg-icon type="clock" :size="16" color="rgba(255,255,255,0.6)"></svg-icon>
					<text class="runtime-text">{{ runTime }}</text>
				</view>
				<view class="settings-btn" @click="goToSettings">
					<svg-icon type="cog" :size="18" color="rgba(255,255,255,0.8)"></svg-icon>
				</view>
			</view>
		</view>
		
		<view class="camera-container">
			<view class="camera-frame">
				<!-- 摄像头组件 -->
				<camera 
					class="camera-preview" 
					device-position="back"
					flash="off"
					@error="cameraError"
					@ready="cameraReady"
					@initdone="cameraReady"
				></camera>
				
				<!-- 调试信息 -->
				<view class="debug-info" v-if="showDebug">
					<text class="debug-text">{{ debugMessage }}</text>
					<text class="debug-text">摄像头: {{ isCameraReady ? '就绪' : '未就绪' }} | 位置: {{ currentLocation }}</text>
				</view>
				
				<view v-if="isCollecting" class="scan-line" :style="{ top: scanLineTop + '%' }"></view>
				
				<view class="detection-layer">
					<view 
						v-for="(dot, index) in detectionDots" 
						:key="index"
						class="detection-dot"
						:style="{ left: dot.x + '%', top: dot.y + '%' }"
					></view>
				</view>
				
				<view class="camera-badge">
					<view class="badge-dot"></view>
					<text class="badge-text">{{ isCollecting ? '识别中' : '等待开始' }}</text>
				</view>
				
				<view class="count-badge">
					<text class="count-label">当前识别</text>
					<text class="count-value">{{ currentCount }}</text>
				</view>
			</view>
		</view>
		
		<view class="control-area">
			<view class="btn-row">
				<view :class="['start-btn', isCollecting ? 'stop' : '']" @click="toggleCollection">
					<svg-icon :type="isCollecting ? 'stop' : 'play'" :size="20" color="#ffffff"></svg-icon>
					<text>{{ isCollecting ? '停止采集' : '开始采集' }}</text>
				</view>
				<view class="debug-btn" @click="toggleDebug">
					<text class="btn-label">{{ showDebug ? '隐藏调试' : '显示调试' }}</text>
				</view>
			</view>
			<view class="btn-row" v-if="showDebug">
				<view class="debug-btn" @click="checkCameraState">
					<text class="btn-label">检查摄像头</text>
				</view>
				<view class="debug-btn" @click="forceCameraReady">
					<text class="btn-label">强制就绪</text>
				</view>
			</view>
		</view>
		
		<view class="home-indicator"></view>
		
		<view v-if="showScreenOff" class="screen-off-overlay" @click="disableScreenOff">
			<view class="screen-off-content">
				<view class="breathe-dot"></view>
				<text class="off-text">正在采集中...</text>
				<text class="off-hint">屏幕已关闭以节省电量</text>
				<view class="exit-btn">
					<svg-icon type="times" :size="16" color="rgba(255,255,255,0.5)"></svg-icon>
					<text>退出息屏模式</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'

export default {
	components: { SvgIcon },
	data() {
		return {
			statusBarHeight: 44,
			isCollecting: false,
			currentCount: 0,
			totalInCount: 0,
			totalOutCount: 0,
			runTime: '00:00:00',
			runSeconds: 0,
			timer: null,
			scanLineTop: 0,
			scanTimer: null,
			detectionDots: [],
			detectionTimer: null,
			showScreenOff: false,
			showDebug: true,
			debugMessage: '准备就绪',
			sensitivity: 50,
			privacyMode: false,
			cameraPosition: 'front',
			baiduConfig: {
				apiKey: 'ucmVTMJB7nKQczcx9SxI6HLr',
				secretKey: 'yW3rjpByqYnecXpfIthphXbmcfg5pJE7',
				accessToken: '',
				tokenExpiry: null
			},
			cameraContext: null,
			isCameraReady: false,
			lastFrameSamples: [],
			lastDetectionTime: 0,
			detectionInterval: 2000,
			caseInit: true,
			currentLocation: '正门A',
			errorCount: 0,
			maxErrorCount: 5,
			frameChangeCount: 0,
			checkCameraTimeout: null,
			userInfo: {},
			currentStore: null,
			currentStoreName: '我的店铺',
			lastSavedPerson: null,
			lastSavedTime: 0,
			personCooldown: 10000,
			recentPersons: []
		}
	},
	onLoad() {
		this.loadUserInfo()
		this.initBaiduToken()
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 44
		this.debugMessage = '页面加载完成'
		console.log('页面加载完成')
		console.log('系统信息:', systemInfo)
		console.log('初始摄像头状态 - isCameraReady:', this.isCameraReady, 'cameraContext:', this.cameraContext)
		this.getDeviceLocation()
		
		console.log('设置延迟摄像头状态检查...')
		this.checkCameraTimeout = setTimeout(() => {
			console.log('延迟检查摄像头状态...')
			if (!this.isCameraReady && this.cameraContext) {
				console.log('摄像头上下文已存在但状态未更新，手动设置就绪')
				this.isCameraReady = true
				this.debugMessage = '摄像头已通过延迟检查就绪'
			} else if (!this.isCameraReady) {
				console.log('摄像头仍未就绪，尝试重新初始化')
				this.initCamera()
				this.debugMessage = '摄像头重新初始化中...'
			}
		}, 3000)
	},
	onShow() {
		this.loadUserInfo()
		if (!this.baiduConfig.accessToken || !this.baiduConfig.tokenExpiry || Date.now() >= this.baiduConfig.tokenExpiry) {
			this.initBaiduToken()
		}
	},
	onUnload() {
		this.stopAllTimers()
	},
	methods: {
		loadUserInfo() {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userInfo = userInfo
				this.currentStore = userInfo.currentStore
				if (this.currentStore) {
					this.currentStoreName = this.currentStore.name
				}
			}
		},
		async initBaiduToken() {
			const tokenStorageKey = 'baidu_access_token'
			const expiryStorageKey = 'baidu_token_expiry'
			const cachedToken = uni.getStorageSync(tokenStorageKey)
			const cachedExpiry = uni.getStorageSync(expiryStorageKey)
			if (cachedToken && cachedExpiry && Date.now() < cachedExpiry) {
				this.baiduConfig.accessToken = cachedToken
				this.baiduConfig.tokenExpiry = cachedExpiry
				this.debugMessage = '百度Token加载成功(缓存)'
				console.log('使用缓存的Token，有效期至:', new Date(cachedExpiry))
				return
			}
			await this.refreshBaiduToken()
		},
		async refreshBaiduToken() {
			try {
				this.debugMessage = '正在获取百度Token...'
				console.log('开始获取百度AccessToken...')
				const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token'
				const res = await uni.request({
					url: tokenUrl,
					method: 'POST',
					data: {
						grant_type: 'client_credentials',
						client_id: this.baiduConfig.apiKey,
						client_secret: this.baiduConfig.secretKey
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				})
				console.log('Token请求响应:', res)
				if (res.data && res.data.access_token) {
					const expiresIn = res.data.expires_in || 2592000
					const expiryTime = Date.now() + (expiresIn * 1000) - 60000
					this.baiduConfig.accessToken = res.data.access_token
					this.baiduConfig.tokenExpiry = expiryTime
					uni.setStorageSync('baidu_access_token', res.data.access_token)
					uni.setStorageSync('baidu_token_expiry', expiryTime)
					this.debugMessage = '百度Token获取成功'
					console.log('Token获取成功，有效期:', expiresIn, '秒')
				} else {
					console.error('Token获取失败:', res.data)
					this.debugMessage = 'Token获取失败'
				}
			} catch (error) {
				console.error('Token获取异常:', error)
				this.debugMessage = 'Token获取异常'
			}
		},
		async ensureValidToken() {
			if (!this.baiduConfig.accessToken || !this.baiduConfig.tokenExpiry || Date.now() >= this.baiduConfig.tokenExpiry) {
				console.log('Token无效或已过期，开始刷新...')
				await this.refreshBaiduToken()
			}
		},
		goToSettings() {
			uni.navigateTo({ url: '/pages/settings/settings' })
		},
		goBack() {
			this.stopAllTimers()
			uni.navigateBack()
		},
		stopAllTimers() {
			if (this.timer) clearInterval(this.timer)
			if (this.scanTimer) clearInterval(this.scanTimer)
			if (this.detectionTimer) clearInterval(this.detectionTimer)
			if (this.checkCameraTimeout) clearTimeout(this.checkCameraTimeout)
		},
		toggleCollection() {
			if (this.isCollecting) {
				this.stopCollection()
			} else {
				this.startCollection()
			}
		},
		toggleDebug() {
			this.showDebug = !this.showDebug
		},
		cameraReady() {
			console.log('cameraReady事件触发')
			this.debugMessage = '摄像头准备就绪'
			this.isCameraReady = true
			console.log('isCameraReady设置为true')
			this.initCamera()
		},
		cameraError(e) {
			console.error('cameraError事件触发:', e)
			this.isCameraReady = false
			this.debugMessage = '摄像头错误: ' + JSON.stringify(e)
			console.error('摄像头错误:', e)
			uni.showToast({ title: '摄像头初始化失败', icon: 'none' })
		},

		initCamera() {
			console.log('开始初始化摄像头上下文...')
			this.cameraContext = uni.createCameraContext()
			console.log('摄像头上下文创建完成:', this.cameraContext ? '成功' : '失败')
			this.isCameraReady = true
			this.debugMessage = '摄像头初始化完成'
			console.log('摄像头初始化完成，isCameraReady设置为true')
		},

		async getCameraImageBase64() {
			return new Promise((resolve, reject) => {
				if (!this.cameraContext) {
					reject(new Error('摄像头未初始化'))
					return
				}

				this.debugMessage = '正在拍照...'
				console.log('正在拍照...')
				
				this.cameraContext.takePhoto({
					quality: 'low',
					success: (res) => {
						console.log('拍照成功:', res)
						const tempFilePath = res.tempImagePath
						console.log('临时文件路径:', tempFilePath)
						
						// 尝试读取文件
						uni.getFileSystemManager().readFile({
							filePath: tempFilePath,
							encoding: 'base64',
							success: (fileRes) => {
								console.log('读取文件成功，数据长度:', fileRes.data ? fileRes.data.length : 0)
								console.log('数据前100字符:', fileRes.data ? fileRes.data.substring(0, 100) : '无数据')
								if (fileRes.data && fileRes.data.length > 100) {
									this.debugMessage = '获取图像成功'
									resolve(fileRes.data)
								} else {
									reject(new Error('图像数据长度不足: ' + (fileRes.data ? fileRes.data.length : 0)))
								}
							},
							fail: (err) => {
								console.error('读取文件失败:', err)
								this.debugMessage = '读取文件失败: ' + err.errMsg
								reject(err)
							}
						})
					},
					fail: (err) => {
						console.error('拍照失败:', err)
						this.debugMessage = '拍照失败: ' + err.errMsg
						reject(err)
					}
				})
			})
		},

		async detectBodyAttribute(imageBase64) {
			try {
				await this.ensureValidToken()
				this.debugMessage = '调用人体属性识别API...'
				console.log('调用人体属性识别API...')
				console.log('图像Base64长度:', imageBase64.length)
				
				// 移除data URL前缀
				let cleanBase64 = imageBase64
				if (imageBase64.includes('base64,')) {
					cleanBase64 = imageBase64.split('base64,')[1]
				}
				console.log('清理后Base64长度:', cleanBase64.length)
				
				// 验证base64是否有效
				if (!cleanBase64 || cleanBase64.length < 100) {
					console.error('Base64数据无效，长度:', cleanBase64 ? cleanBase64.length : 0)
					return { success: false, message: 'Base64数据无效' }
				}
				
				console.log('access_token:', this.baiduConfig.accessToken)
				console.log('Base64前50字符:', cleanBase64.substring(0, 50))
				
				// 手动构建请求体，使用encodeURIComponent编码
				// 添加type参数，包含is_human属性用于判断是否是正常人体
				const requestBody = 'image=' + encodeURIComponent(cleanBase64) + 
					'&type=gender,age,upper_wear,lower_wear,upper_color,lower_color,headwear,glasses,face_mask,bag,cellphone,smoke,orientation,upper_cut,lower_cut,occlusion,is_human'
				
				const res = await uni.request({
					url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/body_attr?access_token=' + this.baiduConfig.accessToken,
					method: 'POST',
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: requestBody
				})
				
				console.log('人体属性识别API原始响应:', res)
				console.log('响应状态码:', res.statusCode)
				console.log('响应数据:', res.data)
				
				// 检查HTTP状态码
				if (res.statusCode !== 200) {
					console.error('HTTP请求失败，状态码:', res.statusCode)
					this.debugMessage = `HTTP请求失败: ${res.statusCode}`
					return {
						success: false,
						message: `HTTP请求失败，状态码: ${res.statusCode}`,
						statusCode: res.statusCode
					}
				}
				
				// uni.request在微信小程序中返回的是对象，不是数组
				const response = res.data || res
				console.log('解析后响应:', response)
				
				// 检查API错误
				if (response.error_code) {
					console.error('百度AI API错误:', response.error_code, response.error_msg)
					this.debugMessage = `API错误: ${response.error_msg || response.error_code}`
					if ([110, 111, 112].includes(response.error_code)) {
						console.log('检测到Token过期错误，自动刷新Token...')
						this.debugMessage = 'Token已过期，正在刷新...'
						await this.refreshBaiduToken()
						return this.detectBodyAttribute(imageBase64)
					}
					return {
						success: false,
						message: `API错误: ${response.error_msg || response.error_code}`,
						errorCode: response.error_code
					}
				}
				
				// 检查是否检测到人体
				// 必须同时满足：person_num > 0 且 person_info有有效数据
				console.log('=== API响应详细分析 ===')
				console.log('person_num:', response.person_num)
				console.log('person_info:', JSON.stringify(response.person_info, null, 2))
				
				if (response.person_info && response.person_info.length > 0 && response.person_num > 0) {
					const person = response.person_info[0]
					console.log('person_info[0]:', JSON.stringify(person, null, 2))
					
					// 检查person是否有有效的位置信息（确认是真正检测到的人体）
					const location = person.location || {}
					console.log('location对象:', location)
					
					// 百度API返回的位置信息字段可能是：left, top, width, height
					// 或者：x, y, width, height
					const hasValidLocation = (location.left !== undefined || location.x !== undefined) && 
						(location.top !== undefined || location.y !== undefined) && 
						location.width !== undefined && 
						location.height !== undefined
					
					// 检查person是否有有效的attributes
					const attributes = person.attributes || {}
					const hasValidAttributes = Object.keys(attributes).length > 0
					
					// 关键检查：is_human属性判断是否是正常人体
					// is_human: "非正常人体" 或 "正常人体"
					// 正常人体：身体露出大于二分之一的人体
					// 非正常人体：严重截断、或严重遮挡的人体
					const isHuman = attributes.is_human?.name || ''
					const isNormalHuman = isHuman === '正常人体'
					
					// 检查遮挡情况
					const occlusion = attributes.occlusion?.name || ''
					const isHeavyOcclusion = occlusion === '重度遮挡'
					
					// 检查截断情况
					const upperCut = attributes.upper_cut?.name || ''
					const lowerCut = attributes.lower_cut?.name || ''
					const hasSevereCut = upperCut === '有上方截断' || lowerCut === '有下方截断'
					
					// 检查置信度（如果有）
					const score = person.score || person.confidence || 0
					const hasHighConfidence = score > 0.5
					
					console.log('hasValidLocation:', hasValidLocation)
					console.log('hasValidAttributes:', hasValidAttributes, '属性数量:', Object.keys(attributes).length)
					console.log('is_human:', isHuman, 'isNormalHuman:', isNormalHuman)
					console.log('occlusion:', occlusion, 'isHeavyOcclusion:', isHeavyOcclusion)
					console.log('upperCut:', upperCut, 'lowerCut:', lowerCut, 'hasSevereCut:', hasSevereCut)
					console.log('score:', score, 'hasHighConfidence:', hasHighConfidence)
					
					// 必须有有效的位置信息才算真正检测到人
					if (!hasValidLocation) {
						console.log('位置信息无效，可能是误识别')
						this.debugMessage = '检测到人体但位置无效'
						return {
							success: false,
							message: '位置信息无效，可能是误识别',
							personCount: 0
						}
					}
					
					// 关键检查：必须是正常人体
					if (!isNormalHuman) {
						console.log('非正常人体，可能是误识别或严重截断/遮挡')
						this.debugMessage = '非正常人体: ' + isHuman
						return {
							success: false,
							message: '非正常人体: ' + isHuman,
							personCount: 0
						}
					}
					
					// 重度遮挡也过滤掉
					if (isHeavyOcclusion) {
						console.log('重度遮挡，跳过')
						this.debugMessage = '重度遮挡，跳过'
						return {
							success: false,
							message: '重度遮挡',
							personCount: 0
						}
					}
					
					// 如果有置信度且太低，也认为是误识别
					if (score > 0 && !hasHighConfidence) {
						console.log('置信度过低，可能是误识别')
						this.debugMessage = '检测置信度过低'
						return {
							success: false,
							message: '检测置信度过低，可能是误识别',
							personCount: 0
						}
					}
					
					console.log('=== 确认检测到有效人体 ===')
					return {
						success: true,
						personCount: response.person_num,
						attributes: {
							gender: attributes.gender?.name || 'unknown',
							age: attributes.age?.name || 'unknown',
							upperWear: attributes.upper_wear?.name || 'unknown',
							upperColor: attributes.upper_color?.name || 'unknown',
							lowerWear: attributes.lower_wear?.name || 'unknown',
							lowerColor: attributes.lower_color?.name || 'unknown',
							headWear: attributes.headwear?.name || 'unknown',
							glasses: attributes.glasses?.name || 'unknown',
							mask: attributes.face_mask?.name || 'unknown',
							bag: attributes.bag?.name || 'unknown',
							cellphone: attributes.cellphone?.name || 'unknown',
							smoke: attributes.smoke?.name || 'unknown',
							orientation: attributes.orientation?.name || 'unknown',
							isHuman: isHuman,
							occlusion: occlusion
						}
					}
				} else {
					console.log('未检测到人体，响应数据:', response)
					this.debugMessage = '未检测到人体'
					return {
						success: false,
						message: '未检测到人体',
						personCount: 0
					}
				}
			} catch (error) {
				this.debugMessage = '人体属性识别失败: ' + error.message
				console.error('人体属性识别失败:', error)
				console.error('错误详情:', error.errMsg || error)
				return {
					success: false,
					message: '网络请求失败: ' + (error.errMsg || error.message)
				}
			}
		},

		async detectBodyTracking(imageBase64) {
			try {
				await this.ensureValidToken()
				this.debugMessage = '调用人流量统计API...'
				console.log('调用人流量统计API...')
				console.log('图像Base64长度:', imageBase64.length)
				
				let cleanBase64 = imageBase64
				if (imageBase64.includes('base64,')) {
					cleanBase64 = imageBase64.split('base64,')[1]
				}
				console.log('清理后Base64长度:', cleanBase64.length)
				
				// 简化请求参数，只传必需的参数
				const res = await uni.request({
					url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/body_tracking?access_token=' + this.baiduConfig.accessToken,
					method: 'POST',
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: 'image=' + encodeURIComponent(cleanBase64) + 
						'&case_id=collector_case_001' +
						'&case_init=' + (this.caseInit ? 'true' : 'false') +
						'&show=false'
				})
				
				console.log('人流量统计API原始响应:', res)
				console.log('响应状态码:', res.statusCode)
				console.log('响应数据:', res.data)
				
				// 检查HTTP状态码
				if (res.statusCode !== 200) {
					console.error('HTTP请求失败，状态码:', res.statusCode)
					this.debugMessage = `HTTP请求失败: ${res.statusCode}`
					return {
						success: false,
						message: `HTTP请求失败，状态码: ${res.statusCode}`,
						statusCode: res.statusCode
					}
				}
				
				// uni.request在微信小程序中返回的是对象，不是数组
				const response = res.data || res
				console.log('解析后响应:', response)
				
				// 检查API错误
				if (response.error_code) {
					console.error('百度AI API错误:', response.error_code, response.error_msg)
					this.debugMessage = `API错误: ${response.error_msg || response.error_code}`
					if ([110, 111, 112].includes(response.error_code)) {
						console.log('检测到Token过期错误，自动刷新Token...')
						this.debugMessage = 'Token已过期，正在刷新...'
						await this.refreshBaiduToken()
						return this.detectBodyTracking(imageBase64)
					}
					return {
						success: false,
						message: `API错误: ${response.error_msg || response.error_code}`,
						errorCode: response.error_code
					}
				}
				
				this.caseInit = false
				
				if (response.person_info && response.person_info.length > 0 && response.person_num > 0) {
					console.log('人流量统计API成功响应，检测到人数:', response.person_num, 'person_info数组长度:', response.person_info.length)
					console.log('完整person_info数组:', response.person_info)
					
					let inCount = 0
					let outCount = 0
					
					response.person_info.forEach((person, index) => {
						console.log(`人流量统计 - 第${index}个人:`, person)
						if (person.action && person.action.length > 0) {
							const action = person.action[0]
							console.log(`人流量统计 - 第${index}个人动作:`, action)
							if (action.type === 'in') {
								inCount++
							} else if (action.type === 'out') {
								outCount++
							}
						}
					})
					
					console.log('人流量统计结果 - 人数:', response.person_num, '进入:', inCount, '离开:', outCount)
					
					return {
						success: true,
						personCount: response.person_num,
						inCount: inCount,
						outCount: outCount,
						persons: response.person_info
					}
				} else {
					console.log('未检测到人体跟踪数据，响应:', response)
					this.debugMessage = '未检测到人体'
					return {
						success: false,
						message: '未检测到人体',
						personCount: 0
					}
				}
			} catch (error) {
				this.debugMessage = '人流量统计失败: ' + error.message
				console.error('人流量统计失败:', error)
				console.error('错误详情:', error.errMsg || error)
				return {
					success: false,
					message: '网络请求失败: ' + (error.errMsg || error.message)
				}
			}
		},

		async saveToUniCloud(data) {
			try {
				this.debugMessage = '正在保存到云数据库...'
				console.log('正在保存到云数据库:', data)
				
				const saveData = {
					...data,
					storeId: this.currentStore?._id || '',
					userId: this.userInfo?._id || '',
					token: this.userInfo?.token || ''
				}
				
				const customerInfor = uniCloud.importObject('CustomerInfor')
				const result = await customerInfor.saveCustomerInfo(saveData)
				
				console.log('云数据库返回:', result)
				
				if (result.errCode === 0) {
					this.currentCount++
					if (data.inCount) this.totalInCount += data.inCount
					if (data.outCount) this.totalOutCount += data.outCount
					this.debugMessage = '保存成功！当前: ' + this.currentCount
					console.log('保存成功，当前:', this.currentCount, '进入:', this.totalInCount, '离开:', this.totalOutCount)
					return true
				} else if (result.errCode === 'TOKEN_MISSING' || result.errCode === 'TOKEN_ERROR') {
					this.debugMessage = '登录已过期，请重新登录'
					uni.showToast({ title: '请重新登录', icon: 'none' })
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/login/login' })
					}, 1500)
					return false
				} else {
					this.debugMessage = '保存失败: ' + result.errMsg
					console.error('保存失败:', result.errMsg)
					return false
				}
			} catch (error) {
				this.debugMessage = '保存异常: ' + error.message
				console.error('保存到云数据库异常:', error)
				console.error('错误堆栈:', error.stack)
				console.error('错误详细信息:', JSON.stringify(error))
				return false
			}
		},

		// 检查人员是否重复（去重机制）
		checkPersonDuplicate(fingerprint, currentTime) {
			// 清理过期的记录（超过冷却时间的）
			this.recentPersons = this.recentPersons.filter(
				person => currentTime - person.time < this.personCooldown
			)
			
			// 检查是否有相同指纹的人员在冷却期内
			const existingPerson = this.recentPersons.find(
				person => person.fingerprint === fingerprint
			)
			
			return !!existingPerson
		},

		// 记录人员检测
		recordPersonDetection(fingerprint, currentTime) {
			this.recentPersons.push({
				fingerprint: fingerprint,
				time: currentTime
			})
			
			// 保持列表不超过100条
			if (this.recentPersons.length > 100) {
				this.recentPersons = this.recentPersons.slice(-100)
			}
			
			console.log('记录人员检测:', fingerprint, '当前列表长度:', this.recentPersons.length)
		},

		detectFrameChange(imageBase64) {
			// 使用更智能的帧变化检测：计算相似度而不是简单的hash比较
			// 这样可以忽略摄像头的微小噪声
			
			// 采样更多数据点进行比较（每隔100个字符取一个）
			const sampleSize = 100
			const samples = []
			for (let i = 0; i < imageBase64.length; i += sampleSize) {
				samples.push(imageBase64.charCodeAt(i))
			}
			
			// 首次运行，保存参考帧
			if (!this.lastFrameSamples || this.lastFrameSamples.length === 0) {
				console.log('帧变化检测 - 首次运行，保存参考帧')
				this.lastFrameSamples = samples
				return false
			}
			
			// 计算相似度
			let sameCount = 0
			const compareLength = Math.min(samples.length, this.lastFrameSamples.length)
			for (let i = 0; i < compareLength; i++) {
				if (samples[i] === this.lastFrameSamples[i]) {
					sameCount++
				}
			}
			
			const similarity = sameCount / compareLength
			console.log('帧变化检测 - 相似度:', similarity.toFixed(3), '相同点:', sameCount, '总点数:', compareLength)
			
			// 只有相似度低于0.85才认为画面有显著变化（忽略噪声）
			const hasSignificantChange = similarity < 0.85
			
			if (hasSignificantChange) {
				this.frameChangeCount++
				console.log('帧变化检测 - 检测到显著变化，frameChangeCount:', this.frameChangeCount)
				// 更新参考帧
				this.lastFrameSamples = samples
			} else {
				// 画面基本没变，重置计数
				this.frameChangeCount = 0
				console.log('帧变化检测 - 画面无显著变化，重置计数')
			}
			
			// 需要连续2次检测到变化才触发识别
			const result = this.frameChangeCount >= 2
			console.log('帧变化检测 - 最终结果:', result)
			return result
		},

		simpleHash(str) {
			let hash = 0
			for (let i = 0; i < str.length; i++) {
				const char = str.charCodeAt(i)
				hash = ((hash << 5) - hash) + char
				hash = hash & hash
			}
			return hash.toString()
		},

		arrayBufferToBase64(arrayBuffer) {
			try {
				// 尝试使用wx.arrayBufferToBase64（微信小程序）
				if (typeof wx !== 'undefined' && wx.arrayBufferToBase64) {
					return wx.arrayBufferToBase64(arrayBuffer)
				}
				
				// 备用方法：手动转换
				let binary = ''
				const bytes = new Uint8Array(arrayBuffer)
				for (let i = 0; i < bytes.byteLength; i++) {
					binary += String.fromCharCode(bytes[i])
				}
				return uni.arrayBufferToBase64 ? uni.arrayBufferToBase64(arrayBuffer) : binary
			} catch (error) {
				console.error('arrayBufferToBase64转换失败:', error)
				return ''
			}
		},

		async processFrame() {
			if (!this.isCollecting) {
				console.log('processFrame: 未在采集中，直接返回')
				return
			}
			
			if (!this.cameraContext) {
				this.debugMessage = '等待摄像头初始化...'
				console.log('processFrame: 摄像头上下文未初始化')
				return
			}
			
			const now = Date.now()
			console.log('processFrame: 当前时间:', now, '上次检测时间:', this.lastDetectionTime, '间隔:', this.detectionInterval)
			
			if (now - this.lastDetectionTime < this.detectionInterval) {
				console.log(`processFrame: 间隔不足，跳过 (${now - this.lastDetectionTime}ms < ${this.detectionInterval}ms)`)
				return
			}
			
			try {
				this.debugMessage = '正在获取摄像头图片...'
				console.log('processFrame: 正在获取摄像头图片...')
				const imageBase64 = await this.getCameraImageBase64()
				
				// 无论画面是否有变化，更新上次检测时间，避免连续拍照
				this.lastDetectionTime = now
				console.log(`processFrame: 更新lastDetectionTime: ${now}, 图像长度: ${imageBase64.length}`)
				
				const hasChange = this.detectFrameChange(imageBase64)
				console.log(`processFrame: 画面变化检测结果: ${hasChange}, 当前frameChangeCount: ${this.frameChangeCount}`)
				
				if (hasChange) {
					this.frameChangeCount = 0
				
				this.debugMessage = '画面变动，开始识别...'
				console.log('processFrame: 画面变动，开始识别...')
				
				// 只调用人体属性识别API，暂时禁用人流量统计API
				const attrResult = await this.detectBodyAttribute(imageBase64)
				
				console.log('processFrame: 识别结果:', { 
					attrSuccess: attrResult?.success,
					attrData: attrResult
				})
				
				if (attrResult?.success) {
					// 生成人员指纹（基于多个特征，提高准确度）
					const attrs = attrResult.attributes || {}
					const personFingerprint = [
						attrs.gender || 'unknown',           // 性别
						attrs.age || 'unknown',              // 年龄
						attrs.upperWear || 'unknown',        // 上衣类型
						attrs.upperColor || 'unknown',       // 上衣颜色
						attrs.lowerWear || 'unknown',        // 下装类型
						attrs.lowerColor || 'unknown',       // 下装颜色
						attrs.glasses || 'unknown',          // 是否戴眼镜
						attrs.mask || 'unknown',             // 是否戴口罩
						attrs.headWear || 'unknown'          // 是否戴帽子
					].join('_')
					
					const currentTime = Date.now()
					
					// 检查是否在冷却期内（去重）
					const isDuplicate = this.checkPersonDuplicate(personFingerprint, currentTime)
					
					if (isDuplicate) {
						this.debugMessage = '检测到重复人员，跳过计数'
						console.log('processFrame: 检测到重复人员，跳过计数:', personFingerprint)
					} else {
						// 记录这次检测
						this.recordPersonDetection(personFingerprint, currentTime)
						
						// 保存所有属性到数据库
						const saveData = {
							location: this.currentLocation,
							gender: attrs.gender || 'unknown',
							age: attrs.age || 'unknown',
							upperWear: attrs.upperWear || 'unknown',
							upperColor: attrs.upperColor || 'unknown',
							lowerWear: attrs.lowerWear || 'unknown',
							lowerColor: attrs.lowerColor || 'unknown',
							glasses: attrs.glasses || 'unknown',
							mask: attrs.mask || 'unknown',
							headWear: attrs.headWear || 'unknown',
							bag: attrs.bag || 'unknown'
						}
						
						console.log('processFrame: 准备保存的数据:', saveData)
						await this.saveToUniCloud(saveData)
					}
				} else {
					this.debugMessage = '未检测到人体或识别失败'
					console.log('processFrame: 未检测到人体或识别失败，attrResult:', attrResult)
				}
			} else {
					this.debugMessage = '画面无变化，跳过识别'
					console.log('processFrame: 画面无变化，跳过识别')
				}
			} catch (error) {
				this.errorCount++
				this.debugMessage = `处理帧失败 (${this.errorCount}/${this.maxErrorCount}): ` + error.message
				console.error('processFrame: 处理帧失败:', error)
				
				if (this.errorCount >= this.maxErrorCount) {
					this.debugMessage = `错误次数过多，自动停止采集`
					console.error('processFrame: 错误次数过多，自动停止采集')
					this.stopCollection()
					uni.showToast({ title: '采集异常，已自动停止', icon: 'error' })
				}
			}
		},

		startCollection() {
			console.log('点击开始采集，当前isCameraReady:', this.isCameraReady)
			console.log('当前cameraContext:', this.cameraContext ? '已初始化' : '未初始化')
			
			// 健壮的摄像头状态检查
			if (!this.isCameraReady) {
				// 如果摄像头上下文已初始化但状态未更新，自动修复状态
				if (this.cameraContext) {
					console.log('摄像头上下文已存在但isCameraReady为false，自动修复状态')
					this.isCameraReady = true
					this.debugMessage = '摄像头状态已自动修复为就绪'
					console.log('已设置isCameraReady为true')
				} else {
					// 摄像头上下文也未初始化，提示用户等待
					uni.showToast({ title: '摄像头未就绪，请等待', icon: 'none' })
					this.debugMessage = `摄像头未就绪，无法开始采集 (isCameraReady: ${this.isCameraReady}, cameraContext: ${this.cameraContext ? '已初始化' : '未初始化'})`
					return
				}
			}
			
			this.isCollecting = true
			this.runSeconds = 0
			this.currentCount = 0
			this.totalInCount = 0
			this.totalOutCount = 0
			this.lastFrameHash = ''
			this.frameChangeCount = 0
			this.lastDetectionTime = 0
			this.caseInit = true
			
			this.debugMessage = '开始采集...'
			console.log('开始采集...')
			
			this.timer = setInterval(() => {
				this.runSeconds++
				this.updateRunTime()
			}, 1000)
			
			this.scanTimer = setInterval(() => {
				this.scanLineTop = (this.scanLineTop + 2) % 110
			}, 50)
			
			this.errorCount = 0
			this.detectionTimer = setInterval(() => {
				this.generateDetectionDots()
				this.processFrame()
			}, 1000)
		},
		stopCollection() {
			this.isCollecting = false
			this.debugMessage = '已停止采集'
			console.log('已停止采集')
			this.stopAllTimers()
			this.detectionDots = []
		},
		updateRunTime() {
			const hours = Math.floor(this.runSeconds / 3600)
			const minutes = Math.floor((this.runSeconds % 3600) / 60)
			const seconds = this.runSeconds % 60
			this.runTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
		},
		generateDetectionDots() {
			const count = Math.floor(Math.random() * 3) + 1
			this.detectionDots = []
			for (let i = 0; i < count; i++) {
				this.detectionDots.push({
					x: 20 + Math.random() * 60,
					y: 20 + Math.random() * 60
				})
			}
		},
		enableScreenOff() {
			if (!this.isCollecting) {
				uni.showToast({ title: '请先开始采集', icon: 'none' })
				return
			}
			this.showScreenOff = true
		},
		disableScreenOff() {
			this.showScreenOff = false
		},
		checkCameraState() {
			console.log('手动检查摄像头状态...')
			console.log('当前isCameraReady:', this.isCameraReady)
			console.log('当前cameraContext:', this.cameraContext ? '已初始化' : '未初始化')
			
			if (this.cameraContext) {
				this.debugMessage = '摄像头上下文已存在，尝试手动设置就绪状态'
				this.isCameraReady = true
				console.log('已手动设置isCameraReady为true')
			} else {
				this.debugMessage = '摄像头上下文未初始化，尝试重新初始化'
				console.log('尝试重新初始化摄像头...')
				this.initCamera()
			}
			
			uni.showToast({ title: '摄像头状态检查完成', icon: 'none' })
		},
		forceCameraReady() {
			console.log('强制设置摄像头为就绪状态')
			this.isCameraReady = true
			this.debugMessage = '摄像头已强制设置为就绪状态'
			console.log('isCameraReady设置为true')
			uni.showToast({ title: '摄像头已强制就绪', icon: 'success' })
		},
		async getDeviceLocation() {
			// 临时解决方案：使用静态位置，避免位置权限配置问题
			// 位置权限配置在manifest.json中已声明，但编译后可能未生效
			// 使用静态位置确保核心功能正常运行
			console.log('使用静态位置（位置权限配置问题临时解决方案）')
			this.currentLocation = '采集点A'
			this.debugMessage = '位置已设置为静态值: 采集点A'
			console.log('设备位置: 静态位置 - 采集点A')
			
			// 原始代码（注释掉，待权限配置修复后启用）
			/*
			try {
				console.log('开始获取位置权限...')
				const res = await uni.getLocation({
					type: 'wgs84',
					altitude: false,
					geocode: true
				})
				
				const { latitude, longitude, address } = res
				if (address && address.city && address.district) {
					this.currentLocation = `${address.city} ${address.district}`
				} else {
					this.currentLocation = `坐标: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
				}
				this.debugMessage = `位置获取成功: ${this.currentLocation}`
				console.log('设备位置:', res)
			} catch (error) {
				console.error('获取位置失败:', error)
				console.error('完整错误信息:', JSON.stringify(error))
				this.debugMessage = `位置获取失败，使用默认位置: ${error.errMsg || error.message}`
				this.currentLocation = '默认位置'
				// 如果是权限问题，提示用户
				if (error.errMsg && error.errMsg.includes('requiredPrivateInfos')) {
					console.warn('位置权限需要在manifest.json中声明requiredPrivateInfos')
					console.warn('已创建app.json、ext.json并在manifest.json中声明权限')
					console.warn('请重新编译项目使权限配置生效')
				}
				// 位置获取失败不影响主要功能，继续运行
				console.log('位置获取失败，继续使用默认位置')
			}
			*/
		}
	}
}
</script>

<style scoped>
.collector-page {
	min-height: 100vh;
	background: #0a0a0a;
	display: flex;
	flex-direction: column;
}

.status-bar {
	background: transparent;
}

.header-bar {
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(20px);
	padding: 16rpx 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.back-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	background: rgba(255, 255, 255, 0.1);
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
}

.back-text {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.8);
}

.divider {
	width: 1px;
	height: 24rpx;
	background: rgba(255, 255, 255, 0.2);
}

.location-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #22c55e;
}

.location-name {
	font-size: 24rpx;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.9);
}

.header-right {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.network-status {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.network-status .status-dot {
	width: 12rpx;
	height: 12rpx;
	background: #22c55e;
}

.status-text {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.6);
}

.runtime {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.runtime-text {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.6);
}

.settings-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12rpx;
}

.camera-container {
	flex: 1;
	padding: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.camera-frame {
	width: 100%;
	flex: 1;
	max-height: 800rpx;
	border-radius: 24rpx;
	overflow: hidden;
	position: relative;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.5);
}

.camera-preview {
	width: 100%;
	height: 100%;
	display: block;
}

.debug-info {
	position: absolute;
	top: 60rpx;
	left: 16rpx;
	right: 16rpx;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(10px);
	border-radius: 8rpx;
	padding: 12rpx;
	z-index: 30;
}

.debug-text {
	font-size: 18rpx;
	color: #22c55e;
	word-break: break-all;
}

.scan-line {
	position: absolute;
	left: 0;
	width: 100%;
	height: 4rpx;
	background: rgba(34, 197, 94, 0.5);
	box-shadow: 0 0 20rpx rgba(34, 197, 94, 0.8);
	z-index: 5;
}

.detection-layer {
	position: absolute;
	inset: 0;
	z-index: 10;
}

.detection-dot {
	position: absolute;
	width: 20rpx;
	height: 20rpx;
	background: #ef4444;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	box-shadow: 0 0 16rpx rgba(239, 68, 68, 0.8);
	transition: all 0.2s ease;
}

.camera-badge {
	position: absolute;
	top: 16rpx;
	left: 16rpx;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(20px);
	border-radius: 12rpx;
	padding: 8rpx 16rpx;
	display: flex;
	align-items: center;
	gap: 12rpx;
	z-index: 20;
}

.badge-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #ef4444;
	animation: pulse 1.5s infinite;
}

@keyframes pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}

.badge-text {
	font-size: 24rpx;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.8);
}

.count-badge {
	position: absolute;
	bottom: 16rpx;
	right: 16rpx;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(20px);
	border-radius: 16rpx;
	padding: 12rpx 24rpx;
	z-index: 20;
}

.count-label {
	display: block;
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.6);
}

.count-value {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	color: #ffffff;
}

.control-area {
	padding: 32rpx;
}

.btn-row {
	display: flex;
	gap: 24rpx;
}

.start-btn {
	flex: 1;
	padding: 24rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	background: #22c55e;
	transition: all 0.3s;
}

.start-btn.stop {
	background: #ef4444;
}

.start-btn text {
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}

.debug-btn {
	padding: 24rpx 32rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.debug-btn text {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.7);
}

.home-indicator {
	width: 268rpx;
	height: 10rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 6rpx;
	margin: 16rpx auto;
}

.screen-off-overlay {
	position: fixed;
	inset: 0;
	background: #000000;
	z-index: 200;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.screen-off-content {
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.breathe-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #22c55e;
	margin-bottom: 48rpx;
	animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
	0%, 100% { opacity: 0.4; }
	50% { opacity: 1; }
}

.off-text {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.3);
	margin-bottom: 16rpx;
}

.off-hint {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.2);
	margin-bottom: 64rpx;
}

.exit-btn {
	padding: 16rpx 48rpx;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.exit-btn text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.5);
}
</style>
