const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

const safeGetStorage = (key) => {
	try {
		if (typeof window !== "undefined") {
			return localStorage.getItem(key)
		}
	} catch (e) {}
	return null
}

const safeSetStorage = (key, value) => {
	try {
		if (typeof window !== "undefined") {
			localStorage.setItem(key, value)
		}
	} catch (e) {}
}

const getRandomBackground = (pics, videos = [], videoRate = 0, storageKey = "bg-last") => {
	const allItems = [
		...pics.map(item => ({ type: "pic", datainfo: item })),
		...videos.map(item => ({ type: "video", datainfo: item })),
	]

	if (!allItems.length) {
		return { type: "pic", datainfo: null }
	}

	if (allItems.length === 1) {
		return allItems[0]
	}

	const lastUrl = safeGetStorage(storageKey)
	const preferVideo = videos.length > 0 && Math.random() < videoRate

	const preferredItems = preferVideo
		? allItems.filter(item => item.type === "video")
		: allItems.filter(item => item.type === "pic")

	let candidates = preferredItems.filter(item => item.datainfo.url !== lastUrl)

	if (!candidates.length) {
		candidates = allItems.filter(item => item.datainfo.url !== lastUrl)
	}

	const next = candidates.length ? randomItem(candidates) : randomItem(allItems)

	safeSetStorage(storageKey, next.datainfo.url)
	return next
}

// PC 静态壁纸
const pcPicWallpapers = [
	{ "title": "时代", "preview": "/img/wallpaper/static/时代/image-pre.webp", "url": "https://jpwhub.us.ci/file/壁纸/诡秘之主/1774657520390_002_时代.jpeg" },
	{ "title": "光", "preview": "/img/wallpaper/static/光/image-pre.webp", "url": "https://jpwhub.us.ci/file/壁纸/诡秘之主/1774657571515_034_光，就是一切的意义.jpeg" },
	{ "title": "塞维亚菊", "preview": "/img/wallpaper/static/塞维亚菊/image-pre.webp", "url": "https://jpwhub.us.ci/file/壁纸/诡秘之主/1774657522030_001_塞维亚菊.jpeg" },
	{ "title": "奇迹", "preview": "/img/wallpaper/static/奇迹/image-pre.webp", "url": "https://jpwhub.us.ci/file/壁纸/诡秘之主/1774657553778_024_奇迹.jpg" },
	{ "title": "奥黛丽", "preview": "/img/wallpaper/static/奥黛丽/image-pre.webp", "url": "https://jpwhub.us.ci/file/壁纸/诡秘之主/1774657577503_036_奥黛丽.jpg" },
	{ "title": "节制", "preview": "/img/wallpaper/static/节制/image-pre.webp", "url": "https://jpwhub.us.ci/file/壁纸/诡秘之主/1774657542899_008_节制.jpeg" },
	{ "title": "观众", "preview": "/img/wallpaper/static/观众/image-pre.webp", "url": "https://jpwhub.us.ci/file/壁纸/诡秘之主/1774657517118_004_观众.jpg" },
]

// 移动端静态壁纸
const mobilePicWallpapers = [
	{ "title": "0001", "preview": "/img/wallpaper/static-mobile/0001/image-pre.webp", "url": "/img/wallpaper/static-mobile/0001/image.png" },
	{ "title": "0002", "preview": "/img/wallpaper/static-mobile/0002/image-pre.webp", "url": "/img/wallpaper/static-mobile/0002/image.png" },
	{ "title": "0003", "preview": "/img/wallpaper/static-mobile/0003/image-pre.webp", "url": "/img/wallpaper/static-mobile/0003/image.png" },
	{ "title": "0004", "preview": "/img/wallpaper/static-mobile/0004/image-pre.webp", "url": "/img/wallpaper/static-mobile/0004/image.png" },
	{ "title": "0005", "preview": "/img/wallpaper/static-mobile/0005/image-pre.webp", "url": "/img/wallpaper/static-mobile/0005/image.png" },
	{ "title": "0006", "preview": "/img/wallpaper/static-mobile/0006/image-pre.webp", "url": "/img/wallpaper/static-mobile/0006/image.png" },
]

