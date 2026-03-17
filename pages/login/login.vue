<template>
	<view class="login-page">
		<view class="safe-top"></view>
		<view class="bg-gradient">
			<view class="bg-circle bg-circle-1"></view>
			<view class="bg-circle bg-circle-2"></view>
		</view>
		
		<view class="content-wrapper">
			<view class="header">
				<view class="logo-box">
					<svg-icon type="chart-line" :size="48" color="#ffffff"></svg-icon>
				</view>
				<text class="title">智能客流分析</text>
				<text class="subtitle">AI驱动的商业洞察平台</text>
			</view>
			
			<view class="form-card">
				<view class="tab-wrapper">
					<view :class="['tab-item', activeTab === 'login' ? 'active' : '']" @click="switchTab('login')">
						<text>登录</text>
					</view>
					<view :class="['tab-item', activeTab === 'register' ? 'active' : '']" @click="switchTab('register')">
						<text>注册</text>
					</view>
				</view>
				
				<view v-if="activeTab === 'login'" class="form-content">
					<view class="input-group">
						<svg-icon type="phone" :size="16" color="rgba(255,255,255,0.4)"></svg-icon>
						<input type="number" v-model="loginForm.phone" placeholder="请输入手机号" maxlength="11" class="input-field" />
					</view>
					<view class="input-group">
						<svg-icon type="lock" :size="16" color="rgba(255,255,255,0.4)"></svg-icon>
						<input type="password" v-model="loginForm.password" placeholder="请输入密码" class="input-field" />
					</view>
					<view class="forgot-wrapper">
						<text class="forgot-text" @click="handleForgotPassword">忘记密码?</text>
					</view>
					<view class="btn-primary" @click="handleLogin">
						<text>登录</text>
					</view>
					
					<view class="divider">
						<view class="divider-line"></view>
						<text class="divider-text">其他方式</text>
						<view class="divider-line"></view>
					</view>
					
					<view class="social-login">
						<view class="social-btn wechat" @click="handleWechatLogin">
							<svg-icon type="weixin" :size="24" color="#22c55e"></svg-icon>
						</view>
					</view>
				</view>
				
				<view v-else class="form-content">
					<view class="input-group">
						<svg-icon type="phone" :size="16" color="rgba(255,255,255,0.4)"></svg-icon>
						<input type="number" v-model="registerForm.phone" placeholder="请输入手机号" maxlength="11" class="input-field" />
					</view>
					<view class="input-group">
						<svg-icon type="shield" :size="16" color="rgba(255,255,255,0.4)"></svg-icon>
						<input type="number" v-model="registerForm.code" placeholder="验证码" maxlength="6" class="input-field" />
						<view class="code-btn" @click="sendCode">
							<text>{{ codeBtnText }}</text>
						</view>
					</view>
					<view class="input-group">
						<svg-icon type="lock" :size="16" color="rgba(255,255,255,0.4)"></svg-icon>
						<input type="password" v-model="registerForm.password" placeholder="设置密码（至少6位）" class="input-field" />
					</view>
					<view class="btn-primary" @click="handleRegister">
						<text>注册</text>
					</view>
				</view>
			</view>
			
			<text class="copyright">© 2024 版权所有</text>
		</view>
	</view>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'
const userInfro = uniCloud.importObject('userInfro')

export default {
	components: { SvgIcon },
	data() {
		return {
			activeTab: 'login',
			loginForm: {
				phone: '',
				password: ''
			},
			registerForm: {
				phone: '',
				code: '',
				password: ''
			},
			codeBtnText: '获取',
			countdown: 0,
			timer: null
		}
	},
	methods: {
		switchTab(tab) {
			this.activeTab = tab
		},
		async handleLogin() {
			if (!this.loginForm.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' })
				return
			}
			if (!/^1[3-9]\d{9}$/.test(this.loginForm.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
				return
			}
			if (!this.loginForm.password) {
				uni.showToast({ title: '请输入密码', icon: 'none' })
				return
			}
			
			uni.showLoading({ title: '登录中...' })
			
			try {
				console.log('开始登录验证...')
				const result = await userInfro.login({
					phone: this.loginForm.phone,
					password: this.loginForm.password
				})
				
				console.log('登录结果:', result)
				
				if (result.errCode === 0) {
					uni.setStorageSync('userInfo', result.data)
					uni.hideLoading()
					uni.showToast({ title: '登录成功', icon: 'success' })
					setTimeout(() => {
						uni.navigateTo({ url: '/pages/mode-select/mode-select' })
					}, 500)
				} else {
					uni.hideLoading()
					uni.showToast({ title: result.errMsg, icon: 'none' })
				}
			} catch (error) {
				console.error('登录失败:', error)
				uni.hideLoading()
				uni.showToast({ title: '登录失败，请稍后重试', icon: 'none' })
			}
		},
		async handleRegister() {
			if (!this.registerForm.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' })
				return
			}
			if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
				return
			}
			if (!this.registerForm.code) {
				uni.showToast({ title: '请输入验证码', icon: 'none' })
				return
			}
			if (!this.registerForm.password) {
				uni.showToast({ title: '请设置密码', icon: 'none' })
				return
			}
			if (this.registerForm.password.length < 6) {
				uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
				return
			}
			
			if (this.registerForm.code !== '1111') {
				uni.showToast({ title: '验证码错误', icon: 'none' })
				return
			}
			
			uni.showLoading({ title: '注册中...' })
			
			try {
				console.log('开始调用云对象注册...')
				const result = await userInfro.register({
					phone: this.registerForm.phone,
					password: this.registerForm.password
				})
				
				console.log('云对象调用结果:', result)
				
				if (result.errCode === 0) {
					uni.hideLoading()
					uni.showToast({ title: '注册成功', icon: 'success' })
					this.switchTab('login')
					this.loginForm.phone = this.registerForm.phone
					this.registerForm = { phone: '', code: '', password: '' }
				} else {
					uni.hideLoading()
					uni.showToast({ title: result.errMsg, icon: 'none' })
				}
			} catch (error) {
				console.error('注册失败:', error)
				uni.hideLoading()
				uni.showToast({ title: '注册失败，请稍后重试', icon: 'none' })
			}
		},
		handleForgotPassword() {
			uni.showToast({ title: '请联系管理员重置密码', icon: 'none' })
		},
		handleWechatLogin() {
			uni.showToast({ title: '微信登录', icon: 'none' })
		},
		sendCode() {
			if (this.countdown > 0) return
			if (!this.registerForm.phone) {
				uni.showToast({ title: '请输入手机号', icon: 'none' })
				return
			}
			if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
				uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
				return
			}
			this.countdown = 60
			this.timer = setInterval(() => {
				this.countdown--
				this.codeBtnText = `${this.countdown}s`
				if (this.countdown <= 0) {
					clearInterval(this.timer)
					this.codeBtnText = '获取'
				}
			}, 1000)
			uni.showToast({ title: '验证码已发送（测试用：1111）', icon: 'none' })
		}
	},
	onUnload() {
		if (this.timer) {
			clearInterval(this.timer)
		}
	}
}
</script>

