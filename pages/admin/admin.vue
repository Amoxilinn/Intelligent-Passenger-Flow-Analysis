<template>
	<view class="admin-page">
		<view class="safe-top">
			<view class="decorative-circle circle-1"></view>
			<view class="decorative-circle circle-2"></view>
			<view class="decorative-circle circle-3"></view>
		</view>
		
		<view class="top-nav">
			<view class="nav-inner">
				<view class="nav-left">
					<view class="back-btn" @click="goBack">
						<svg-icon type="arrow-left" :size="18" color="#ffffff"></svg-icon>
					</view>
					
					<view class="store-dropdown">
						<view class="store-title" @click="toggleStoreDropdown">
							<text class="store-name">{{ currentStoreName }}</text>
							<svg-icon type="chevron-down" :size="12" color="#ffffff"></svg-icon>
						</view>
						<view v-if="showStoreDropdown" class="dropdown-menu">
							<view 
								v-for="(store, index) in stores" 
								:key="store._id"
								class="dropdown-item"
								@click="selectStore(store)"
							>
								<text>{{ store.name }}</text>
							</view>
							<view class="dropdown-divider" v-if="stores.length > 0"></view>
							<view class="dropdown-item add-store" @click="goToSettings">
								<svg-icon type="plus" :size="14" color="#003366"></svg-icon>
								<text>管理店铺</text>
							</view>
						</view>
					</view>
				</view>
				
				<view class="notification-btn" @click="toggleNotificationPanel">
					<svg-icon type="bell" :size="18" color="rgba(255,255,255,0.8)"></svg-icon>
					<view v-if="hasNotifications" class="notification-dot"></view>
					
					<view v-if="showNotificationPanel" class="notification-panel">
						<view class="panel-header">
							<text class="panel-title">通知中心</text>
							<text class="clear-btn" @click.stop="clearNotifications">全部已读</text>
						</view>
						<view class="notification-list">
							<view class="empty-notification">
								<text>暂无通知</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="stats-grid">
				<view class="stat-item" @click="showDataDetail('today')">
					<text class="stat-label-white">今日到店</text>
					<text class="stat-value-white">{{ todayFlow }}</text>
					<view class="stat-trend-white up" v-if="todayFlow !== '0'">
						<svg-icon type="arrow-up" :size="10" color="#86efac"></svg-icon>
						<text>实时</text>
					</view>
				</view>
				<view class="stat-item">
					<text class="stat-label-white">本周客流</text>
					<text class="stat-value-white">{{ weekFlow }}</text>
					<view class="breath-dot-white"></view>
				</view>
				<view class="stat-item">
					<text class="stat-label-white">高峰时段</text>
					<text class="stat-value-white">{{ peakHour }}</text>
					<text class="peak-count-white">{{ peakCount }}人</text>
				</view>
			</view>
		</view>
		
		<scroll-view scroll-y class="tab-content">
			<view v-if="activeTab === 0" class="tab-panel">
				<view class="chart-card">
					<view class="card-header">
						<text class="card-title">今日客流走势</text>
						<text class="card-subtitle">{{ todayDate }}</text>
					</view>
					<view v-if="showSkeleton" class="skeleton-box">
						<view class="skeleton"></view>
					</view>
					<view v-else-if="hourlyData.length > 0" class="simple-chart">
						<view class="bar-row">
							<view class="bar-column" v-for="(item, index) in hourlyData" :key="index">
								<view class="bar-stick" :style="{ height: item.height + '%' }"></view>
								<text class="bar-label-text">{{ item.label }}</text>
								<text class="bar-value">{{ item.value }}</text>
							</view>
						</view>
					</view>
					<view v-else class="empty-chart">
						<text>暂无今日客流数据</text>
					</view>
				</view>
				
				<view class="two-col-grid">
					<view class="mini-chart-card">
						<text class="mini-title">性别分布</text>
						<view class="gender-chart" v-if="genderStats.male > 0 || genderStats.female > 0">
							<view class="gender-bar male">
								<view class="bar-fill" :style="{ width: genderStats.male + '%' }"></view>
								<view class="bar-label">
									<text class="label-name">男性</text>
									<text class="label-value">{{ genderStats.male }}%</text>
								</view>
							</view>
							<view class="gender-bar female">
								<view class="bar-fill" :style="{ width: genderStats.female + '%' }"></view>
								<view class="bar-label">
									<text class="label-name">女性</text>
									<text class="label-value">{{ genderStats.female }}%</text>
								</view>
							</view>
						</view>
						<view class="empty-chart-mini" v-else>
							<text>暂无数据</text>
						</view>
					</view>
					<view class="mini-chart-card">
						<text class="mini-title">年龄分布</text>
						<view class="age-chart" v-if="hasAgeData">
							<view class="age-item">
								<view class="age-bar" :style="{ height: Math.max(10, ageStats['18-25']) + '%', background: '#3b82f6;' }"></view>
								<text class="age-label">18-25</text>
								<text class="age-percent">{{ ageStats['18-25'] }}%</text>
							</view>
							<view class="age-item">
								<view class="age-bar" :style="{ height: Math.max(10, ageStats['26-35']) + '%', background: '#22c55e;' }"></view>
								<text class="age-label">26-35</text>
								<text class="age-percent">{{ ageStats['26-35'] }}%</text>
							</view>
							<view class="age-item">
								<view class="age-bar" :style="{ height: Math.max(10, ageStats['36-45']) + '%', background: '#f59e0b;' }"></view>
								<text class="age-label">36-45</text>
								<text class="age-percent">{{ ageStats['36-45'] }}%</text>
							</view>
							<view class="age-item">
								<view class="age-bar" :style="{ height: Math.max(10, ageStats['45+']) + '%', background: '#6b7280;' }"></view>
								<text class="age-label">45+</text>
								<text class="age-percent">{{ ageStats['45+'] }}%</text>
							</view>
						</view>
						<view class="empty-chart-mini" v-else>
							<text>暂无数据</text>
						</view>
					</view>
				</view>
				
				<view class="activity-card">
					<view class="card-header">
						<text class="card-title">实时动态</text>
						<text class="refresh-btn" @click="loadDashboardData">刷新</text>
					</view>
					<view class="activity-list" v-if="activityList.length > 0">
						<view v-for="(activity, index) in activityList" :key="index" class="activity-item">
							<view :class="['activity-dot', activity.type]"></view>
							<view class="activity-content">
								<text class="activity-text">{{ activity.text }}</text>
								<text class="activity-time">{{ activity.time }}</text>
							</view>
						</view>
					</view>
					<view class="empty-activity" v-else>
						<text>暂无客流记录</text>
					</view>
				</view>
				
				<view class="bottom-space"></view>
			</view>
			
			<view v-if="activeTab === 1" class="tab-panel">
				<view class="calendar-card">
					<text class="card-title">选择日期</text>
					<view class="weekdays">
						<text v-for="day in weekDays" :key="day" class="weekday">{{ day }}</text>
					</view>
					<view class="calendar-grid">
						<view 
							v-for="(day, index) in calendarDays" 
							:key="index"
							:class="['calendar-day', selectedDate === day ? 'active' : '']"
							@click="selectDate(day)"
						>
							<text>{{ day }}</text>
						</view>
					</view>
				</view>
				
				<view class="compare-card">
					<view class="card-header">
						<text class="card-title">近7日客流趋势</text>
					</view>
					<view v-if="weekData.length > 0" class="compare-chart">
						<view class="simple-chart">
							<view class="bar-row">
								<view class="bar-column" v-for="(item, index) in weekData" :key="index">
									<view class="bar-stick-this" :style="{ height: Math.max(10, (item.value / maxWeekValue) * 100) + '%' }"></view>
									<text class="bar-label-text">{{ item.label }}</text>
									<text class="bar-value">{{ item.value }}</text>
								</view>
							</view>
							<view class="chart-legend">
								<view class="legend-item">
									<view class="legend-dot this-week"></view>
									<text class="legend-text">客流量</text>
								</view>
							</view>
						</view>
					</view>
					<view v-else class="empty-chart">
						<text>暂无历史数据</text>
					</view>
				</view>
				
				<view class="export-card">
					<view class="export-btn" @click="exportData">
						<svg-icon type="download" :size="14" color="#ffffff"></svg-icon>
						<text>导出报表</text>
					</view>
				</view>
				
				<view class="bottom-space"></view>
			</view>
			
			<view v-if="activeTab === 2" class="tab-panel">
				<view class="profile-card" @click="openAccountModal">
					<view class="avatar">
						<text class="avatar-text">{{ userInitial }}</text>
					</view>
					<view class="profile-info">
						<view class="profile-header">
							<text class="user-name">{{ userInfo.phone || '用户' }}</text>
						</view>
						<text class="user-id">ID: {{ userInfo._id || '-' }}</text>
						<text class="edit-hint">点击编辑个人资料</text>
					</view>
					<svg-icon type="chevron-right" :size="16" color="#d1d5db"></svg-icon>
				</view>
				
				<view class="settings-card">
					<text class="card-title">预警设置</text>
					<view class="setting-item">
						<text class="setting-label">店内人数上限预警</text>
						<view class="setting-input-wrapper">
							<input type="number" class="setting-input" value="100" />
							<text class="setting-unit">人</text>
						</view>
					</view>
					<view class="setting-item">
						<text class="setting-label">设备离线通知</text>
						<view class="toggle-wrapper" @click="toggleDeviceNotify">
							<view class="custom-checkbox" :class="{ 'checked': deviceOfflineNotify }">
								<text v-if="deviceOfflineNotify" class="check-mark">✓</text>
							</view>
						</view>
					</view>
				</view>
				
				<view class="device-card">
					<text class="card-title">当前店铺</text>
					<view class="device-list">
						<view class="device-item">
							<view class="device-icon">
								<svg-icon type="store" :size="16" color="#22c55e"></svg-icon>
							</view>
							<view class="device-info">
								<text class="device-name">{{ currentStoreName }}</text>
								<text class="device-model">{{ currentStore?.address || '暂无地址' }}</text>
							</view>
							<text class="device-status online">当前</text>
						</view>
					</view>
				</view>
				
				<view class="action-card">
					<view class="action-btn switch-mode" @click="switchMode">
						<svg-icon type="exchange-alt" :size="14" color="#ffffff"></svg-icon>
						<text>切换至采集端</text>
					</view>
					<view class="action-btn logout" @click="logout">
						<svg-icon type="sign-out" :size="14" color="#ef4444"></svg-icon>
						<text>退出登录</text>
					</view>
				</view>
				
				<view class="bottom-space"></view>
			</view>
		</scroll-view>
		
		<view class="bottom-tab-bar">
			<view 
				v-for="(tab, index) in bottomTabs" 
				:key="index"
				:class="['tab-item', activeTab === index ? 'active' : '']"
				@click="switchTab(index)"
			>
				<svg-icon :type="tab.icon" :size="20" :color="activeTab === index ? '#003366' : '#9ca3af'"></svg-icon>
				<text class="tab-label">{{ tab.label }}</text>
			</view>
		</view>
		<view class="safe-bottom"></view>
		
		<view v-if="showDataDetailModal" class="modal-overlay" @click.self="closeDataDetail">
			<view class="modal-content">
				<view class="modal-header">
					<view class="modal-title-wrapper">
						<text class="modal-title">今日客流详情</text>
						<text class="modal-subtitle">{{ todayDate }}</text>
					</view>
					<view class="modal-close" @click="closeDataDetail">
						<svg-icon type="times" :size="18" color="rgba(255,255,255,0.8)"></svg-icon>
					</view>
				</view>
				<view class="modal-body">
					<view class="detail-list" v-if="hourlyData.length > 0">
						<view class="detail-item" v-for="(item, index) in hourlyData" :key="index">
							<text class="detail-time">{{ item.label }}</text>
							<text class="detail-count">{{ item.value }} 人</text>
						</view>
					</view>
					<view class="empty-detail" v-else>
						<text>暂无数据</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'
