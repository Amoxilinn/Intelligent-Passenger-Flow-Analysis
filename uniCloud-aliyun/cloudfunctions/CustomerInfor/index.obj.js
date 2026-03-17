const db = uniCloud.database()
const dbCmd = db.command
const customerCollection = db.collection('CustomerInfor')

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
	async saveCustomerInfo(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		try {
			const now = new Date()
			
			const formatDateTime = (date) => {
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hours = String(date.getHours()).padStart(2, '0')
				const minutes = String(date.getMinutes()).padStart(2, '0')
				const seconds = String(date.getSeconds()).padStart(2, '0')
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
			}
			
			const customerData = {
				gender: data.gender || 'unknown',
				age: data.age || 'unknown',
				upperWear: data.upperWear || 'unknown',
				upperColor: data.upperColor || 'unknown',
				lowerWear: data.lowerWear || 'unknown',
				lowerColor: data.lowerColor || 'unknown',
				glasses: data.glasses || 'unknown',
				mask: data.mask || 'unknown',
				headWear: data.headWear || 'unknown',
				bag: data.bag || 'unknown',
				location: data.location || 'unknown',
				storeId: data.storeId || '',
				userId: verify.uid,
				timestamp: formatDateTime(now),
				createdAt: Date.now()
			}

			console.log('准备保存的数据:', customerData)
			const result = await customerCollection.add(customerData)
			console.log('数据库保存成功:', result)

			return {
				errCode: 0,
				errMsg: '保存成功',
				data: {
					_id: result.id
				}
			}
		} catch (error) {
			console.error('保存顾客信息失败:', error)
			return {
				errCode: 'SAVE_ERROR',
				errMsg: '保存失败: ' + error.message
			}
		}
	},

	async getDashboardData(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		try {
			const { storeId } = data || {}
			const now = new Date()
			const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
			const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1
			
			let baseQuery = { userId: verify.uid }
			if (storeId) {
				baseQuery.storeId = storeId
			}

			const todayResult = await customerCollection.where({
				...baseQuery,
				createdAt: dbCmd.gte(todayStart).and(dbCmd.lte(todayEnd))
			}).get()

			const todayList = todayResult.data || []
			const todayTotal = todayList.length

			const hourlyStats = {}
			for (let i = 0; i < 24; i++) {
				hourlyStats[i] = 0
			}
			todayList.forEach(item => {
				const hour = new Date(item.createdAt).getHours()
				hourlyStats[hour]++
			})

			const hourlyData = []
			for (let i = 8; i <= 20; i += 2) {
				const value = hourlyStats[i] || 0
				hourlyData.push({
					label: `${i}:00`,
					value: value,
					height: todayTotal > 0 ? Math.max(10, (value / Math.max(...Object.values(hourlyStats))) * 100) : 10
				})
			}

			const genderStats = { male: 0, female: 0 }
			const ageStats = {
				'18-25': 0,
				'26-35': 0,
				'36-45': 0,
				'45+': 0
			}

			todayList.forEach(item => {
				if (item.gender === '男性' || item.gender === 'male') {
					genderStats.male++
				} else if (item.gender === '女性' || item.gender === 'female') {
					genderStats.female++
				}

				if (item.age) {
					const ageStr = String(item.age)
					if (ageStr.includes('18') || ageStr.includes('20') || ageStr.includes('25')) {
						ageStats['18-25']++
					} else if (ageStr.includes('26') || ageStr.includes('30') || ageStr.includes('35')) {
						ageStats['26-35']++
					} else if (ageStr.includes('36') || ageStr.includes('40') || ageStr.includes('45')) {
						ageStats['36-45']++
					} else if (ageStr.includes('45') || ageStr.includes('50') || ageStr.includes('55') || ageStr.includes('60')) {
						ageStats['45+']++
					}
				}
			})

			const recentResult = await customerCollection.where(baseQuery)
				.orderBy('createdAt', 'desc')
				.limit(10)
				.get()

			const activityList = recentResult.data.map(item => {
				const timeDiff = now.getTime() - (item.createdAt || 0)
				let timeText = '刚刚'
				if (timeDiff > 60 * 60 * 1000) {
					timeText = Math.floor(timeDiff / (60 * 60 * 1000)) + '小时前'
				} else if (timeDiff > 60 * 1000) {
					timeText = Math.floor(timeDiff / (60 * 1000)) + '分钟前'
				}
				return {
					type: 'in',
					text: `${item.gender === '女性' || item.gender === 'female' ? '女性' : '男性'}顾客进入店铺`,
					time: timeText,
					createdAt: item.createdAt
				}
			})

			const totalGender = genderStats.male + genderStats.female
			const totalAge = Object.values(ageStats).reduce((a, b) => a + b, 0)

			return {
				errCode: 0,
				errMsg: '获取成功',
				data: {
					todayTotal: todayTotal,
					hourlyData: hourlyData,
					genderStats: {
						male: totalGender > 0 ? Math.round((genderStats.male / totalGender) * 100) : 0,
						female: totalGender > 0 ? Math.round((genderStats.female / totalGender) * 100) : 0,
						maleCount: genderStats.male,
						femaleCount: genderStats.female
					},
					ageStats: {
						'18-25': totalAge > 0 ? Math.round((ageStats['18-25'] / totalAge) * 100) : 0,
						'26-35': totalAge > 0 ? Math.round((ageStats['26-35'] / totalAge) * 100) : 0,
						'36-45': totalAge > 0 ? Math.round((ageStats['36-45'] / totalAge) * 100) : 0,
						'45+': totalAge > 0 ? Math.round((ageStats['45+'] / totalAge) * 100) : 0,
						raw: ageStats
					},
					activityList: activityList
				}
			}
		} catch (error) {
			console.error('获取看板数据失败:', error)
			return {
				errCode: 'DASHBOARD_ERROR',
				errMsg: '获取看板数据失败: ' + error.message
			}
		}
	},

	async getHistoryData(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		try {
			const { storeId, date } = data || {}
			const targetDate = date ? new Date(date) : new Date()
			const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime()
			const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1
			
			let baseQuery = { userId: verify.uid }
			if (storeId) {
				baseQuery.storeId = storeId
			}

			const dayResult = await customerCollection.where({
				...baseQuery,
				createdAt: dbCmd.gte(dayStart).and(dbCmd.lte(dayEnd))
			}).get()

			const dayList = dayResult.data || []

			const weekData = []
			for (let i = 6; i >= 0; i--) {
				const d = new Date(targetDate)
				d.setDate(d.getDate() - i)
				const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
				const end = start + 24 * 60 * 60 * 1000 - 1
				
				const result = await customerCollection.where({
					...baseQuery,
					createdAt: dbCmd.gte(start).and(dbCmd.lte(end))
				}).count()

				const weekDayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				weekData.push({
					label: weekDayNames[d.getDay()],
					value: result.total,
					date: `${d.getMonth() + 1}/${d.getDate()}`
				})
			}

			return {
				errCode: 0,
				errMsg: '获取成功',
				data: {
					dayTotal: dayList.length,
					weekData: weekData,
					date: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
				}
			}
		} catch (error) {
			console.error('获取历史数据失败:', error)
			return {
				errCode: 'HISTORY_ERROR',
				errMsg: '获取历史数据失败: ' + error.message
			}
		}
	},

	async getCustomerList(data) {
		const verify = verifyToken(data?.token)
		if (!verify.valid) {
			return { errCode: verify.errCode, errMsg: verify.errMsg }
		}

		try {
			const { storeId, page = 1, pageSize = 20 } = data || {}
			
			let query = customerCollection.where({
				userId: verify.uid
			})

			if (storeId) {
				query = customerCollection.where({
					userId: verify.uid,
					storeId: storeId
				})
			}

			const result = await query
				.orderBy('createdAt', 'desc')
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.get()

			const countResult = await customerCollection.where({
				userId: verify.uid,
				...(storeId ? { storeId } : {})
			}).count()

			return {
				errCode: 0,
				errMsg: '获取成功',
				data: {
					list: result.data,
					total: countResult.total,
					page: page,
					pageSize: pageSize
				}
			}
		} catch (error) {
			console.error('获取顾客列表失败:', error)
			return {
				errCode: 'GET_ERROR',
				errMsg: '获取失败: ' + error.message
			}
		}
	}
}
