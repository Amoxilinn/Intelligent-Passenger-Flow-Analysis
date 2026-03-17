const db = uniCloud.database()
const userCollection = db.collection('uni-id-users')
const storeCollection = db.collection('Store')

function verifyToken(token) {
	try {
		if (!token) {
			return { valid: false, errCode: 'TOKEN_MISSING', errMsg: '未登录' }
		}
		const parts = token.split(':')
		if (parts.length !== 3) {
			return { valid: false, errCode: 'TOKEN_ERROR', errMsg: 'token无效' }
		}
		const [uid, timestampStr, signature] = parts
		const timestamp = parseInt(timestampStr)
		const now = Date.now()
		if (now - timestamp > 7 * 24 * 60 * 60 * 1000) {
			return { valid: false, errCode: 'TOKEN_EXPIRED', errMsg: 'token已过期' }
		}
		return { valid: true, uid: uid }
	} catch (error) {
		return { valid: false, errCode: 'TOKEN_ERROR', errMsg: 'token无效' }
	}
}

module.exports = {
	async register(data) {
		if (!data || !data.phone || !data.password) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '手机号和密码不能为空'
			}
		}

		if (!/^1[3-9]\d{9}$/.test(data.phone)) {
			return {
				errCode: 'INVALID_PHONE',
				errMsg: '请输入正确的手机号'
			}
		}

		if (data.password.length < 6) {
			return {
				errCode: 'INVALID_PASSWORD',
				errMsg: '密码长度不能少于6位'
			}
		}

		try {
			const existingUser = await userCollection.where({
				mobile: data.phone
			}).get()

			if (existingUser.data && existingUser.data.length > 0) {
				return {
					errCode: 'PHONE_EXISTS',
					errMsg: '该手机号已注册'
				}
			}

			const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
			const now = Date.now()

			await userCollection.add({
				_id: userId,
				username: data.phone,
				mobile: data.phone,
				password: data.password,
				register_date: now,
				create_date: now,
				update_date: now
			})

			await storeCollection.add({
				name: '我的店铺',
				address: '',
				userId: userId,
				createdAt: now
			})

			return {
				errCode: 0,
				errMsg: '注册成功',
				data: {
					_id: userId
				}
			}
		} catch (error) {
			console.error('注册失败:', error)
			return {
				errCode: 'REGISTER_ERROR',
				errMsg: '注册失败: ' + error.message
			}
		}
	},

	async login(data) {
		if (!data || !data.phone || !data.password) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '手机号和密码不能为空'
			}
		}

		try {
			const userResult = await userCollection.where({
				mobile: data.phone
			}).get()

			if (!userResult.data || userResult.data.length === 0) {
				return {
					errCode: 'USER_NOT_EXISTS',
					errMsg: '该手机号未注册'
				}
			}

			const user = userResult.data[0]

			if (user.password !== data.password) {
				return {
					errCode: 'WRONG_PASSWORD',
					errMsg: '密码错误'
				}
			}

			const userId = user._id
			const now = Date.now()
			const token = `${userId}:${now}:simple`
			const tokenExpired = now + 7 * 24 * 60 * 60 * 1000

			const storesResult = await storeCollection.where({
				userId: userId
			}).orderBy('createdAt', 'asc').get()

			const stores = storesResult.data || []
			const defaultStore = stores.length > 0 ? stores[0] : null

			return {
				errCode: 0,
				errMsg: '登录成功',
				data: {
					_id: userId,
					phone: data.phone,
					token: token,
					tokenExpired: tokenExpired,
					stores: stores,
					currentStore: defaultStore
				}
			}
		} catch (error) {
			console.error('登录失败:', error)
			return {
				errCode: 'LOGIN_ERROR',
				errMsg: '登录失败: ' + error.message
			}
		}
	},

	async logout(data) {
		return {
			errCode: 0,
			errMsg: '退出成功'
		}
	},

	async checkToken(data) {
		const verify = verifyToken(data.token)
		if (!verify.valid) {
			return {
				errCode: verify.errCode,
				errMsg: verify.errMsg
			}
		}
		return {
			errCode: 0,
			errMsg: 'token有效',
			data: {
				uid: verify.uid
			}
		}
	}
}