const customerObj = uniCloud.importObject('CustomerInfor')

export default {
	components: { SvgIcon },
	data() {
		return {
			userInfo: {},
			currentStore: null,
			currentStoreName: '我的店铺',
			stores: [],
			showStoreDropdown: false,
			showNotificationPanel: false,
			showDataDetailModal: false,
			hasNotifications: false,
			todayFlow: '0',
			weekFlow: '0',
			peakHour: '-',
			peakCount: 0,
			activeTab: 0,
			showSkeleton: true,
			hourlyData: [],
			activityList: [],
			genderStats: { male: 0, female: 0 },
			ageStats: { '18-25': 0, '26-35': 0, '36-45': 0, '45+': 0 },
			weekData: [],
			selectedDate: new Date().getDate(),
			calendarDays: [],
			weekDays: ['日', '一', '二', '三', '四', '五', '六'],
			deviceOfflineNotify: true,
			bottomTabs: [
				{ label: '看板', icon: 'pie-chart' },
				{ label: '历史', icon: 'history' },
				{ label: '设置', icon: 'cog' }
			]
		}
	},
	computed: {
		userInitial() {
			return (this.userInfo.phone || 'U').substring(0, 1).toUpperCase()
		},
		todayDate() {
			const now = new Date()
			return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
		},
		hasAgeData() {
			return this.ageStats['18-25'] > 0 || this.ageStats['26-35'] > 0 || this.ageStats['36-45'] > 0 || this.ageStats['45+'] > 0
		},
		maxWeekValue() {
			if (this.weekData.length === 0) return 1
			return Math.max(...this.weekData.map(item => item.value), 1)
		}
	},
	onLoad() {
		this.loadUserInfo()
		this.initCalendar()
	},
	onShow() {
		this.loadUserInfo()
		if (this.userInfo.token) {
			this.loadDashboardData()
			this.loadHistoryData()
		}
	},
	methods: {
		loadUserInfo() {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userInfo = userInfo
				this.stores = userInfo.stores || []
				this.currentStore = userInfo.currentStore
				if (this.currentStore) {
					this.currentStoreName = this.currentStore.name
				} else if (this.stores.length > 0) {
					this.currentStore = this.stores[0]
					this.currentStoreName = this.stores[0].name
				}
			}
		},
		async loadDashboardData() {
			if (!this.userInfo.token) return
			
			this.showSkeleton = true
			try {
				const result = await customerObj.getDashboardData({
					token: this.userInfo.token,
					storeId: this.currentStore?._id
				})
				
				if (result.errCode === 0) {
					const data = result.data
					this.todayFlow = data.todayTotal.toString()
					this.hourlyData = data.hourlyData
					this.genderStats = data.genderStats
					this.ageStats = data.ageStats
					this.activityList = data.activityList
					
					if (this.hourlyData.length > 0) {
						const peakItem = this.hourlyData.reduce((max, item) => item.value > max.value ? item : max, this.hourlyData[0])
						this.peakHour = peakItem.label
						this.peakCount = peakItem.value
					}
				} else if (result.errCode === 'TOKEN_MISSING' || result.errCode === 'TOKEN_ERROR') {
					uni.showToast({ title: '请重新登录', icon: 'none' })
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/login/login' })
					}, 1500)
				}
			} catch (error) {
				console.error('加载看板数据失败:', error)
			} finally {
				this.showSkeleton = false
			}
		},
		async loadHistoryData() {
			if (!this.userInfo.token) return
			
			try {
				const result = await customerObj.getHistoryData({
					token: this.userInfo.token,
					storeId: this.currentStore?._id
				})
				
				if (result.errCode === 0) {
					this.weekData = result.data.weekData
					this.weekFlow = this.weekData.reduce((sum, item) => sum + item.value, 0).toString()
				}
			} catch (error) {
				console.error('加载历史数据失败:', error)
			}
		},
		goBack() {
			uni.navigateBack()
		},
		goToSettings() {
			this.showStoreDropdown = false
			uni.navigateTo({ url: '/pages/settings/settings' })
		},
		toggleStoreDropdown() {
			this.showStoreDropdown = !this.showStoreDropdown
			this.showNotificationPanel = false
		},
		selectStore(store) {
			this.currentStore = store
			this.currentStoreName = store.name
			this.showStoreDropdown = false
			let userInfo = uni.getStorageSync('userInfo') || {}
			userInfo.currentStore = store
			uni.setStorageSync('userInfo', userInfo)
			this.userInfo = userInfo
			this.loadDashboardData()
			this.loadHistoryData()
		},
		toggleNotificationPanel() {
			this.showNotificationPanel = !this.showNotificationPanel
			this.showStoreDropdown = false
		},
		clearNotifications() {
			this.hasNotifications = false
			this.showNotificationPanel = false
		},
		showDataDetail(type) {
			this.showDataDetailModal = true
		},
		closeDataDetail() {
			this.showDataDetailModal = false
		},
		switchTab(index) {
			this.activeTab = index
		},
		initCalendar() {
			this.calendarDays = []
			const now = new Date()
			const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
			for (let i = 1; i <= daysInMonth; i++) {
				this.calendarDays.push(i)
			}
			this.selectedDate = now.getDate()
		},
		selectDate(day) {
			this.selectedDate = day
		},
		exportData() {
			uni.showToast({ title: '导出功能开发中', icon: 'none' })
		},
		openAccountModal() {
			uni.showToast({ title: '编辑资料功能开发中', icon: 'none' })
		},
		toggleDeviceNotify() {
			this.deviceOfflineNotify = !this.deviceOfflineNotify
		},
		switchMode() {
			uni.navigateTo({ url: '/pages/collector/collector' })
		},
		logout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('userInfo')
						uni.reLaunch({ url: '/pages/login/login' })
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.admin-page {
	min-height: 100vh;
	background: #F4F6F8;
	display: flex;
	flex-direction: column;
	position: relative;
	border: none;
}

