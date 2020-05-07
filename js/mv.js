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


let init = (function () {
    return function () {
        ajaxFunc('post', `http://musicapi.leanapp.cn/mv/detail?mvid=${location.href.split('?')[1].split('=')[1]}`, getMvInfo, true);
        function getMvInfo (data) {
            data = JSON.parse(data).data;
            let url = data.brs['1080'];
            document.querySelector('.video').src = url;
        }
    }
}())

init();