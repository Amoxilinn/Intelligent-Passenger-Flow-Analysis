<template>
	<view class="settings-page">
		<view class="safe-top"></view>
		
		<view class="header">
			<view class="back-btn" @click="goBack">
				<svg-icon type="arrow-left" :size="20" color="#ffffff"></svg-icon>
				<text class="back-text">返回</text>
			</view>
			<text class="page-title">设置</text>
			<view class="placeholder"></view>
		</view>
		
		<view class="content">
			<view class="section">
				<view class="section-header">
					<text class="section-title">当前店铺</text>
				</view>
				<view class="current-store" v-if="currentStore">
					<view class="store-info">
						<text class="store-name">{{ currentStore.name }}</text>
						<text class="store-address" v-if="currentStore.address">{{ currentStore.address }}</text>
					</view>
					<view class="current-badge">
						<text>当前</text>
					</view>
				</view>
				<view class="no-store" v-else>
					<text>暂无店铺</text>
				</view>
			</view>
			
			<view class="section">
				<view class="section-header">
					<text class="section-title">我的店铺</text>
					<view class="add-btn" @click="showAddStoreModal">
						<svg-icon type="plus" :size="16" color="#22c55e"></svg-icon>
						<text class="add-text">添加</text>
					</view>
				</view>
				
				<view class="store-list">
					<view 
						v-for="(store, index) in stores" 
						:key="store._id"
						class="store-item"
						:class="{ active: currentStore && currentStore._id === store._id }"
						@click="selectStore(store)"
					>
						<view class="store-info">
							<text class="store-name">{{ store.name }}</text>
							<text class="store-address" v-if="store.address">{{ store.address }}</text>
						</view>
						<view class="store-actions">
							<view class="action-btn edit" @click.stop="showEditStoreModal(store)">
								<svg-icon type="edit" :size="16" color="#3b82f6"></svg-icon>
							</view>
							<view class="action-btn delete" @click.stop="deleteStore(store)">
								<svg-icon type="trash" :size="16" color="#ef4444"></svg-icon>
							</view>
						</view>
						<view class="active-icon" v-if="currentStore && currentStore._id === store._id">
							<svg-icon type="check" :size="18" color="#22c55e"></svg-icon>
						</view>
					</view>
				</view>
				
				<view class="empty-tip" v-if="stores.length === 0">
					<text>还没有店铺，点击上方添加按钮创建</text>
				</view>
			</view>
			
			<view class="section">
				<view class="section-header">
					<text class="section-title">账号信息</text>
				</view>
				<view class="info-item">
					<text class="info-label">手机号</text>
					<text class="info-value">{{ userInfo.phone || '-' }}</text>
				</view>
			</view>
			
			<view class="logout-section">
				<view class="logout-btn" @click="handleLogout">
					<text>退出登录</text>
				</view>
			</view>
		</view>
		
		<view class="modal-mask" v-if="showModal" @click="hideModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ isEditMode ? '编辑店铺' : '添加店铺' }}</text>
				</view>
				<view class="modal-body">
					<view class="input-group">
						<text class="input-label">店铺名称</text>
						<input class="input-field" v-model="storeForm.name" placeholder="请输入店铺名称" />
					</view>
					<view class="input-group">
						<text class="input-label">店铺地址（可选）</text>
						<input class="input-field" v-model="storeForm.address" placeholder="请输入店铺地址" />
					</view>
				</view>
				<view class="modal-footer">
					<view class="modal-btn cancel" @click="hideModal">
						<text>取消</text>
					</view>
					<view class="modal-btn confirm" @click="saveStore">
						<text>确定</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'
const storeObj = uniCloud.importObject('store')