.safe-top {
	height: calc(var(--status-bar-height, 44px) + 80px);
	background: #003366;
	position: relative;
	overflow: hidden;
}

.decorative-circle {
	position: absolute;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.08);
}

.circle-1 {
	width: 200rpx;
	height: 200rpx;
	top: -60rpx;
	right: -40rpx;
}

.circle-2 {
	width: 120rpx;
	height: 120rpx;
	top: 20rpx;
	right: 100rpx;
}

.circle-3 {
	width: 80rpx;
	height: 80rpx;
	bottom: -20rpx;
	left: 40rpx;
}

.safe-bottom {
	height: env(safe-area-inset-bottom);
	background: #ffffff;
}

.top-nav {
	background: #003366;
	padding: 0 24rpx 24rpx;
}

.nav-inner {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.nav-left {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.back-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 50%;
}

.store-dropdown {
	position: relative;
}

.store-title {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 24rpx;
}

.store-name {
	font-size: 28rpx;
	color: #ffffff;
	font-weight: 500;
}

.dropdown-menu {
	position: absolute;
	top: 100%;
	left: 0;
	margin-top: 12rpx;
	background: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
	min-width: 240rpx;
	overflow: hidden;
	z-index: 100;
}

.dropdown-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 24rpx 32rpx;
	font-size: 26rpx;
	color: #1f2937;
}

