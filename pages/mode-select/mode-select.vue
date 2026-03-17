<template>
	<view class="mode-page">
		<view class="safe-top"></view>
		<view class="bg-gradient">
			<view class="bg-circle bg-circle-1"></view>
			<view class="bg-circle bg-circle-2"></view>
		</view>
		
		<view class="content-wrapper">
			<view class="nav-bar">
				<view class="back-btn" @click="goBack">
					<svg-icon type="arrow-left" :size="16" color="#ffffff"></svg-icon>
				</view>
			</view>
			
			<view class="header">
				<view class="logo-box">
					<svg-icon type="chart-line" :size="48" color="#ffffff"></svg-icon>
				</view>
				<text class="title">智能客流分析</text>
				<text class="subtitle">请选择您的使用角色</text>
			</view>
			
			<view class="mode-list">
				<view class="mode-card" @click="selectMode('collector')">
					<view class="mode-icon collector">
						<svg-icon type="video" :size="32" color="#22c55e"></svg-icon>
					</view>
					<view class="mode-info">
						<text class="mode-title">采集端</text>
						<text class="mode-desc">放置在店铺入口采集数据</text>
					</view>
					<svg-icon type="chevron-right" :size="16" color="rgba(255,255,255,0.4)"></svg-icon>
				</view>
				
				<view class="mode-card" @click="selectMode('admin')">
					<view class="mode-icon admin">
						<svg-icon type="desktop" :size="32" color="#22d3ee"></svg-icon>
					</view>
					<view class="mode-info">
						<text class="mode-title">管理端</text>
						<text class="mode-desc">查看数据分析管理运营</text>
					</view>
					<svg-icon type="chevron-right" :size="16" color="rgba(255,255,255,0.4)"></svg-icon>
				</view>
			</view>
			
			<text class="version">版本 1.0.0</text>
		</view>
	</view>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'

export default {
	components: { SvgIcon },
	data() {
		return {}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		selectMode(mode) {
			if (mode === 'collector') {
				uni.navigateTo({ url: '/pages/collector/collector' })
			} else {
				uni.navigateTo({ url: '/pages/admin/admin' })
			}
		}
	}
}
</script>

<style scoped>
.mode-page {
	min-height: 100vh;
	position: relative;
	overflow: hidden;
}

.safe-top {
	height: calc(var(--status-bar-height, 44px) + 80px);
	background: linear-gradient(135deg, #003366 0%, #004d99 50%, #0066cc 100%);
}

.bg-gradient {
	position: absolute;
	inset: 0;
	background: linear-gradient(135deg, #003366 0%, #004d99 50%, #0066cc 100%);
}

.bg-circle {
	position: absolute;
	border-radius: 50%;
	opacity: 0.2;
}

.bg-circle-1 {
	width: 320rpx;
	height: 320rpx;
	top: 160rpx;
	left: 80rpx;
	background: #ffffff;
	filter: blur(80rpx);
}

.bg-circle-2 {
	width: 480rpx;
	height: 480rpx;
	bottom: 160rpx;
	right: 80rpx;
	background: #22d3ee;
	filter: blur(100rpx);
}

.content-wrapper {
	position: relative;
	z-index: 10;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	padding: 176rpx 48rpx 64rpx;
}

.nav-bar {
	height: 80rpx;
	display: flex;
	align-items: center;
	margin-bottom: 32rpx;
}

.back-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.header {
	text-align: center;
	margin-bottom: 64rpx;
}

.logo-box {
	width: 128rpx;
	height: 128rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(20px);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
}

.title {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 16rpx;
}

.subtitle {
	display: block;
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.7);
}

.mode-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.mode-card {
	display: flex;
	align-items: center;
	padding: 32rpx;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	transition: all 0.3s;
}

.mode-card:active {
	background: rgba(255, 255, 255, 0.2);
	transform: scale(0.98);
}

.mode-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
}

.mode-icon.collector {
	background: rgba(34, 197, 94, 0.2);
}

.mode-icon.admin {
	background: rgba(34, 211, 238, 0.2);
}

.mode-info {
	flex: 1;
}

.mode-title {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
	margin-bottom: 8rpx;
}

.mode-desc {
	display: block;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.6);
}

.version {
	text-align: center;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.3);
	margin-top: auto;
	padding-top: 32rpx;
}
</style>