<style scoped>
.login-page {
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
	background: rgba(255, 255, 255, 0.1);
}

.bg-circle-1 {
	width: 500rpx;
	height: 500rpx;
	top: -200rpx;
	left: -200rpx;
	filter: blur(60rpx);
}

.bg-circle-2 {
	width: 600rpx;
	height: 600rpx;
	bottom: -300rpx;
	right: -200rpx;
	background: rgba(34, 211, 238, 0.1);
	filter: blur(80rpx);
}

.content-wrapper {
	position: relative;
	z-index: 10;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	padding: 180rpx 48rpx 64rpx;
}

.header {
	text-align: center;
	margin-bottom: 64rpx;
	margin-top: 32rpx;
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
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.title {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 8rpx;
}

.subtitle {
	display: block;
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.6);
}

.form-card {
	background: rgba(255, 255, 255, 0.15);
	backdrop-filter: blur(30px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.15);
}

.tab-wrapper {
	display: flex;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 16rpx;
	padding: 8rpx;
	margin-bottom: 48rpx;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	border-radius: 12rpx;
	font-size: 24rpx;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
	transition: all 0.3s;
}

.tab-item:active {
	background: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
	background: #ffffff;
	color: #003366;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.form-content {
	
}

.input-group {
	position: relative;
	margin-bottom: 24rpx;
	display: flex;
	align-items: center;
	padding: 0 24rpx;
	background: rgba(255, 255, 255, 0.15);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.25);
	border-radius: 16rpx;
	transition: all 0.3s ease;
}

.input-group:focus-within {
	border-color: rgba(255, 255, 255, 0.5);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.input-field {
	flex: 1;
	padding: 20rpx 0;
	font-size: 26rpx;
	color: #1f2937;
	height: auto;
	line-height: 1.4;
	font-weight: 500;
}

.input-field::placeholder {
	color: rgba(31, 41, 55, 0.6);
}

.code-btn {
	padding: 8rpx 16rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 8rpx;
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 500;
	margin-left: 16rpx;
	transition: all 0.2s ease;
}

.code-btn:active {
	background: rgba(255, 255, 255, 0.3);
	transform: scale(0.95);
}

.forgot-wrapper {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 24rpx;
}

.forgot-text {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.6);
	transition: all 0.2s ease;
}

.forgot-text:active {
	color: rgba(255, 255, 255, 0.9);
	transform: scale(0.98);
}

.btn-primary {
	width: 100%;
	padding: 24rpx 0;
	background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
	border-radius: 16rpx;
	text-align: center;
	margin-top: 16rpx;
	box-shadow: 0 8rpx 24rpx rgba(34, 197, 94, 0.3);
	transition: all 0.3s ease;
}

.btn-primary:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.3);
}

.btn-primary text {
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}

.divider {
	display: flex;
	align-items: center;
	margin-top: 40rpx;
}

.divider-line {
	flex: 1;
	height: 1px;
	background: rgba(255, 255, 255, 0.2);
}

.divider-text {
	padding: 0 24rpx;
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.4);
}

.social-login {
	display: flex;
	justify-content: center;
	margin-top: 32rpx;
}

.social-btn {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.social-btn.wechat {
	background: rgba(34, 197, 94, 0.2);
}

.copyright {
	text-align: center;
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.3);
	margin-top: auto;
	padding-top: 32rpx;
}
</style>