.dropdown-item:active {
	background: #f3f4f6;
}

.dropdown-divider {
	height: 1rpx;
	background: #e5e7eb;
}

.add-store {
	color: #003366;
	font-weight: 500;
}

.notification-btn {
	position: relative;
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 50%;
}

.notification-dot {
	position: absolute;
	top: 12rpx;
	right: 12rpx;
	width: 16rpx;
	height: 16rpx;
	background: #ef4444;
	border-radius: 50%;
	border: 2rpx solid #003366;
}

.notification-panel {
	position: absolute;
	top: 100%;
	right: 0;
	margin-top: 12rpx;
	width: 400rpx;
	background: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
	overflow: hidden;
	z-index: 100;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #e5e7eb;
}

.panel-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1f2937;
}

.clear-btn {
	font-size: 24rpx;
	color: #003366;
}

.notification-list {
	max-height: 400rpx;
	overflow-y: auto;
}

.empty-notification {
	padding: 48rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 26rpx;
}

.notification-item {
	display: flex;
	gap: 20rpx;
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #f3f4f6;
}

.notification-item:last-child {
	border-bottom: none;
}

.item-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	margin-top: 8rpx;
	flex-shrink: 0;
}

.item-dot.red {
	background: #ef4444;
}

.item-dot.amber {
	background: #f59e0b;
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.item-title {
	font-size: 26rpx;
	font-weight: 500;
	color: #1f2937;
}

.item-desc {
	font-size: 24rpx;
	color: #6b7280;
}

.item-time {
	font-size: 22rpx;
	color: #9ca3af;
}

.stats-grid {
	display: flex;
	gap: 16rpx;
}

.stat-item {
	flex: 1;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 16rpx;
	padding: 20rpx 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.stat-label-white {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.7);
}

.stat-value-white {
	font-size: 36rpx;
	font-weight: bold;
	color: #ffffff;
}

.stat-trend-white {
	display: flex;
	align-items: center;
	gap: 4rpx;
	font-size: 20rpx;
}

.stat-trend-white.up {
	color: #86efac;
}

.stat-trend-white.down {
	color: #fca5a5;
}

.breath-dot-white {
	width: 12rpx;
	height: 12rpx;
	background: #22c55e;
	border-radius: 50%;
	animation: breath 2s ease-in-out infinite;
}

@keyframes breath {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.4; }
}

