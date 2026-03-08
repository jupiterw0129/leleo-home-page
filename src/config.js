const config = {
	//网页元数据
	metaData: {
		title: 'JupiterW的个人主页🎉',
		description: '欢迎来到JupiterW的奇妙世界！',
		keywords: 'JupiterW,jupiterW,个人主页,个人网站',
		icon: '/favicon.ico'   //网页图标，支持外链
	},

	avatar: "/img/avatar.jpg", // 头像
	welcometitle: "Hi, I'm JupiterW", // 标题

	// 颜色配置
	color: {
		themecolor: "#FFFFFF", // 主题颜色，推荐趋于亮白可带有轻微色调，例： #D1FFEC
		welcometitlecolor: "#FFFFFF", // 标题颜色 例： #7BFFC9
		turntablecolor1: "#FFFF00",  // 转盘渐变色一
		turntablecolor2: "#00FFFF"   // 转盘渐变色二
	},

	brightness: 85, // 背景亮度 --%
	blur: 5, // 毛玻璃模糊效果

	// 我的标签
	tags: ['奇迹师', '通识者'],

	// 默认背景壁纸
	background: {
		"pc": {   //pc端
			"type": "pic",   //"pic":静态壁纸;"video":动态壁纸
			"datainfo": {
				"title": "时代",
				"preview": "/img/wallpaper/static/时代/image-pre.webp",
				"url": "/img/wallpaper/static/时代/image.png",     //当然，也可填写网络地址或壁纸api，如随机PC壁纸api："url":"https://t.mwm.moe/pc"
			},
		},
		"mobile": {   //移动端
			"type": "pic",
			"datainfo": {
				"title": "0001",
				"preview": "/img/wallpaper/static-mobile/0001/image-pre.webp",
				"url": "/img/wallpaper/static-mobile/0001/image.png"  //同理，随机移动端壁纸："url":"https://t.mwm.moe/mp"
			}
		}

	},

	//极坐标图数据
	polarChart: {
		skills: ['龙威', '心理暗示', '昨日重现', '愚弄', '嫁接', '隐秘', '灵界穿梭', '偷盗', '光', '扭曲', '空想'],
		skillPoints: [85, 78, 88, 90, 80, 78, 85, 65, 82, 78, 70],
	},

	//社交按钮
	socialPlatformIcons: [
		{ icon: "mdi-github", link: "https://www.github.com/jupiterw0129" },
		{ icon: "mdi-email", link: "https://wx.mail.qq.com/" },
		{ icon: "mdi-qqchat", link: "https://im.qq.com/" },
		{ icon: "mdi-wechat", link: "https://wx.qq.com/" },
		{ icon: "mdi-youtube", link: "https://www.youtube.com" },
		{ icon: "mdi-facebook", link: "https://www.facebook.com" }
	],

	//打字机
	typeWriterStrings: [
		"这位先生，能占用一下您的时间吗？",
		"我想给您讲一讲我们的道标和救主，‘愚者’先生。",
		"我主自称‘愚者’，",
		"在过去，在现在，也在未来，",
		"他是支配灵界的伟大主宰，",
		"也是执掌好运的黄黑之王，",
		"更是每个生灵追求永恒的道标。",
		"我主居于现实和灵界之上，仁慈洒满了天国和大地，",
		"祂的座旁共有六位天使侍立，",
		"‘水银天使’是命运的化身，是我主最宠爱的天使；",
		"‘死亡天使’是跟随我主最久的存在，是冥界的执政官；",
		"‘救赎天使’是我主的号角，是祂神谕的传达者；",
		"‘生命天使’是智慧的结晶，是每个人体内永不磨灭的灵性。",
		"主的神座旁边还有‘惩戒天使’，",
		"祂是主的雷霆，主的怒火，主的手掌，",
		"是所有堕落者和不洁者的审判官及处刑人。",
		"和‘惩戒天使’相对的是‘时之天使’，",
		"他是古老年代里的‘王’，",
		"最终臣服于我主，",
		"为祂敲击天国之钟。"
	],

	//音乐播放配置，采用MetingJS Api(https://github.com/metowolf/MetingJS)
	musicPlayer: {
		server: 'netease',  //服务提供商 --网易云音乐
		type: 'playlist',   //歌单类型
		id: '2056960641'  //歌单id ---> music.163.com/#/playlist?id=2056960641
	},

	//壁纸数据 -----可以将壁纸文件上传到图床获取网络直链。若想调用api，请前往脚本自行修改逻辑
	wallpaper: {
		pic: [
			{ "title": "时代", "preview": "/img/wallpaper/static/时代/image-pre.webp", "url": "/img/wallpaper/static/时代/image.png" },
			{ "title": "光", "preview": "/img/wallpaper/static/光/image-pre.webp", "url": "/img/wallpaper/static/光/image.png" },
			{ "title": "塞维亚菊", "preview": "/img/wallpaper/static/塞维亚菊/image-pre.webp", "url": "/img/wallpaper/static/塞维亚菊/image.png" },
			{ "title": "奇迹", "preview": "/img/wallpaper/static/奇迹/image-pre.webp", "url": "/img/wallpaper/static/奇迹/image.png" },
			{ "title": "奥黛丽", "preview": "/img/wallpaper/static/奥黛丽/image-pre.webp", "url": "/img/wallpaper/static/奥黛丽/image.png" },
			{ "title": "节制", "preview": "/img/wallpaper/static/节制/image-pre.webp", "url": "/img/wallpaper/static/节制/image.png" },
			{ "title": "观众", "preview": "/img/wallpaper/static/观众/image-pre.webp", "url": "/img/wallpaper/static/观众/image.png" },
		],
		picMobile: [
			{ "title": "0001", "preview": "/img/wallpaper/static-mobile/0001/image-pre.webp", "url": "/img/wallpaper/static-mobile/0001/image.png" },
			{ "title": "0002", "preview": "/img/wallpaper/static-mobile/0002/image-pre.webp", "url": "/img/wallpaper/static-mobile/0002/image.png" },
			{ "title": "0003", "preview": "/img/wallpaper/static-mobile/0003/image-pre.webp", "url": "/img/wallpaper/static-mobile/0003/image.png" },
			{ "title": "0004", "preview": "/img/wallpaper/static-mobile/0004/image-pre.webp", "url": "/img/wallpaper/static-mobile/0004/image.png" },
			{ "title": "0005", "preview": "/img/wallpaper/static-mobile/0005/image-pre.webp", "url": "/img/wallpaper/static-mobile/0005/image.png" },
			{ "title": "0006", "preview": "/img/wallpaper/static-mobile/0006/image-pre.webp", "url": "/img/wallpaper/static-mobile/0006/image.png" },
		],
		video: [
			{
				"title": "克莱恩的葬礼",
				"preview": "/img/wallpaper/dynamic/克莱恩的葬礼/Klein-pre.webm",
				"url": "/img/wallpaper/dynamic/克莱恩的葬礼/Klein.webm"
			},
			{
				"title": "不存在的战区",
				"preview": "/img/wallpaper/dynamic/不存在的战区/86-pre.webm",
				"url": "/img/wallpaper/dynamic/不存在的战区/86.webm"
			},
			{
				"title": "薇尔莉特",
				"preview": "/img/wallpaper/dynamic/薇尔莉特/Violet-pre.webm",
				"url": "/img/wallpaper/dynamic/薇尔莉特/Violet.webm"
			},
			{
				"title": "阿尓托莉雅",
				"preview": "/img/wallpaper/dynamic/阿尓托莉雅/Saber-pre.webm",
				"url": "/img/wallpaper/dynamic/阿尓托莉雅/Saber.webm"
			},
			{
				"title": "尼尔：机械纪元 团队",
				"preview": "/img/wallpaper/dynamic/尼尔：机械纪元 团队/Nier-Automata-Team-pre.webm",
				"url": "/img/wallpaper/dynamic/尼尔：机械纪元 团队/Nier-Automata-Team.webm"
			},
			
		],
		videoMobile: [
			{
				"title": "幻觉镇-gaako_illust",
				"preview": "/img/wallpaper/dynamic-mobile/幻觉镇-gaako_illust/Hallucination_town-pre.mp4",
				"url": "/img/wallpaper/dynamic-mobile/幻觉镇-gaako_illust/Hallucination_town.mp4"
			},
			{
				"title": "chuva",
				"preview": "/img/wallpaper/dynamic-mobile/chuva/chuva-pre.mp4",
				"url": "/img/wallpaper/dynamic-mobile/chuva/chuva.mp4"
			},
			{
				"title": "女孩",
				"preview": "/img/wallpaper/dynamic-mobile/女孩/girl-pre.mp4",
				"url": "/img/wallpaper/dynamic-mobile/女孩/girl.mp4"
			},
		],
	},

	//项目卡片 其中 字段"show"控制初始卡片的text是否展开
	projectcards: [
		{ go: "🚀 前往", img: "/img/sunshine.jpg", title: "抖音", subtitle: "1,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://www.douyin.com/jingxuan", show: false },
		{ go: "🗂️ 前往", img: "/img/sunshine.jpg", title: "哔哩哔哩", subtitle: "2,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://www.bilibili.com/", show: false },
		{ go: "📝 前往", img: "/img/sunshine.jpg", title: "微博", subtitle: "3,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://weibo.com/", show: false },
		{ go: "👍 前往", img: "/img/sunshine.jpg", title: "京东", subtitle: "4,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://www.jd.com/", show: false },
		{ go: "🗃 前往", img: "/img/sunshine.jpg", title: "Google", subtitle: "5,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://www.google.com/", show: false },
		{ go: "🎨 前往", img: "/img/sunshine.jpg", title: "Cloudflare", subtitle: "6,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://dash.cloudflare.com/", show: false },
		{ go: "💍 前往", img: "/img/sunshine.jpg", title: "奈飞工厂", subtitle: "7,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://www.netflixgc.com/", show: false },
		{ go: "🔍 前往", img: "/img/sunshine.jpg", title: "作者", subtitle: "8,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://leleo.top", show: false },
	],

	statement: ["备案号：XXICP备123456789号", "Copyright © 2025 Leleo"],
}

export default config
