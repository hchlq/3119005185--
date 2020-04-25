/**
 * 简单封装获取dom元素的方法
 * @param {*} selector id class 标签名
 * @param {*} isAll 是否获取全部
 */

function $(selector, isAll) {
    selector = selector.replace(/^\s+|\s+$/g, "");
    if (/^#[a-zA-Z]+([-_][\w]+)*$/.test(selector)) {
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


function player(options) {
    var defaultConfig = {
        playState: false,
        musicArr: [],
        oIndex: 0,
        prograssWidth: $('.prograss').offsetWidth,
        curDom: $('.current'),
        musicPics: [],
        oAudio: $('.audio')
    }
    let musicConfig = Object.assign({}, defaultConfig, options);
    $('.audio').src = musicConfig.musicArr[0];
    $('img').src = musicConfig.musicPics[0];
    /**
     * 点击播放暂停
     */
    $('.run-pause').onclick = function () {
        if (!musicConfig.playState) {
            play();
        } else {
            play('pause');
        }
    }

    /**
     * 点击播放上一首
     */
    $('.prev').onclick = function () {
        musicConfig.oIndex--;
        if (musicConfig.oIndex < 0) {
            musicConfig.oIndex = 2;
        }
        changeMusic(musicConfig.oIndex);
        play();
    }

    /**
     * 点击播放下一首
     */
    $('.next').onclick = function () {
        musicConfig.oIndex++;
        musicConfig.oIndex = musicConfig.oIndex % musicConfig.musicArr.length;
        changeMusic(musicConfig.oIndex);
        play()
    }

    /**
     * 切换歌曲
     * @param {*} index 
     */
    function changeMusic(index) {
        $('.audio').src = musicConfig.musicArr[index];
        $('.p-img').src = musicConfig.musicPics[index];
    }

    /**
     * 播放或暂停
     * @param {*} state 
     */
    function play(state) {
        if (state === 'pause') {
            $('.audio').pause();
            $('.run-pause').getElementsByTagName('i')[0].style.backgroundPosition = `9px 0`;
            musicConfig.playState = false;
            $('.album').style.animationPlayState = 'paused'
        } else {
            musicConfig.oAudio.play();
            $('.run-pause').getElementsByTagName('i')[0].style.backgroundPosition = `-24px 0`;
            musicConfig.playState = true;
            $('.album').style.animationPlayState = 'running'
        }
    }

    /**
     * 处理进度条
     */
    function prograssMove() {
        let curTime = $('.audio').currentTime;
        let changeWidth = Math.round((curTime / $('.audio').duration) * musicConfig.prograssWidth);
        if (parseInt(changeWidth) >= musicConfig.prograssWidth) {
            initElement()

        } else {
            $('.head-move').style.left = changeWidth + (-6) + 'px';
            $('.prograss-move').style.width = changeWidth + 'px'
        }
    }


    /**
     * 拖动进度条
     */
    $('.head-move').onmousedown = function (e) {
        console.log(1)
        e.stopPropagation();
        this.style.left = parseInt($('.prograss-move').style.left) + e.movementX + 'px';
        document.onmousemove = function (e) {
            let temp = e.clientX - $('.head-move').offsetParent.offsetLeft;
            if (temp < 0) {
                temp = 0
            }
            if (temp > 280) {
                temp = 280;
            }
            $('.head-move').style.left = temp + (-6) + 'px';
            $('.prograss-move').style.width = temp + 'px';
            $('.audio').currentTime = (parseInt($('.prograss-move').style.width) / musicConfig.prograssWidth) * $('.audio').duration;
            prograssMove();
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
        $('.head-move').style.left = '-6px';
        $('.prograss-move').style.width = '0px';
        musicConfig.oIndex++;
        if (musicConfig.oIndex === musicConfig.musicArr.length) {
            musicConfig.oIndex = 0;
            console.log(musicConfig.oIndex, musicConfig.musicArr.length)
        }
        changeMusic(musicConfig.oIndex)
        play();
    }

    /**
     * 点击进度条
     */

    $('.prograss').onmousedown = function (e) {
        e.stopPropagation();
        if (!musicConfig.playState) {
            play()
            musicConfig.playState = true;
        }
        $('.head-move').style.left = e.offsetX + (-6) + 'px';
        $('.prograss-move').style.width = e.offsetX + 'px';
        $('.audio').currentTime = (parseInt($('.prograss-move').style.width) / musicConfig.prograssWidth) * $('.audio').duration;
        prograssMove();
    }

    /**
     * 随机播放
     */

    function randomPlay() {
        musicConfig.musicArr = musicConfig.musicArr.sort(function () {
            return Math.random() - 0.5;
        })
    }

    /**
     * 更新时间
     */
    $('.audio').addEventListener("timeupdate", function () { //监听音频播放的实时时间事件
        let timeDisplay;
        //用秒数来显示当前播放进度
        timeDisplay = Math.floor($('.audio').currentTime); //获取实时时间
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
     * 根据时间变化进度条改变
     */
    $('.audio').addEventListener('timeupdate', prograssMove);


    /**
     * 监听资源加载完毕，设置总时间
     */

    $('.audio').addEventListener('canplay', function () {
        let musicTime = $('.audio').duration - 2 // 获得音频时长
        let rightMinutes = Math.floor(musicTime / 60) // 计算音频分钟
        let rightSeconds = Math.ceil(musicTime % 60) // 计算音频秒
        if (rightMinutes < 10 && rightSeconds < 10) { // 四种情况判断音频总时间
            $('.total').innerText = `0${rightMinutes}:0${rightSeconds}`
        } else if (rightMinutes < 10) {
            $('.total').innerText = `0${rightMinutes}:${rightSeconds}`
        } else if (rightSeconds < 10) {
            $('.total').innerText = `${rightMinutes}:0${rightSeconds}`
        } else {
            $('.total').innerText = `${rightMinutes}:${rightSeconds}`
        }
    });
}

if (location.href.includes('id') && !location.href.includes('qqmusic')) { //传递的是链接过来的
    let reg = /=([\w\W]+)/;
    let str = location.href.split('&')[1];
    let url = reg.exec(str)[1];
    let options = {
        musicArr: [`https://music.163.com/song/media/outer/url?${location.href.split('?')[1]}.mp3`],
        musicPics: [url]
    }
    player(options);
}  else {
    let options = {
        musicArr: ['./song_1.mp3', './song_2.mp3', './song_3.mp3'],
        musicPics: ['./song_1.jpg', './song_2.jpg', './song_3.jpg'],
    }
    player(options);
}


// player();


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
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(xhr.responseText);
            }
        }
    };
}

ajaxFunc('get', 'https://api.imjad.cn/cloudmusic/?type=search&search_type=1&s=与你无关', success, true);

function success(data) {
    let img = JSON.parse(data).result.songs[1].al.picUrl;
    let id = JSON.parse(data).result.songs[1].id;
}

// ?id= 124335&img='//'