.peak-count-white {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.6);
}

.tab-content {
	flex: 1;
	padding: 24rpx;
	padding-bottom: 160rpx;
	box-sizing: border-box;
	width: 100%;
}

.tab-panel {
	
}

.chart-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1f2937;
}

.card-subtitle {
	font-size: 24rpx;
	color: #9ca3af;
}

.refresh-btn {
	font-size: 24rpx;
	color: #003366;
	padding: 8rpx 16rpx;
	background: rgba(0, 51, 102, 0.1);
	border-radius: 12rpx;
}

.skeleton-box {
	padding: 48rpx 0;
}

.skeleton {
	height: 200rpx;
	background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 12rpx;
}

@keyframes shimmer {
	0% { background-position: 200% 0; }
	100% { background-position: -200% 0; }
}

.simple-chart {
	padding: 16rpx 0;
	width: 100%;
	box-sizing: border-box;
	overflow: hidden;
}

.bar-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	height: 240rpx;
	padding: 0 8rpx;
}

.bar-column {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	height: 100%;
}

.bar-stick {
	width: 32rpx;
	background: linear-gradient(180deg, #003366 0%, #004d99 100%);
	border-radius: 8rpx 8rpx 0 0;
	min-height: 10%;
	transition: height 0.3s ease;
}

.bar-label-text {
	font-size: 20rpx;
	color: #6b7280;
	margin-top: 12rpx;
}

.bar-value {
	font-size: 18rpx;
	color: #9ca3af;
	margin-top: 4rpx;
}

.empty-chart {
	padding: 48rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 26rpx;
}

.empty-chart-mini {
	padding: 32rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 24rpx;
}

.two-col-grid {
	display: flex;
	gap: 16rpx;
	margin-bottom: 24rpx;
}

.mini-chart-card {
	flex: 1;
	background: #ffffff;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.mini-title {
	font-size: 26rpx;
	font-weight: 500;
	color: #1f2937;
	margin-bottom: 20rpx;
	display: block;
}

.gender-chart {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.gender-bar {
	position: relative;
	height: 48rpx;
	background: #f3f4f6;
	border-radius: 8rpx;
	overflow: hidden;
}

.gender-bar.male .bar-fill {
	background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.gender-bar.female .bar-fill {
	background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%);
}

.bar-fill {
	height: 100%;
	border-radius: 8rpx;
	transition: width 0.3s ease;
}

.bar-label {
	position: absolute;
	inset: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 16rpx;
}

.label-name {
	font-size: 22rpx;
	color: #1f2937;
	font-weight: 500;
}

.label-value {
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 600;
}

.age-chart {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	height: 160rpx;
	padding: 0 8rpx;
}

.age-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	height: 100%;
}

.age-bar {
	width: 40rpx;
	border-radius: 6rpx 6rpx 0 0;
	min-height: 10%;
	transition: height 0.3s ease;
}

.age-label {
	font-size: 18rpx;
	color: #6b7280;
	margin-top: 8rpx;
}

.age-percent {
	font-size: 16rpx;
	color: #9ca3af;
	margin-top: 2rpx;
}

.activity-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.activity-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.activity-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 16rpx;
	background: #f9fafb;
	border-radius: 12rpx;
}