// PC 动态壁纸
const pcVideoWallpapers = [
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
		"title": "上杉绘梨衣",
		"preview": "/img/wallpaper/dynamic/绘梨衣/Sakura-pre.webm",
		"url": "/img/wallpaper/dynamic/绘梨衣/Sakura.webm"
	},
	{
		"title": "尼尔：机械纪元 团队",
		"preview": "/img/wallpaper/dynamic/尼尔：机械纪元 团队/Nier-Automata-Team-pre.webm",
		"url": "/img/wallpaper/dynamic/尼尔：机械纪元 团队/Nier-Automata-Team.webm"
	},
]

// 移动端动态壁纸（先保留列表，默认背景暂不随机用它）
const mobileVideoWallpapers = [
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
]

const config = {
	//网页元数据
	metaData: {
		title: 'JupiterW的个人主页🎉',
		description: '欢迎来到JupiterW的奇妙世界！',
		keywords: 'JupiterW,jupiterW,个人主页,个人网站',
		icon: '/favicon.ico'
	},

	avatar: "/img/avatar.jpg",
	welcometitle: "Hi, I'm JupiterW",

	// 颜色配置
	color: {
		themecolor: "#FFFFFF",
		welcometitlecolor: "#FFFFFF",
		turntablecolor1: "#FFFF00",
		turntablecolor2: "#00FFFF"
	},

	brightness: 85,
	blur: 5,

	// 我的标签
	tags: ['奇迹师', '通识者'],

	// 默认背景壁纸
	background: {
		pc: getRandomBackground(pcPicWallpapers, pcVideoWallpapers, 0.5, "pc-bg"),
		mobile: getRandomBackground(mobilePicWallpapers, [], 0, "mobile-bg"),
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

	//音乐播放配置
	musicPlayer: {
		server: 'netease',
		type: 'playlist',
		id: '2056960641'
	},

	//壁纸数据
	wallpaper: {
		pic: pcPicWallpapers,
		picMobile: mobilePicWallpapers,
		video: pcVideoWallpapers,
		videoMobile: mobileVideoWallpapers,
	},

	//项目卡片
	projectcards: [
		{ go: "🎬 前往", img: "/img/hero.jpg", title: "抖音", subtitle: "短视频与热点", text: "看看今天有什么新鲜内容。", url: "https://www.douyin.com/jingxuan", show: false },
		{ go: "📺 前往", img: "/img/wallpaper/static/时代/image-pre.webp", title: "哔哩哔哩", subtitle: "动画 / 音乐 / 知识", text: "适合放松，也适合补充一点灵感。", url: "https://www.bilibili.com/", show: false },
		{ go: "📰 前往", img: "/img/wallpaper/static/光/image-pre.webp", title: "微博", subtitle: "热搜与舆论场", text: "快速浏览热点，但别停留太久。", url: "https://weibo.com/", show: false },
		{ go: "💍 前往", img: "/img/wallpaper/static/节制/image-pre.webp", title: "奈飞工厂", subtitle: "7,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://www.netflixgc.com/", show: false },
		{ go: "🗃 前往", img: "/img/wallpaper/static/奇迹/image-pre.webp", title: "Google", subtitle: "5,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://www.google.com/", show: false },
		{ go: "👍 前往", img: "/img/wallpaper/static/塞维亚菊/image-pre.webp", title: "ImgHub", subtitle: "4,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://jpwhub.us.ci/", show: false },
		{ go: "🎨 前往", img: "/img/wallpaper/static/奥黛丽/image-pre.webp", title: "Cloudflare", subtitle: "6,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://dash.cloudflare.com/", show: false },
		{ go: "🔍 前往", img: "/img/wallpaper/static/观众/image-pre.webp", title: "作者", subtitle: "8,000 miles of wonder", text: "If you see this line, I've managed to get your attention.", url: "https://leleo.top", show: false },
	],

	statement: ["备案号：XXICP备123456789号", "Copyright © 2025 Leleo"],
}

export default config
