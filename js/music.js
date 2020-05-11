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
     let xhr;
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
     xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
             if (xhr.status === 200) {
                 callback(xhr.responseText);
             }
         }
     };
 }


 /**
  * 播放器
  */
 let initPlayer = (function () {
     return function () {
         function player(options) {
             let defaultConfig = {
                 playState: false,
                 volumeState: true,
                 modeState: 0,
                 musicArr: [], //存放播放音乐地址
                 oIndex: 0,
                 prograssWidth: o$('.prograss').offsetWidth,
                 volumePrograssWidth: o$('.volume').offsetWidth,
                 curDom: o$('.current'),
                 musicPics: [], //音乐图片
                 oAudio: o$('.audio'),
                 author: '',
                 songName: "",
                 lyrics: [] //歌词
             }
             //合并对象
             let musicConfig = Object.assign({}, defaultConfig, options);
             /**
              * 保存原数组，以便后面顺序循环时赋值
              */
             musicConfig.tempArr = [...musicConfig.musicArr];
             musicConfig.imgTempArr = [...musicConfig.musicPics];
             if (Array.isArray(musicConfig.songNames) && Array.isArray(musicConfig.authors)) {
                 musicConfig.songNamesTempArr = [...musicConfig.songNames];
                 musicConfig.authorsTempArr = [...musicConfig.authors];
             }

             /**
              * 假如传递不是歌曲id或歌手id
              */

             if (musicConfig.oMusic) {
                 for (let i = 0; i < musicConfig.musicArr.length; i++) {
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
                 let oLi = document.createElement('li');
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
             let index = 0,
                 volumeMove = o$('.volume-move'),
                 volumeMode = o$('.volume-mode'),
                 volume = o$('.volume'),
                 oPrograssMove = o$('.prograss-move'),
                 headMove = o$('.head-move')
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
                     if (musicConfig.modeState === 2) {
                         randomPlay();
                     }
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
                     }
                     //改变背景
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
                     musicConfig.oIndex = musicConfig.musicArr.length - 1;
                 }
                 changeMusic(musicConfig.oIndex);
                 play();
                 setName(musicConfig.songNames[musicConfig.oIndex], musicConfig.authors[musicConfig.oIndex])
                 if (musicConfig.lyrics.length > 0) {
                     // 处理歌词
                     initLyrics(musicConfig.lyrics[musicConfig.oIndex])
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
                 setName(musicConfig.songNames[musicConfig.oIndex], musicConfig.authors[musicConfig.oIndex])
                 if (musicConfig.lyrics.length > 0) {
                     // 处理歌词
                     initLyrics(musicConfig.lyrics[musicConfig.oIndex])
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
                     //图片旋转
                     o$('.p-img').style.animationPlayState = 'paused'
                     //正方体旋转
                     o$('.cube-one').style.animationPlayState = 'paused'
                     o$('.cube-two').style.animationPlayState = 'paused'
                     //  更改提示文字
                     o$('.run-pause').title = '播放'
                     //  拨动杆离开图片
                     o$('.swiper').style.transform = `rotate(0deg)`;
                 } else {
                     musicConfig.oAudio.play();
                     o$('.run-pause').getElementsByTagName('i')[0].style.backgroundPosition = `-24px 0`;
                     musicConfig.playState = true;
                     o$('.p-img').style.animationPlayState = 'running'
                     o$('.cube-one').style.animationPlayState = 'running'
                     o$('.cube-two').style.animationPlayState = 'running'
                     o$('.run-pause').title = '暂停'
                     //  拨动杆指向图片
                     o$('.swiper').style.transform = `rotate(27deg)`;
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
                     musicConfig.authors = musicConfig.authorsTempArr.slice();
                     musicConfig.songNames = musicConfig.songNamesTeamArr.slice();
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
                 headMove.style.left = changeWidth + (-6) + 'px';
                 oPrograssMove.style.width = changeWidth + 'px'
             }
             /**
              * 进度条
              * @param {*} options 配置选项
              */
             function Prograss(options) {
                 options.headMove.onmousedown = function (e) {
                     e.stopPropagation();
                     if (options.changeMode === 'currentTime') {
                         musicConfig.oAudio.ontimeupdate = null;
                         musicConfig.oAudio.pause();
                     }
                     document.onmousemove = function (e) {
                         let temp = e.clientX - options.headMove.offsetParent.offsetLeft;
                         if (temp < 0) {
                             temp = 0;
                         }
                         //  总的进度条
                         if (temp > options.prograssWidth) {
                             temp = options.prograssWidth;
                         }
                         //大的头的移动
                         options.headMove.style.left = temp + (-6) + 'px';
                         // 进度条移动
                         options.prograssingWidth.style.width = temp + 'px';
                         if (options.changeMode === 'currentTime') {
                             musicConfig.oAudio[options.changeMode] = (parseInt(options.prograssingWidth.style.width) / options.prograssWidth) * musicConfig.oAudio.duration;
                            //  滚动时歌词改变
                             setTime();
                         } else { //改变的是声音
                             musicConfig.oAudio[options.changeMode] = (parseInt(options.prograssingWidth.style.width) / options.prograssWidth);
                             if (musicConfig.oAudio[options.changeMode] === 0) {
                                 volumeMode.style.backgroundPositionY = `-18rem`;
                             } else {
                                 volumeMode.style.backgroundPositionY = `-14.4rem`
                             }
                         }
                         document.onmouseup = function () {
                             if (options.changeMode === 'currentTime') {
                                 if (musicConfig.playState === true) {
                                     play()
                                 }
                                 musicConfig.oAudio.ontimeupdate = function () {
                                     setTime();
                                     prograssMove()
                                     // 更新当前的时间
                                     let timeDisplay;
                                     //用秒数来显示当前播放进度
                                     timeDisplay = Math.floor(musicConfig.oAudio.currentTime); //获取实时时间
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
                                 }
                             }
                             document.onmousemove = null;
                         }
                     }
                 }
                 options.prograss.onmousedown = function (e) {
                     if (e.button !== 0) { //点击不是左键
                         return;
                     }
                     e.stopPropagation();
                     if (!musicConfig.playState) {
                         play()
                         musicConfig.playState = true;
                     }
                     options.headMove.style.left = e.offsetX + (-6) + 'px';
                     options.prograssingWidth.style.width = e.offsetX + 'px';
                     if (options.changeMode === 'currentTime') { //音乐进度条
                         musicConfig.oAudio[options.changeMode] = (parseInt(options.prograssingWidth.style.width) / options.prograssWidth) * musicConfig.oAudio.duration;

                     } else { //改变的是声音
                         musicConfig.oAudio[options.changeMode] = (parseInt(options.prograssingWidth.style.width) / options.prograssWidth);
                         if (musicConfig.oAudio[options.changeMode] === 0) {
                             volumeMode.style.backgroundPositionY = `-18rem`;
                         } else {
                             volumeMode.style.backgroundPositionY = `-14.4rem`
                         }
                     }
                 }
             }
             //音乐进度条
             new Prograss({
                 headMove: headMove,
                 prograssingWidth: oPrograssMove,
                 prograssWidth: musicConfig.prograssWidth,
                 changeMode: 'currentTime',
                 prograss: o$('.prograss')
             })
             //  声音
             new Prograss({
                 headMove: volumeMove,
                 prograssingWidth: o$('.volume-prograss'),
                 prograssWidth: musicConfig.volumePrograssWidth,
                 changeMode: 'volume',
                 prograss: volume
             })



             /**
              * 自动播放完毕后初始化元素
              */
             function initElement() {
                 play('pause');
                 headMove.style.left = '-6px';
                 oPrograssMove.style.width = '0px';
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
                 }
                 changeMusic(musicConfig.oIndex)
                 if (musicConfig.oMusic) {
                     setName(musicConfig.songNames[musicConfig.oIndex], musicConfig.authors[musicConfig.oIndex])
                 }
                 play();
                 //改变背景图
                 changeBg(musicConfig.oIndex)
             }



             //点击静音或恢复声音
             let tempVolume = 0;
             o$('.volume-ico').onclick = function () {
                 if (musicConfig.volumeState) {
                     tempVolume = musicConfig.oAudio.volume;
                     musicConfig.oAudio.volume = 0
                     volumeMode.style.backgroundPositionY = `-18rem`;
                     musicConfig.volumeState = false;
                 } else {
                     musicConfig.oAudio.volume = tempVolume;
                     volumeMode.style.backgroundPositionY = `-14.4rem`;
                     musicConfig.volumeState = true;
                 }
             }

             /**
              * 随机播放
              */

             function randomPlay() {
                 let len = musicConfig.musicArr.length;
                 for (let i = 0; i < len; i++) {
                     let ranNum = getRandomNum(0, len - 1);
                     changePosition(i, ranNum);
                 }

                 function changePosition(cur, random) {
                     let arr = musicConfig.musicArr;
                     let imgArr = musicConfig.musicPics;
                     let lyrics = musicConfig.lyrics;
                     let songNames = musicConfig.songNames;
                     let authors = musicConfig.authors;
                     let temp;
                     //  改变歌曲数组
                     temp = arr[cur];
                     arr[cur] = arr[random];
                     arr[random] = temp;
                     //  改变图片
                     temp = imgArr[cur];
                     imgArr[cur] = imgArr[random];
                     imgArr[random] = temp;
                     //  改变歌词
                     temp = lyrics[cur];
                     lyrics[cur] = lyrics[random];
                     lyrics[random] = temp;
                     temp = songNames[cur];
                     songNames[cur] = songNames[random];
                     songNames[random] = temp;
                     temp = authors[cur];
                     authors[cur] = authors[random];
                     authors[random] = temp

                 }

                 function getRandomNum(min, max) {
                     return Math.floor(Math.random() * (max - min + 1) + min)
                 }
             }
             /**
              * 处理歌词
              */
             function initLyrics(str) {
                 if (str) {
                     let lyricsDom = o$('.lyrics')
                     let lyrics = str.split('[');
                     let fragment = document.createDocumentFragment();
                     lyricsDom.innerHTML = '';
                     let time;
                     /**
                      * 获取歌词和时间
                      */
                     function getLyrArr() {
                         let lycArr = [];
                         lyrics.forEach(function (ele) {
                             let res = getObj(ele);
                             lycArr.push(res);

                         })

                         function getObj(ele) {
                             let lyrObj = {};
                             let lyricsSplice = ele.split(']');
                             if (lyricsSplice[0]) {
                                 // 得到时间
                                 let res = lyricsSplice[0].split('.');
                                 let result = res[0].split(':');
                                 result[0] = +result[0];
                                 result[1] = +result[1]
                                 time = result[0] * 60 + result[1];
                                 if (time) {
                                     lyrObj.time = time
                                 }
                             }
                             if (lyricsSplice.length > 1) {
                                 let lyr = lyricsSplice[1];
                                 if (lyr) {
                                     lyrObj.lyr = lyr;
                                 }
                             }
                             return lyrObj
                         }
                         return lycArr;
                     }
                     let lyrArr = getLyrArr();
                     //  给歌词排序
                     lyrArr = lyrArr.sort(function (ele1, ele2) {
                         return ele1.time - ele2.time
                     })
                     //  创建元素
                     for (let i = 0; i < lyrArr.length; i++) {
                         let p = document.createElement('p');
                         if (lyrArr[i].lyr) {
                             p.innerText = lyrArr[i].lyr
                         }
                         fragment.appendChild(p);
                     }
                     lyricsDom.appendChild(fragment)

                     /**
                      * 算出距离并且设置歌词高亮
                      */
                     function setActive(i) {
                         //  当前播放的是i
                         let topDis = ((i) * 33 + 33 / 2) - (350 / 2);
                         if (topDis < 0) {
                             topDis = 0;
                         }
                         o$('.lyrics').style.marginTop = -topDis + 'px'
                         if (o$('.active')) {
                             o$('.active').classList.remove('active');
                         }
                         lyricsDom.children[i].classList.add('active');
                     }
                     /**
                      * 算出时间
                      */
                     setTime = function () {
                         let time = musicConfig.oAudio.currentTime - 0.6;
                         for (let i = 0; i < lyrArr.length; i++) {
                             if (time < lyrArr[i].time) {
                                 setActive(i - 1);
                                 break;
                             }
                         }
                     }

                 }
                 musicConfig.oAudio.ontimeupdate = function () {
                     setTime();
                     prograssMove()
                     // 更新当前的时间
                     let timeDisplay;
                     //用秒数来显示当前播放进度
                     timeDisplay = Math.floor(musicConfig.oAudio.currentTime); //获取实时时间
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
                 }
             }

             /**
              * 监听资源加载完毕，设置总时间
              */

             musicConfig.oAudio.addEventListener('canplay', function () {
                 let musicTime = musicConfig.oAudio.duration - 1 // 获得音频时长
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

             musicConfig.oAudio.onended = function () {
                 initElement()
             }
         }
         let loading = o$('.loading');
         let options;
         if (location.href.includes('sid')) { //传了歌手id
             let musicArr = [];
             let musicPics = [];
             let lyrics = [];
             let songNames = [];
             let times = 0;
             let len;
             ajaxFunc('post', `http://musicapi.leanapp.cn/artists?id=${location.href.split('?')[1].split('=')[1]}`, getSingerSong, true);

             function getSingerSong(data) {
                 let json = JSON.parse(data);
                 data = json.hotSongs; //歌曲总数
                 len = data.length; //数据长度
                 let author = json.artist.name;
                 let authors = new Array(data.length);
                 authors.fill(author);
                 data.forEach(function (ele) {
                     let picUrl = ele.al.picUrl;
                     let songName = ele.name;
                     let id = ele.id;
                     $.ajax({
                         type: 'get',
                         url: 'https://api.imjad.cn/cloudmusic',
                         data: `type=lyric&id=${id}`,
                         success: function (data) {
                             if (data.lrc) {
                                 mergeSongs(id, songName, picUrl, data.lrc.lyric, authors);
                             } else {
                                 mergeSongs(id, songName, picUrl, null, authors);
                             }
                         }
                     })
                 })
             }
             /**
              * 调用播放器函数
              */
             function mergeSongs(id, songName, picuUrl, lyric, authors) {
                 times++;
                 musicArr.push(`https://music.163.com/song/media/outer/url?id=${id}`);
                 musicPics.push(picuUrl);
                 songNames.push(songName);
                 lyrics.push(lyric);
                 if (times === len) {
                     options = {
                         musicArr,
                         musicPics,
                         songNames,
                         authors,
                         oMusic: true,
                         lyrics

                     }
                     //  loading去掉
                     loading.style.display = 'none';
                     player(options)
                 }
             }

         } else if (location.href.includes('id')) { //传了歌曲id
             ajaxFunc('get', `http://musicapi.leanapp.cn/song/detail?ids=${location.href.split('?')[1].split('=')[1]}`, success, true);

             function success(data) {
                 let url = JSON.parse(data).songs[0].al.picUrl; //图片
                 let author = JSON.parse(data).songs[0].ar[0].name; //歌手
                 let songName = JSON.parse(data).songs[0].al.name;
                 let lyrics = [];

                 $.ajax({
                     type: 'get',
                     url: 'https://api.imjad.cn/cloudmusic',
                     data: `type=lyric&id=${location.href.split('?')[1].split('=')[1]}`,
                     success: function (data) {
                         lyrics.push(data.lrc.lyric);
                         //  loading去掉
                         loading.style.display = 'none';
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
         } else { //什么都没传，拿我的歌单
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
                     //  $.ajax({
                     //      type: 'post',
                     //      url: 'http://music.163.com/api/song/media',
                     //      dataType: 'jsonp',
                     //      data: `id=${id}`,
                     //      success: function (data) {
                     //          merge(id, url, author, songName, data.lyric)
                     //     }
                     // })
                     $.ajax({
                         type: 'get',
                         url: 'https://api.imjad.cn/cloudmusic',
                         data: `type=lyric&id=${id}`,
                         success: function (data) {
                             if (data.lrc) {
                                 merge(id, url, author, songName, data.lrc.lyric)
                             }
                         }
                     })
                 }

                 function merge(id, url, author, songName, lyric) {
                     items++;
                     if (items <= 80) {
                         musicArr.push(`https://music.163.com/song/media/outer/url?id=${id}`);
                         musicPics.push(url);
                         authors.push(author);
                         songNames.push(songName);
                         lyrics.push(lyric);
                     }
                     if (items === 80) { //只调用一次
                         options = {
                             musicArr,
                             musicPics,
                             songNames,
                             authors,
                             oMusic: true,
                             lyrics

                         }
                         //  loading去掉
                         loading.style.display = 'none';
                         player(options)
                     }
                 }
             }
             getUserLove()

         }

     }

 }())

 /**
  * 评论
  */
 let comment = (function () {
     return function () {
         // 切换页面
         let device = o$('.device');
         let hotComment = o$('.hot-comment');
         o$('.comment').onclick = function () {
             device.style.transform = `translateX(-100%)`;
             hotComment.style.transform = `translateX(0)`;
         }
         o$('.back').onclick = function () {
             device.style.transform = `translateX(0)`;
             hotComment.style.transform = `translateX(100%)`;
         }
         let comment = o$('.o-comment');
         let input = o$('.c-input');
         // page的宽高
         let pageWidth = 170;
         let pageHeight = 170;
         // 设置初始z-index
         let zIndex = 1;
         // 获取视口的宽高
         let initWidth = document.documentElement.clientWidth;
         let initHeight = document.documentElement.clientHeight;

         // 可以拖动page
         window.onmousedown = function (e) {
             let div = getMoveDiv(e.target);
             if (!div) {
                 return;
             } else {
                 // 设置z-index,后面的评论在之前的之上
                 div.style.zIndex = zIndex;
                 zIndex++;
                 let style = getComputedStyle(div);
                 let divLeft = parseFloat(style.left);
                 let divTop = parseFloat(style.top);
                 window.onmousemove = function (e) {
                     zIndex++;
                     divLeft += e.movementX;
                     divTop += e.movementY;
                     div.style.left = divLeft + 'px';
                     div.style.top = divTop + 'px';
                 }
                 window.onmouseleave = window.onmouseup = function () {
                     window.onmousemove = null;
                 }
             }


         }

         /**
          * 获得类名为page的dom元素
          * @param {*} dom 
          */

         function getMoveDiv(dom) {
             if (dom.className === 'o-page') {
                 return dom;
             } else if (dom.parentElement && dom.parentElement.className === 'o-page' && dom.tagName === 'P') {
                 return dom.parentElement;
             } else {
                 return;
             }
         }

         /**
          * 创建评论
          * @param {*} word 
          */
         function createComment(word) {
             // 创建div
             let div = document.createElement('div');
             div.className = 'o-page';
             div.innerHTML = `<p> ${ word } </p> <span>X</span>`
             // 设置背景，随机获得背景颜色
             div.style.background = `rgba(${getRandomNum(0, 255)}, ${getRandomNum(0, 255)}, ${getRandomNum(0, 255)})`
             // 最大的left和top值
             let maxLeft = document.documentElement.clientWidth - pageWidth;
             let maxTop = document.documentElement.clientHeight - pageHeight - 80;
             // 获取随机的在0-maxLeft 0-maxTop之间的值后设置div位置
             div.style.left = getRandomNum(0, maxLeft) + 'px';
             div.style.top = getRandomNum(0, maxTop) + 'px';
             comment.appendChild(div);

             /**
              * 获取给定最大最小值之间的数
              * @param {*} min 
              * @param {*} max 
              */
             function getRandomNum(min, max) {
                 return Math.floor(Math.random() * (max - min + 1) + min)
             }
         }


         /**
          * 初始化获取别人的评论
          */
         function createPageInit() {
             let times = 0;
             let arr = [];
             if (location.href.includes('?')) {
                 let id = location.href.split('?')[1].split('=')[1];
                 if (id) {
                     ajaxFunc('post', `http://musicapi.leanapp.cn/comment/music?id=${id}&limit=20`, getComment, true);
                 }
             }

             function getComment(data) {
                 data = JSON.parse(data).comments;
                 for (let i = 0; i < data.length; i++) {
                     times++;
                     arr.push(data[i].content);
                     if (times === data.length) {
                         arr.forEach((ele) => {
                             createComment(ele)
                         })
                     }
                 }
             }
         }

         createPageInit()

         /**
          * 监听窗口变化，重新设置位置
          */
         window.onresize = function () {
             let disX = document.documentElement.clientWidth - initWidth;
             let disY = document.documentElement.clientHeight - initHeight;
             for (let i = 0; i < comment.children.length; i++) {
                 let page = comment.children[i];
                 let left = this.parseFloat(page.style.left);
                 let right = this.initWidth - pageWidth - left;
                 let newLeft = left + (left / (left + right)) * disX;
                 let top = parseFloat(page.style.top);
                 let bottom = this.iniHeight - pageWidth - top;
                 let newTop = top + (top / (top + bottom) * disY);
                 page.style.top = newTop + 'px';
                 page.style.left = newLeft + 'px'
             }
             initWidth = document.documentElement.clientWidth;
             initHeight = document.documentElement.clientHeight;
         }

         // 监听Input的键盘事件，按回车键发送评论
         input.onkeypress = function (e) {
             if (e.key === 'Enter') {
                 if (this.value) {
                     createComment(this.value);
                     //  发送评论后清空input框
                     this.value = '';
                 }
             }
         }

         // 去掉评论
         comment.onclick = function (e) {
             if (e.target.tagName === 'SPAN') {
                 if (e.target.parentElement.className === 'o-page') {
                     e.target.parentElement.remove();
                 }
             }

         }

     }
 }())

 function init() {
     initPlayer();
     comment()
 }

 init()