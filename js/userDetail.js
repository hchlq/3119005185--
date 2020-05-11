/**
 * 简单封装获取dom元素的方法
 * @param {*} selector id class 标签名
 * @param {*} isAll 是否获取全部
 */

function o$(selector, isAll) {
    selector = selector.replace(/^\s+|\s+$/g, "");
    if (/^#[a-zA-Z]+[\D\d]*$/.test(selector)) {
        if (isAll) {
            return document.querySelectorAll(selector);
        } else {
            return document.getElementById(selector);
        }
    } else if (/^\.[a-zA-Z]+[\D\d]*$/.test(selector)) {
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
 * 封装的ajax函数
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


let userInfo = (function () {
    return function () {
        let userId = location.href.split('=')[1];
        ajaxFunc('post', `http://musicapi.leanapp.cn/user/detail?uid=${userId}`, callback, true);
        let times = 0;
        function callback(data) {
            data = JSON.parse(data);
            let bgUrl = data.profile.backgroundUrl; //背景
            let avUrl = data.profile.avatarUrl; //用户头像
            let level = data.level; //等级
            let follows = data.profile.follows; //关注人数
            let followeds = data.profile.followeds; //粉丝人数
            let nickName = data.profile.nickname; //用户昵称
            let songListNum = data.profile.playlistCount; //歌单数量
            o$('.avUrl').src = avUrl;
            o$('.header').style.backgroundImage = `url(${bgUrl})`;
            o$('.follows-count').innerText = follows;
            o$('.followeds-count').innerText = followeds;
            o$('.name').innerText = nickName
            o$('.songList-count').innerText = songListNum
            o$('.level-count').innerText = level;
        }
        ajaxFunc('post', `http://musicapi.leanapp.cn/user/record?uid=${userId}&type=1`, getSongs, true)

        function getSongs(data) {
            times++;
            let str = '';
            data = JSON.parse(data).weekData;
            for (let i = 0; i < data.length; i++) {
                times++;
                let songName = data[i].song.name;
                let author = data[i].song.ar[0].name;
                let id = data[i].song.id;
                str += `
            <li class='item'>
                <a href="#" class='song-name cm'>${songName}</a>
                <a href="#" class='singer cm'>${author}</a>
                <a href="./music.html?id=${id}" class='play' target='_blank'>播放</a>
             </li>
            `
                if (times === data.length) {
                    o$('.recent-play').innerHTML = str;
                }
            }

        }
    }
}())


userInfo();