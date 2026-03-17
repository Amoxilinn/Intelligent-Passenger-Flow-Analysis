<script>
export default {
	onLaunch: function() {
		console.log('App Launch')
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
page {
	background-color: #F4F6F8;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

view, text {
	box-sizing: border-box;
}

::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}
</style>
