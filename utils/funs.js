import articleZH from '../libs/articleZH.js';
import articleEN from '../libs/articleEN.js';
import classical from '../libs/classical.js';

//定义全局变量
const globalData = () => {
	return {
		type: null,	//*storage->articleZH/articleEN/classical/music
		index: null,//*storage
		audioList: null,//*
		url: null,//*
		Audio: null,//*
		currAudio: null,
		// currentTime: '00:00',
		// duration: 0,
		// durationFormat: '00:00',
		onPlay: false,
		timer: null,
		playMode: wx.getStorageSync('playMode') || 'once'	//+storage->once,loop,list,listLoop,random,randomInfinite
	}
}

/**
 * @description initialize app.data
 * @param {*} app 
 */
const init = (app) => {
	let data = app.data || (app.data = globalData());

	data.type = wx.getStorageSync('type') || 'articleZH';
	data.index = wx.getStorageSync('index') || 0;

	//+设置audioList
	data.audioList = getAudioList(data.type);
	console.log('list', data.audioList);

	data.currAudio = data.audioList[data.index];
	data.url = data.currAudio[0].url;
	//+audio
	data.Audio = data.Audio || wx.createInnerAudioContext();
	if (data.Audio.src) {
		data.Audio.src == data.url || (data.Audio.src = data.url);
	} else {
		data.Audio.src = data.url
	}
	wxLogin(app);
	keepPlay(app);
	console.log('init');
}

//重置所有数据
const resetData = (app, type, index) => {
	let data = app.data;
	data.Audio && data.Audio.stop();
	wx.setStorageSync('type', type);
	wx.setStorageSync('index', index);
	data.onPlay = true;
	if (type === data.type && index === data.index) {
		return;
	}
	if (type !== data.type) {
		// clearData(app);
		data.type = type;
		data.audioList = getAudioList(type);
		_();
	} else {
		//如果只是索引改了
		if (index !== data.index) {
			_();
		}
	}
	function _() {
		data.index = index;
		data.currAudio = data.audioList[index];
		data.url = data.currAudio[0].url;
		data.Audio.src = data.url;
	}
}
const switchToPlay = e => {
	const app = getApp();
	let dataset = e.currentTarget.dataset;
	resetData(app, dataset.audioType, dataset.audioIndex);
	wx.switchTab({
		url: '/pages/play/play',
	})
}

const keepPlay = (app) => {
	let data = app.data;
	let Audio = data.Audio;
	if (data.onPlay) {
		Audio.pause();
		Audio.play();
	}
}
const getAudioList = (type) => {
	switch (type) {
		case 'articleZH': return articleZH;
		case 'articleEN': return articleEN;
		case 'classical': return classical;
		default: return '?'
	}
}
const wxLogin = () => {
	wx.getSetting({
		success: res => {
			if (res.authSetting['scope.userInfo']) {
				wx.getUserInfo({
					success: res => {
						app.data.userInfo = res.userInfo
						if (app.userInfoReadyCallback) {
							app.userInfoReadyCallback(res)
						}
					}
				})
			}
		}
	})
}
/*
const setTabBarStyle = () => {
	//设置导航栏文字选中颜色
	wx.setTabBarStyle({
		selectedColor: '#ffac13',
	})
}
*/
module.exports = {
	init,
	keepPlay,
	switchToPlay,
}