export default {
	components: { SvgIcon },
	data() {
		return {
			userInfo: {},
			stores: [],
			currentStore: null,
			showModal: false,
			isEditMode: false,
			storeForm: {
				_id: '',
				name: '',
				address: ''
			}
		}
	},
	onLoad() {
		this.loadUserInfo()
		this.loadStores()
	},
	onShow() {
		this.loadUserInfo()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		loadUserInfo() {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userInfo = userInfo
				this.currentStore = userInfo.currentStore || null
			}
		},
		async loadStores() {
			try {
				const token = this.userInfo.token
				const result = await storeObj.getStores({ token })
				if (result.errCode === 0) {
					this.stores = result.data
					if (this.stores.length > 0 && !this.currentStore) {
						this.currentStore = this.stores[0]
						this.updateCurrentStore()
					}
				} else if (result.errCode === 'TOKEN_MISSING' || result.errCode === 'TOKEN_ERROR') {
					uni.showToast({ title: '请重新登录', icon: 'none' })
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/login/login' })
					}, 1500)
				}
			} catch (error) {
				console.error('加载店铺列表失败:', error)
				uni.showToast({ title: '加载失败', icon: 'none' })
			}
		},
		selectStore(store) {
			this.currentStore = store
			this.updateCurrentStore()
			uni.showToast({ title: '已切换店铺', icon: 'success' })
		},
		updateCurrentStore() {
			let userInfo = uni.getStorageSync('userInfo') || {}
			userInfo.currentStore = this.currentStore
			userInfo.stores = this.stores
			uni.setStorageSync('userInfo', userInfo)
			this.userInfo = userInfo
		},
		showAddStoreModal() {
			this.isEditMode = false
			this.storeForm = {
				_id: '',
				name: '',
				address: ''
			}
			this.showModal = true
		},
		showEditStoreModal(store) {
			this.isEditMode = true
			this.storeForm = {
				_id: store._id,
				name: store.name,
				address: store.address || ''
			}
			this.showModal = true
		},
		hideModal() {
			this.showModal = false
		},
		async saveStore() {
			if (!this.storeForm.name) {
				uni.showToast({ title: '请输入店铺名称', icon: 'none' })
				return
			}
			
			try {
				uni.showLoading({ title: '保存中...' })
				
				const token = this.userInfo.token
				let result
				if (this.isEditMode) {
					result = await storeObj.updateStore({
						_id: this.storeForm._id,
						name: this.storeForm.name,
						address: this.storeForm.address,
						token
					})
				} else {
					result = await storeObj.addStore({
						name: this.storeForm.name,
						address: this.storeForm.address,
						token
					})
				}
				
				uni.hideLoading()
				
				if (result.errCode === 0) {
					this.showModal = false
					await this.loadStores()
					uni.showToast({ 
						title: this.isEditMode ? '更新成功' : '添加成功', 
						icon: 'success' 
					})
				} else {
					uni.showToast({ title: result.errMsg, icon: 'none' })
				}
			} catch (error) {
				uni.hideLoading()
				console.error('保存店铺失败:', error)
				uni.showToast({ title: '保存失败', icon: 'none' })
			}
		},
		async deleteStore(store) {
			if (this.stores.length <= 1) {
				uni.showToast({ title: '至少需要保留一个店铺', icon: 'none' })
				return
			}
			
			uni.showModal({
				title: '确认删除',
				content: `确定要删除店铺「${store.name}」吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '删除中...' })
							const token = this.userInfo.token
							const result = await storeObj.deleteStore({
								_id: store._id,
								token
							})
							uni.hideLoading()
							
							if (result.errCode === 0) {
								if (this.currentStore && this.currentStore._id === store._id) {
									this.currentStore = null
								}
								await this.loadStores()
								uni.showToast({ title: '删除成功', icon: 'success' })
							} else {
								uni.showToast({ title: result.errMsg, icon: 'none' })
							}
						} catch (error) {
							uni.hideLoading()
							console.error('删除店铺失败:', error)
							uni.showToast({ title: '删除失败', icon: 'none' })
						}
					}
				}
			})
		},
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('userInfo')
						uni.reLaunch({
							url: '/pages/login/login'
						})
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.settings-page {
	min-height: 100vh;
	background: #f4f6f8;
}

.safe-top {
	height: calc(var(--status-bar-height, 44px));
	background: linear-gradient(135deg, #003366 0%, #004d99 100%);
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	background: linear-gradient(135deg, #003366 0%, #004d99 100%);
}

.back-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	min-width: 120rpx;
}

.back-text {
	font-size: 28rpx;
	color: #ffffff;
}

.page-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}

.placeholder {
	min-width: 120rpx;
}

.content {
	padding: 24rpx;
}

.section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1f2937;
}

.add-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 16rpx;
	background: rgba(34, 197, 94, 0.1);
	border-radius: 12rpx;
}

.add-text {
	font-size: 24rpx;
	color: #22c55e;
	font-weight: 500;
}

.current-store {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
	border-radius: 16rpx;
}

.no-store {
	padding: 48rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 26rpx;
}

.store-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.store-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	background: #f9fafb;
	border-radius: 16rpx;
	border: 2rpx solid transparent;
	position: relative;
	transition: all 0.3s;
}

.store-item.active {
	background: #ecfdf5;
	border-color: #22c55e;
}

.store-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.store-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #1f2937;
}

.store-address {
	font-size: 24rpx;
	color: #6b7280;
}

.store-actions {
	display: flex;
	gap: 16rpx;
	margin-right: 40rpx;
}

.action-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ffffff;
	border-radius: 12rpx;
}

.active-icon {
	position: absolute;
	right: 24rpx;
	top: 50%;
	transform: translateY(-50%);
}

.current-badge {
	padding: 8rpx 20rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 20rpx;
}

.current-badge text {
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 500;
}

.empty-tip {
	padding: 48rpx;
	text-align: center;
	color: #9ca3af;
	font-size: 26rpx;
}

.info-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 0;
}

.info-label {
	font-size: 28rpx;
	color: #4b5563;
}

.info-value {
	font-size: 28rpx;
	color: #1f2937;
	font-weight: 500;
}

.logout-section {
	margin-top: 48rpx;
}

.logout-btn {
	width: 100%;
	padding: 28rpx;
	background: #ffffff;
	border-radius: 24rpx;
	text-align: center;
	border: 2rpx solid #ef4444;
}

.logout-btn text {
	font-size: 30rpx;
	color: #ef4444;
	font-weight: 500;
}

.modal-mask {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	width: 80%;
	max-width: 600rpx;
	background: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
}

.modal-header {
	padding: 32rpx;
	text-align: center;
	border-bottom: 1rpx solid #e5e7eb;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1f2937;
}

.modal-body {
	padding: 32rpx;
}

.input-group {
	margin-bottom: 24rpx;
}

.input-label {
	display: block;
	font-size: 26rpx;
	color: #4b5563;
	margin-bottom: 12rpx;
}

.input-field {
	width: 100%;
	padding: 20rpx 24rpx;
	background: #f9fafb;
	border: 2rpx solid #e5e7eb;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #1f2937;
}

.modal-footer {
	display: flex;
	border-top: 1rpx solid #e5e7eb;
}

.modal-btn {
	flex: 1;
	padding: 28rpx;
	text-align: center;
	font-size: 30rpx;
	font-weight: 500;
}

.modal-btn.cancel {
	color: #6b7280;
	border-right: 1rpx solid #e5e7eb;
}

.modal-btn.confirm {
	color: #22c55e;
}
</style>
