<template>
	<view class="svg-icon" :style="iconStyle">
		<text v-if="type === 'phone'" class="icon-content">📞</text>
		<text v-else-if="type === 'lock'" class="icon-content">🔒</text>
		<text v-else-if="type === 'arrow-left'" class="icon-content">←</text>
		<text v-else-if="type === 'chevron-right'" class="icon-content">›</text>
		<text v-else-if="type === 'chevron-down'" class="icon-content">▾</text>
		<text v-else-if="type === 'times'" class="icon-content">×</text>
		<text v-else-if="type === 'arrow-up'" class="icon-content">↑</text>
		<text v-else-if="type === 'bell'" class="icon-content">🔔</text>
		<text v-else-if="type === 'cog'" class="icon-content">⚙</text>
		<text v-else-if="type === 'exchange-alt'" class="icon-content">⇄</text>
		<text v-else-if="type === 'sign-out'" class="icon-content">→</text>
		<text v-else-if="type === 'mobile-alt'" class="icon-content">📱</text>
		<text v-else-if="type === 'download'" class="icon-content">↓</text>
		<text v-else-if="type === 'pie-chart'" class="icon-content">◉</text>
		<text v-else-if="type === 'history'" class="icon-content">◌</text>
		<text v-else-if="type === 'plus'" class="icon-content">+</text>
		<text v-else-if="type === 'chart-line'" class="icon-content">↗</text>
		<text v-else-if="type === 'video'" class="icon-content">📹</text>
		<text v-else-if="type === 'desktop'" class="icon-content">🖥</text>
		<text v-else-if="type === 'clock'" class="icon-content">🕐</text>
		<text v-else-if="type === 'play'" class="icon-content">▶</text>
		<text v-else-if="type === 'stop'" class="icon-content">■</text>
		<text v-else-if="type === 'moon'" class="icon-content">🌙</text>
		<text v-else-if="type === 'weixin'" class="icon-content">💬</text>
		<text v-else-if="type === 'shield'" class="icon-content">🛡</text>
		<text v-else-if="type === 'store'" class="icon-content">🏪</text>
		<text v-else-if="type === 'edit'" class="icon-content">✎</text>
		<text v-else-if="type === 'trash'" class="icon-content">🗑</text>
		<text v-else-if="type === 'check'" class="icon-content">✓</text>
		<text v-else class="icon-content">•</text>
	</view>
</template>

<script>
export default {
	name: 'SvgIcon',
	props: {
		type: {
			type: String,
			default: 'user'
		},
		size: {
			type: Number,
			default: 16
		},
		color: {
			type: String,
			default: 'currentColor'
		}
	},
	computed: {
		iconStyle() {
			return {
				fontSize: this.size + 'px',
				color: this.color
			}
		}
	}
}
</script>

<style scoped>
.svg-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.icon-content {
	font-size: inherit;
	line-height: 1;
	font-family: system-ui, -apple-system, sans-serif;
	font-weight: 300;
}
</style>
