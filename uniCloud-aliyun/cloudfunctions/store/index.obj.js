const db = uniCloud.database()
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
	async getStores(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		try {
			const result = await storeCollection.where({
				userId: verify.uid
			}).orderBy('createdAt', 'desc').get()

			return {
				errCode: 0,
				errMsg: '获取成功',
				data: result.data
			}
		} catch (error) {
			console.error('获取店铺列表失败:', error)
			return {
				errCode: 'GET_ERROR',
				errMsg: '获取失败: ' + error.message
			}
		}
	},

	async addStore(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		if (!data || !data.name) {
			return {
				errCode: 'PARAM_ERROR',
				errMsg: '店铺名称不能为空'
			}
		}

		try {
			const result = await storeCollection.add({
				name: data.name,
				address: data.address || '',
				userId: verify.uid,
				createdAt: Date.now()
			})

			return {
				errCode: 0,
				errMsg: '添加成功',
				data: {
					_id: result.id
				}
			}
		} catch (error) {
			console.error('添加店铺失败:', error)
			return {
				errCode: 'ADD_ERROR',
				errMsg: '添加失败: ' + error.message
			}
		}
	},

	async updateStore(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		if (!data || !data._id) {
			return {
				errCode: 'PARAM_ERROR',
				errMsg: '店铺ID不能为空'
			}
		}

		try {
			const updateData = {}
			if (data.name) updateData.name = data.name
			if (data.address !== undefined) updateData.address = data.address

			await storeCollection.doc(data._id).where({
				userId: verify.uid
			}).update(updateData)

			return {
				errCode: 0,
				errMsg: '更新成功'
			}
		} catch (error) {
			console.error('更新店铺失败:', error)
			return {
				errCode: 'UPDATE_ERROR',
				errMsg: '更新失败: ' + error.message
			}
		}
	},

	async deleteStore(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		if (!data || !data._id) {
			return {
				errCode: 'PARAM_ERROR',
				errMsg: '店铺ID不能为空'
			}
		}

		try {
			const countResult = await storeCollection.where({
				userId: verify.uid
			}).count()

			if (countResult.total <= 1) {
				return {
					errCode: 'LAST_STORE',
					errMsg: '至少需要保留一个店铺'
				}
			}

			await storeCollection.doc(data._id).where({
				userId: verify.uid
			}).remove()

			return {
				errCode: 0,
				errMsg: '删除成功'
			}
		} catch (error) {
			console.error('删除店铺失败:', error)
			return {
				errCode: 'DELETE_ERROR',
				errMsg: '删除失败: ' + error.message
			}
		}
	}
}