.activity-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.activity-dot.in {
	background: #22c55e;
}

.activity-dot.out {
	background: #ef4444;
}

.activity-content {
	flex: 1;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.activity-text {
	font-size: 26rpx;
	color: #1f2937;
}

.activity-time {
	font-size: 22rpx;
	color: #9ca3af;
}

.empty-activity {
	padding: 32rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 26rpx;
}

.bottom-space {
	height: 40rpx;
}

.calendar-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.weekdays {
	display: flex;
	justify-content: space-between;
	margin-bottom: 16rpx;
	padding: 0 8rpx;
}

.weekday {
	flex: 1;
	text-align: center;
	font-size: 22rpx;
	color: #9ca3af;
}

.calendar-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.calendar-day {
	width: calc((100% - 48rpx) / 7);
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #1f2937;
	border-radius: 12rpx;
}

.calendar-day:active {
	background: #f3f4f6;
}

.calendar-day.active {
	background: #003366;
	color: #ffffff;
	font-weight: 600;
}

.compare-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.compare-chart {
	margin-top: 16rpx;
}

.bar-pair-compare {
	display: flex;
	gap: 8rpx;
	align-items: flex-end;
	height: 100%;
}

.bar-stick-this {
	width: 24rpx;
	background: linear-gradient(180deg, #003366 0%, #004d99 100%);
	border-radius: 6rpx 6rpx 0 0;
	min-height: 10%;
}

.bar-stick-last {
	width: 24rpx;
	background: linear-gradient(180deg, #9ca3af 0%, #d1d5db 100%);
	border-radius: 6rpx 6rpx 0 0;
	min-height: 10%;
}

.chart-legend {
	display: flex;
	justify-content: center;
	gap: 32rpx;
	margin-top: 24rpx;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.legend-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 4rpx;
}

.legend-dot.this-week {
	background: #003366;
}

.legend-dot.last-week {
	background: #9ca3af;
}

.legend-text {
	font-size: 22rpx;
	color: #6b7280;
}

.export-card {
	margin-bottom: 24rpx;
}

.export-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 28rpx;
	background: linear-gradient(135deg, #003366 0%, #004d99 100%);
	border-radius: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 51, 102, 0.3);
}

.export-btn text {
	font-size: 28rpx;
	color: #ffffff;
	font-weight: 500;
}

.profile-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 32rpx;
	background: #ffffff;
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.avatar {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #003366 0%, #004d99 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #ffffff;
}

.profile-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.profile-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.user-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #1f2937;
}

.vip-badge {
	padding: 4rpx 12rpx;
	background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
	border-radius: 8rpx;
	font-size: 18rpx;
	color: #ffffff;
	font-weight: 600;
}

.user-id {
	font-size: 24rpx;
	color: #6b7280;
}

.edit-hint {
	font-size: 22rpx;
	color: #9ca3af;
}

.settings-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f3f4f6;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-label {
	font-size: 28rpx;
	color: #1f2937;
}

.setting-input-wrapper {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.setting-input {
	width: 120rpx;
	padding: 12rpx 16rpx;
	background: #f9fafb;
	border: 1rpx solid #e5e7eb;
	border-radius: 12rpx;
	font-size: 26rpx;
	text-align: center;
}

.setting-unit {
	font-size: 24rpx;
	color: #6b7280;
}

.toggle-wrapper {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.custom-checkbox {
	width: 48rpx;
	height: 48rpx;
	border: 2rpx solid #d1d5db;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.custom-checkbox.checked {
	background: #003366;
	border-color: #003366;
}

.check-mark {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: bold;
}

.toggle-label {
	font-size: 26rpx;
	color: #6b7280;
}

.device-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	width: 100%;
}

.device-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.device-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx;
	background: #f9fafb;
	border-radius: 16rpx;
}

.device-icon {
	width: 64rpx;
	height: 64rpx;
	background: rgba(34, 197, 94, 0.1);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.device-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.device-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #1f2937;
}

.device-model {
	font-size: 24rpx;
	color: #6b7280;
}

.device-status {
	font-size: 24rpx;
	font-weight: 500;
	padding: 8rpx 16rpx;
	border-radius: 12rpx;
}

.device-status.online {
	background: rgba(34, 197, 94, 0.1);
	color: #22c55e;
}

.device-status.offline {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
}

.action-card {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 28rpx;
	border-radius: 24rpx;
}

.action-btn.switch-mode {
	background: linear-gradient(135deg, #003366 0%, #004d99 100%);
	box-shadow: 0 4rpx 16rpx rgba(0, 51, 102, 0.3);
}

.action-btn.switch-mode text {
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 500;
}

.action-btn.logout {
	background: #ffffff;
	border: 2rpx solid #fecaca;
}

.action-btn.logout text {
	color: #ef4444;
	font-size: 28rpx;
	font-weight: 500;
}

.bottom-tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	background: #ffffff;
	border-top: 1rpx solid #e5e7eb;
	padding-bottom: env(safe-area-inset-bottom);
	z-index: 50;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16rpx 0;
	gap: 4rpx;
}

.tab-label {
	font-size: 22rpx;
	color: #9ca3af;
}

.tab-item.active .tab-label {
	color: #003366;
	font-weight: 500;
}

.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	width: 85%;
	max-width: 600rpx;
	background: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx;
	background: linear-gradient(135deg, #003366 0%, #004d99 100%);
}

.modal-title-wrapper {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}

.modal-subtitle {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
}

.modal-close {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 50%;
}

.modal-body {
	padding: 32rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.detail-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 24rpx;
	background: #f9fafb;
	border-radius: 12rpx;
}

.detail-item.peak {
	background: rgba(34, 197, 94, 0.1);
}

.detail-time {
	font-size: 26rpx;
	color: #1f2937;
}

.detail-count {
	font-size: 26rpx;
	font-weight: 600;
	color: #003366;
}

.empty-detail {
	padding: 48rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 26rpx;
}
</style>
