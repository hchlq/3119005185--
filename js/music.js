 /**
  * 简单封装获取dom元素的方法
  * @param {*} selector id class 标签名
  * @param {*} isAll 是否获取全部
  */

 function o$(selector, isAll) {
     selector = selector.replace(/^\s+|\s+$/g, "");
     if (/^#[a-zA-Z]+([-_][\w]+)*o$/.test(selector)) {
         if (isAll) {
             return document.querySelectorAll(selector);
         } else {
             return document.getElementById(selector);
         }
     } else if (/^\.[a-zA-Z]+([-_][\w]+)*$/.test(selector)) {
         if (isAll) {
             return document.querySelectorAll(selector);
         } else {
             return document.querySelector(selector);
         }
     } else if (/^[a-zA-Z]+$/.test(selector)) {
         if (isAll) {
             return document.getElementsByTagName(selector);
         } else {
             return document.getElementsByTagName(selector)[0];
         }
     } else {
         return;
     }
 }

 /**
  *@param {*} method  方式Get POST...
  *@param {*} url 请求的地址
  *@param {*} callback 成功后调用这个函数，并且把请求回来的数据传给这个回调函数
  *@param {*} flag 是否异步
  *@param {*} data 请求的参数
  */

 function ajaxFunc(method, url, callback, flag, data) {
     var xhr;
     if (window.XMLHttpRequest) {
         xhr = new XMLHttpRequest();
     } else {
         xhr = new ActiveXObject("Microsoft.XMLHttp");
     }
     method = method.toUpperCase();
     if (method == "GET") {
         xhr.open(method, url + "?" + data, flag);
         xhr.send();
     } else {
         xhr.open(method, url, flag);
         xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         xhr.send(data);
     }
     console.log(1)
     xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
             if (xhr.status === 200) {
                 callback(xhr.responseText);
             }
         }
     };
 }


 var init = (function () {
     return function () {
         function player(options) {
             var defaultConfig = {
                 playState: false,
                 volumeState: true,
                 modeState: 0,
                 musicArr: [],
                 oIndex: 0,
                 prograssWidth: o$('.prograss').offsetWidth,
                 volumePrograssWidth: o$('.volume').offsetWidth,
                 curDom: o$('.current'),
                 musicPics: [],
                 oAudio: o$('.audio'),
                 author: '',
                 songName: "",
                 lyrics: []
             }
             //合并对象
             let musicConfig = Object.assign({}, defaultConfig, options);
             /**
              * 保存原数组，以便后面顺序循环时赋值
              */
             musicConfig.tempArr = [...musicConfig.musicArr];
             musicConfig.imgTempArr = [...musicConfig.musicPics];

             /**
              * 假如传递的不是网络请求的歌曲
              */

             if (musicConfig.oMusic) {
                 for (var i = 0; i < musicConfig.musicArr.length; i++) {
                     let oLi = document.createElement('li');
                     oLi.innerText = musicConfig.songNames[i];
                     o$('.left-songs').appendChild(oLi);
                 }

                 o$('.song-name').innerText = musicConfig.songNames[0];
                 o$('.author').innerText = musicConfig.authors[0];

                 function setName(songName, author) {
                     o$('.song-name').innerText = songName;
                     o$('.author').innerText = author;
                 }
             } else {
                 var oLi = document.createElement('li');
                 oLi.innerText = musicConfig.songName
                 o$('.left-songs').appendChild(oLi)
             }
             //初始化图片，audio地址，图片，歌名和歌手等
             function init() {
                 musicConfig.oAudio.src = musicConfig.musicArr[0];
                 o$('img').src = musicConfig.musicPics[0];
                 o$('.author').innerText = musicConfig.author;
                 o$('.song-name').innerText = musicConfig.songName;
                 o$('.blur-bg').style.backgroundImage = `url(${musicConfig.musicPics[0]})`
             }
             init()

             if (musicConfig.lyrics.length > 0) {
                 initLyrics(musicConfig.lyrics[0])
             }
             if (musicConfig.songNames) {
                 setName(musicConfig.songNames[musicConfig.oIndex], musicConfig.authors[musicConfig.oIndex])
             }
             let index = 0;
             let times = 0;
             let everyTime = 1;
             /**
              * 点击播放暂停
              */
             o$('.run-pause').onclick = function () {
                 if (!musicConfig.playState) {
                     play();
                 } else {
                     play('pause');
                 }
             }

             window.onkeydown = function (e) {
                 if (e.keyCode === 32) {
                     if (!musicConfig.playState) {
                         play();
                     } else {
                         play('pause');
                     }
                 }
             }

             /**
              * 侧边栏歌曲
              */

             o$('.left-songs').onclick = function (e) {
                 if (e.target.tagName === 'LI') {
                     index = Array.from(this.children).indexOf(e.target);
                     musicConfig.oIndex = index;
                     changeMusic(index);
                     play();
                     if (musicConfig.oMusic) {
                         setName(musicConfig.songNames[index], musicConfig.authors[index])
                     }
                     if (musicConfig.lyrics.length > 0) {
                         // 处理歌词
                         initLyrics(musicConfig.lyrics[index])
                         o$('.wrapper-lyrics').scrollTop = 0;
                         everyTime = 1;
                     }
                     changeBg(index);
                 }
             }

             /**
              * 点击播放上一首
              */
             o$('.prev').onclick = function () {
                 if (musicConfig.modeState === 2) {
                     randomPlay();
                 }
                 musicConfig.oIndex--;
                 if (musicConfig.oIndex < 0) {
                     musicConfig.oIndex = 2;
                 }
                 changeMusic(musicConfig.oIndex);
                 play();
                 if (musicConfig.oMusic.length > 0) {
                     setName(musicConfig.songNames[musicConfig.oIndex], musicConfig.authors[musicConfig.oIndex])
                 }
                 if (musicConfig.lyrics.length > 0) {
                     // 处理歌词
                     initLyrics(musicConfig.lyrics[musicConfig.oIndex])
                     o$('.wrapper-lyrics').scrollTop = 0;
                     everyTime = 1;
                 }
                 changeBg(musicConfig.oIndex);
             }

             /**
              * 点击播放下一首
              */
             o$('.next').onclick = function () {
                 if (musicConfig.modeState === 2) {
                     randomPlay();
                 }
                 musicConfig.oIndex++;
                 musicConfig.oIndex = musicConfig.oIndex % musicConfig.musicArr.length;
                 changeMusic(musicConfig.oIndex);
                 play()
                 if (musicConfig.oMusic) {
                     setName(musicConfig.songNames[musicConfig.oIndex], musicConfig.authors[musicConfig.oIndex])
                 }
                 if (musicConfig.lyrics.length > 0) {
                     // 处理歌词
                     initLyrics(musicConfig.lyrics[musicConfig.oIndex])
                     o$('.wrapper-lyrics').scrollTop = 0;
                     everyTime = 1;
                 }
                 changeBg(musicConfig.oIndex);

             }

             /**
              * 切换歌曲
              * @param {*} index 
              */
             function changeMusic(index) {
                 musicConfig.oAudio.src = musicConfig.musicArr[index];
                 o$('.p-img').src = musicConfig.musicPics[index];
             }

             /**
              * 播放或暂停
              * @param {*} state 
              */
             function play(state) {
                 if (state === 'pause') {
                     musicConfig.oAudio.pause();
                     o$('.run-pause').getElementsByTagName('i')[0].style.backgroundPosition = `9px 0`;
                     musicConfig.playState = false;
                     o$('.p-img').style.animationPlayState = 'paused'
                     o$('.cube-one').style.animationPlayState = 'paused'
                     o$('.cube-two').style.animationPlayState = 'paused'
                     o$('.run-pause').title = '播放'
                 } else {
                     musicConfig.oAudio.play();
                     o$('.run-pause').getElementsByTagName('i')[0].style.backgroundPosition = `-24px 0`;
                     musicConfig.playState = true;
                     o$('.p-img').style.animationPlayState = 'running'
                     o$('.cube-one').style.animationPlayState = 'running'
                     o$('.cube-two').style.animationPlayState = 'running'
                     o$('.run-pause').title = '暂停'
                 }
             }

             /**
              * 切换图片
              */

             function changeBg(index) {
                 o$('.blur-bg').style.backgroundImage = `url(${musicConfig.musicPics[index]})`
             }

             /**
              * 0 是顺序 1是单曲 2是随机 
              */
             o$('.mode').onclick = function () {
                 if (musicConfig.modeState === 0) {
                     this.style.backgroundPositionY = `-22.9rem`
                     musicConfig.modeState = 1;
                 } else if (musicConfig.modeState === 1) {
                     this.style.backgroundPositionY = `-7.3rem`
                     musicConfig.modeState = 2;
                 } else if (musicConfig.modeState === 2) {
                     this.style.backgroundPositionY = `-20.2rem`
                     musicConfig.modeState = 0;
                     musicConfig.musicArr = musicConfig.tempArr.slice();
                     musicConfig.musicPics = musicConfig.imgTempArr.slice();
                 }
                 if (musicConfig.modeState === 2) {
                     this.style.height = `2.3rem`
                     randomPlay();
                 } else {
                     this.style.height = `3rem`
                 }
             }

             /**
              * 处理进度条
              */
             function prograssMove() {
                 let curTime = musicConfig.oAudio.currentTime;
                 let changeWidth = Math.round((curTime / musicConfig.oAudio.duration) * musicConfig.prograssWidth);
                 o$('.head-move').style.left = changeWidth + (-6) + 'px';
                 o$('.prograss-move').style.width = changeWidth + 'px'
             }


             /**
              * 拖动进度条 音乐进度条
              */
             o$('.head-move').onmousedown = function (e) {
                 e.stopPropagation();
                 document.onmousemove = function (e) {
                     let temp = e.clientX - o$('.head-move').offsetParent.offsetLeft;
                     console.log(e.clientX, o$('.head-move').offsetParent.offsetLeft)
                     if (temp < 0) {
                         temp = 0
                     }
                     if (temp > musicConfig.prograssWidth) {
                         temp = musicConfig.prograssWidth;
                     }
                     o$('.head-move').style.left = temp + (-6) + 'px';
                     o$('.prograss-move').style.width = temp + 'px';
                     musicConfig.oAudio.currentTime = (parseInt(o$('.prograss-move').style.width) / musicConfig.prograssWidth) * musicConfig.oAudio.duration;
                     prograssMove();
                 }
                 document.onmouseup = function () {
                     document.onmousemove = null;
                 }
             }

             /**
              * 拖动进度条 音量进度条
              */

             o$('.volume-move').onmousedown = function (e) {
                 e.stopPropagation()
                 o$('.volume-mode').style.backgroundPositionY = `-14.4rem`;
                 document.onmousemove = function (e) {
                     let temp = e.clientX - o$('.volume-move').offsetParent.offsetLeft;
                     if (temp < 0) {
                         temp = 0
                     }
                     if (temp > musicConfig.volumePrograssWidth) {
                         temp = musicConfig.volumePrograssWidth;
                     }
                     o$('.volume-move').style.left = temp + (-6) + 'px';
                     o$('.volume-prograss').style.width = temp + 'px';
                     musicConfig.oAudio.volume = (parseInt(o$('.volume-prograss').style.width) / musicConfig.volumePrograssWidth);
                 }
                 document.onmouseup = function () {
                     document.onmousemove = null;
                 }
             }

             /**
              * 自动播放完毕后初始化元素
              */
             function initElement() {
                 play('pause');
                 o$('.head-move').style.left = '-6px';
                 o$('.prograss-move').style.width = '0px';
                 if (musicConfig.modeState == 0 || musicConfig.modeState === 2) { //按顺序播放 或随机播放
                     musicConfig.oIndex++;
                     if (musicConfig.oIndex === musicConfig.musicArr.length) {
                         musicConfig.oIndex = 0;
                     }
                 }
                 if (musicConfig.modeState === 2) {
                     randomPlay();
                 }
                 //处理歌词 
                 if (musicConfig.lyrics.length > 0) {
                     initLyrics(musicConfig.lyrics[musicConfig.oIndex]);
                     o$('.wrapper-lyrics').scrollTop = 0;
                     everyTime = 1;
                 }
                 changeMusic(musicConfig.oIndex)
                 if (musicConfig.oMusic) {
                     setName(musicConfig.songNames[musicConfig.oIndex], musicConfig.authors[musicConfig.oIndex])
                 }
                 play();
                 //改变背景图
                 changeBg(musicConfig.oIndex)
             }

             /**
              * 点击进度条 音乐进度条
              */

             o$('.prograss').onmousedown = function (e) {
                 e.stopPropagation();
                 if (!musicConfig.playState) {
                     play()
                     musicConfig.playState = true;
                 }
                 o$('.head-move').style.left = e.offsetX + (-6) + 'px';
                 o$('.prograss-move').style.width = e.offsetX + 'px';
                 musicConfig.oAudio.currentTime = (parseInt(o$('.prograss-move').style.width) / musicConfig.prograssWidth) * o$('.audio').duration;
                 prograssMove();
             }

             /**
              * 点击进度条 声音进度条
              */

             o$('.volume').onmousedown = function (e) {
                 e.stopPropagation()
                 o$('.volume-mode').style.backgroundPositionY = `-14.4rem`;
                 if (!musicConfig.playState) {
                     play()
                     musicConfig.playState = true;
                 }
                 o$('.volume-move').style.left = e.offsetX + (-6) + 'px';
                 o$('.volume-prograss').style.width = e.offsetX + 'px';
                 musicConfig.oAudio.volume = (parseInt(o$('.volume-prograss').style.width) / musicConfig.volumePrograssWidth);
             }

             //点击静音或恢复声音
             let tempVolume = 0;
             o$('.volume-ico').onclick = function () {
                 console.log(999)
                 if (musicConfig.volumeState) {
                     tempVolume = musicConfig.oAudio.volume;
                     musicConfig.oAudio.volume = 0
                     o$('.volume-mode').style.backgroundPositionY = `-18rem`;
                     musicConfig.volumeState = false;
                 } else {
                     musicConfig.oAudio.volume = tempVolume;
                     o$('.volume-mode').style.backgroundPositionY = `-14.4rem`;
                     musicConfig.volumeState = true;
                 }
             }

             /**
              * 随机播放
              */

             function randomPlay() {
                 let len = musicConfig.musicArr.length;
                 for (let i = 0; i < len; i++) {
                     var ranNum = getRandomNum(0, len - 1);
                     changePosition(i, ranNum);
                 }

                 function changePosition(cur, random) {
                     let arr = musicConfig.musicArr;
                     let imgArr = musicConfig.musicPics;
                     let lyrics = musicConfig.lyrics;
                     let temp;
                     temp = arr[cur];
                     arr[cur] = arr[random];
                     arr[random] = temp;
                     temp = imgArr[cur];
                     imgArr[cur] = imgArr[random];
                     imgArr[random] = temp;
                     temp = lyrics[cur];
                     lyrics[cur] = lyrics[random];
                     lyrics[random] = temp;

                 }

                 function getRandomNum(min, max) {
                     return Math.floor(Math.random() * (max - min + 1) + min)
                 }
             }

             /**
              * 更新时间
              */
             o$('.audio').addEventListener("timeupdate", function () { //监听音频播放的实时时间事件
                 let timeDisplay;
                 //用秒数来显示当前播放进度
                 timeDisplay = Math.floor(o$('.audio').currentTime); //获取实时时间
                 //处理时间
                 let minute = timeDisplay / 60;
                 let minutes = parseInt(minute);
                 if (minutes < 10) {
                     minutes = "0" + minutes;
                 }
                 //秒
                 let second = timeDisplay % 60;
                 let seconds = Math.round(second);
                 if (seconds < 10) {
                     seconds = "0" + seconds;
                 }
                 musicConfig.curDom.innerText = minutes + ':' + seconds

             })
             /**
              * 处理歌词
              */
             function initLyrics(str) {
                 if (str) {
                     let lyrics = str.split('[');
                     o$('.lyrics').innerHTML = '';
                     let fragment = document.createDocumentFragment();
                     let time;
                     lyrics.forEach(function (ele) {
                         let lyricsSplice = ele.split(']');
                         if (lyricsSplice[0]) {
                             // 得到时间
                             let res = lyricsSplice[0].split('.');
                             let result = res[0].split(':');
                             time = parseInt(result[0]) * 60 + parseInt(result[1]);
                         }
                         if (lyricsSplice.length > 1 && time !== 0) {
                             var p = document.createElement('p')
                             p.className = time;
                             p.innerHTML = lyricsSplice[1]
                             fragment.appendChild(p);
                         }
                     })
                     o$('.lyrics').appendChild(fragment);
                 }
             }



             /**
              * 根据时间变化进度条改变
              */
             o$('.audio').addEventListener('timeupdate', function () {
                 let current = parseInt(this.currentTime) - 1;
                 if (document.querySelector(`[class='${current}']`)) {
                     times++;
                     if (0 <= times % 4 <= 3) {}
                     if (times % 4 === 2) {
                         o$('.wrapper-lyrics').scrollTop = everyTime * 30;
                         everyTime++;
                     }
                     if (document.querySelector(`[class='${index}']`)) {
                         document.querySelector(`[class='${index}']`).style.color = '#eee';
                     }
                     index = current;
                     document.querySelector(`[class='${current}']`).style.color = '#0f0';
                 }
                 prograssMove();
             });


             /**
              * 监听资源加载完毕，设置总时间
              */

             o$('.audio').addEventListener('canplay', function () {
                 let musicTime = o$('.audio').duration - 1 // 获得音频时长
                 let rightMinutes = Math.floor(musicTime / 60) // 计算音频分钟
                 let rightSeconds = Math.ceil(musicTime % 60) // 计算音频秒
                 if (rightMinutes < 10 && rightSeconds < 10) { // 四种情况判断音频总时间
                     o$('.total').innerText = `0${rightMinutes}:0${rightSeconds}`
                 } else if (rightMinutes < 10) {
                     o$('.total').innerText = `0${rightMinutes}:${rightSeconds}`
                 } else if (rightSeconds < 10) {
                     o$('.total').innerText = `${rightMinutes}:0${rightSeconds}`
                 } else {
                     o$('.total').innerText = `${rightMinutes}:${rightSeconds}`
                 }
             });

             o$('.audio').onended = function () {
                 initElement()
             }
         }

         let options;
         if (location.href.includes('id')) {
             ajaxFunc('get', `http://musicapi.leanapp.cn/song/detail?ids=${location.href.split('?')[1].split('=')[1]}`, success, true);

             function success(data) {
                 var url = JSON.parse(data).songs[0].al.picUrl; //图片
                 var author = JSON.parse(data).songs[0].ar[0].name; //歌手
                 var songName = JSON.parse(data).songs[0].al.name;
                 var lyrics = [];
                 $.ajax({
                     type: 'post',
                     url: 'http://music.163.com/api/song/media',
                     dataType: 'jsonp',
                     data: `id=${location.href.split('?')[1].split('=')[1]}`,
                     success: function (data) {
                         lyrics.push(data.lyric);
                         player(options);
                     }
                 })
                 options = {
                     musicArr: [`https://music.163.com/song/media/outer/url?${location.href.split('?')[1]}.mp3`],
                     musicPics: [url],
                     author,
                     songName,
                     lyrics
                 }
             }
         } else {
             let musicArr = [];
             let musicPics = [];
             let lyrics = [];
             let songNames = [];
             let authors = [];
             //得到用户喜欢的歌单
             function getUserLove() {
                 let items = 0; //限制拿回的数据，不然页面太大
                 //得到用户喜欢的歌单
                 ajaxFunc('post', `http://musicapi.leanapp.cn/login/cellphone?phone=15577027025&password=820904`, getUserId, true);

                 function getUserId(data) {
                     //拿到id
                     ajaxFunc('post', `http://musicapi.leanapp.cn/user/playlist?uid=${JSON.parse(data).account.id}`, getSongList, true);
                 }

                 function getSongList(data) {
                     // 得到歌单id
                     let len = JSON.parse(data).playlist.length;
                     let arr = JSON.parse(data).playlist;
                     for (let i = 0; i < len; i++) {
                         ajaxFunc('post', `http://musicapi.leanapp.cn/playlist/detail?id=${arr[i].id}`, songList, true);
                     }

                 }
                 let str = '';

                 function songList(data) {
                     let len = JSON.parse(data).playlist.trackIds.length;
                     let arr = JSON.parse(data).playlist.trackIds;
                     for (let i = 0; i < len; i++) {
                         ajaxFunc('get', `http://musicapi.leanapp.cn/song/detail?ids=${arr[i].id}`, myFavorite, true);
                     }
                 }

                 function myFavorite(data) {
                     let id = JSON.parse(data).songs[0].id;
                     let url = JSON.parse(data).songs[0].al.picUrl; //图片
                     let author = JSON.parse(data).songs[0].ar[0].name; //歌手
                     let songName = JSON.parse(data).songs[0].al.name; //歌名
                     $.ajax({
                         type: 'post',
                         url: 'http://music.163.com/api/song/media',
                         dataType: 'jsonp',
                         data: `id=${id}`,
                         success: function (data) {
                             merge(id, url, author, songName, data.lyric)
                         }
                     })
                 }
                 function merge(id, url, author, songName, lyric) {
                     items++;
                     if (items <= 30) {
                         musicArr.push(`https://music.163.com/song/media/outer/url?id=${id}`);
                         musicPics.push(url);
                         authors.push(author);
                         songNames.push(songName);
                         lyrics.push(lyric);
                     }
                     if (items === 30) {
                         options = {
                             musicArr,
                             musicPics,
                             songNames,
                             authors,
                             oMusic: true,
                             lyrics

                         }
                         player(options)
                     }
                 }
             }
             getUserLove()

         }

     }

 }())
 init();
