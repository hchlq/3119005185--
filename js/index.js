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


/**
 * 函数防抖, 防止搜索太频繁请求
 * @param {*} fn 
 * @param {*} time 
 */

function debounce(fn, time) {
    let timer = null
    return function () {
        if (timer) {
            clearTimeout(timer);
        }
        let args = arguments;
        timer = setTimeout(function () {
            fn(...args);
        }, time);
    }
}

/**
 * 搜索栏
 */

let search = (function () {
    return function () {
        let input = o$('.text');
        let musicsContainer = o$('.musics')
        let cb = debounce(ajaxFunc, 1000);
        let str = '';
        let curHotWd = o$('.cur-hot-wd');

        input.oninput = function () {
            str = '';
            musicsContainer.innerHTML = '';
            getData(this.value)
        }

        input.onfocus = function () { //搜索框获得焦点时，拿回热搜列表
            ajaxFunc('post', `http://musicapi.leanapp.cn/search/hot/detail`, getHotWd, true);

            function getHotWd(data) {
                let times = 0;
                oData = JSON.parse(data).result.hots;
                let len = oData.length;
                for (let i = 0; i < len; i++) {
                    times++;
                    ajaxFunc('post', `http://musicapi.leanapp.cn/search/suggest?keywords=${oData[i].first}`, getId, true);

                    function getId(data) {
                        if (JSON.parse(data).result.songs) {
                            id = JSON.parse(data).result.songs[0].id
                            render(id, oData[i].first);
                        }
                    }
                }

                function render(id, name) {
                    str += `
                    <li>
                        <a href="./music.html?id=${id}" target='_blank'>
                            <span>${name}</span>
                        </a>
                    </li>
                    `
                    o$('.cur-hot-wd').style.display = 'block';
                    o$('.text').style.borderRadius = `2rem 2rem 0 0`;
                    if (times === len) {
                        o$('.hot-wd').innerHTML = str;
                    }
                }
            }
        }
        /**
         * 根据关键词拿回数据
         */
        function getData(value) {
            cb('post', `http://musicapi.leanapp.cn/search/suggest?keywords=${value}`, callback, true);
            if (!this.value) {
                // 当搜索框没有值的时候,清空下面的结果框
                musicsContainer.innerHTML = '';
                musicsContainer.style.display = 'none'
                str = ''
                input.style.borderRadius = `2rem`
            }
        }

        function callback(data) { //传入关键词后返回的数据
            let result = JSON.parse(data).result;
            if (result) {
                let result = JSON.parse(data).result.songs;
                if (result) {
                    result.forEach(function (ele) {
                        if (ele) {
                            getSongInfo(ele.id);
                        }
                    })
                }
            }

        }
        o$('body').onclick = function () {
            musicsContainer.style.display = 'none';
            curHotWd.style.display = 'none'
            input.style.borderRadius = `2rem`
            musicsContainer.innerHTML = ''
            str = ''
        }

        curHotWd.onclick = function (e) {
            // 阻止冒泡
            e.stopPropagation();
        }

        /**
         * 根据id获取这首歌的信息
         * @param {*} id 
         */

        function getSongInfo(id) {
            ajaxFunc('get', `http://musicapi.leanapp.cn/song/detail?ids=${id}`, success, true);

            /**
             * 回调函数, 获取歌曲信息后传递的数据
             * @param {*} data 
             */
            function success(data) {
                var url = JSON.parse(data).songs[0].al.picUrl; //图片地址
                var author = JSON.parse(data).songs[0].ar[0].name; //歌手名字
                var songName = JSON.parse(data).songs[0].al.name; //歌名
                // 拿到数据,传递进行渲染
                render(id, url, songName, author);
            }
        }

        function render(id, imgUrl, songName, author) {
            str += `
                <li>   
                <a href="./music.html?id=${id}" target='_blank'>
                    <div class="left-img">
                    <img src='${imgUrl}'/>
                    </div>
                    <div class="right-desc">
                        <span class="wd-top">${author}</span>
                        <span class="wd-bottom">${songName}</span>
                    </div>
                </a>
            </li>
            `
            let musics = o$('.musics');
            musics.innerHTML = str;
            curHotWd.style.display = 'none'
            musics.style.display = 'block'
            input.style.borderRadius = `2rem 2rem 0 0`;
        }
    }
}())


/**
 * 登录区域
 */
let login = (function () {


    // 表单校验
    /**
     * data-field-container 容器(必填) data-field 验证的input select等添加的自定义属性名
     * data-field-prop 验证的属性值 默认是value  data-field-listener 监听的事件 默认是change事件
     * data-field-error 显示错误消息元素
     * @param {*} option 一个对象 form元素 所有表单的验证规则 错误后添加的类名
     */
    function FormVd(option) {
        var defaultOption = { //默认配置
            formDom: document.forms[0],
            formRules: {},
            errorClass: 'has-error'
        }
        this.option = Object.assign({}, defaultOption, option);
        let elems = this.getAllElement();
        let _this = this;
        this.startValidator = function (isValidate) {
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];
                let field = elem.field;
                elem.doms.forEach(function (ele) {
                    //注册事件
                    ele.onfocus = function () {}
                    // 什么都没输入时也校验
                    if (isValidate) {
                        if (!ele.value) {
                            _this.setStatus(field)
                        }
                    }
                    ele.onblur = function () {
                        this.style.border = 'none'
                        //离开时没有设置值也校验
                        if (!this.value) {
                            _this.setStatus(field);
                        }
                    }
                    let name = _this.getEventName(ele);
                    ele.addEventListener(name, function () {
                        _this.setStatus(field)
                    })
                })
            }
        }
        this.startValidator()

    }
    /**
     * 获取事件名
     */

    FormVd.prototype.getEventName = function (el) {
        let name = FormVd.dataConfig.dataFieldListener;
        let eventName = el.getAttribute(name);
        if (!eventName) {
            eventName = FormVd.dataConfig.dataFieldDefaultListener;
        }
        return eventName;
    }


    /**
     * 得到传入的data-field-container的值下所有要验证的表单下的数据 1
     */

    FormVd.prototype.getFieldData = function (field) {
        let fieldContainer = this.getFieldContainer(field);
        if (!fieldContainer) {
            return;
        }
        let eles = this.getFieldElements(fieldContainer); // 要验证的表单元素
        let datas = [];
        eles.forEach(function (ele) {
            let propName = FormVd.dataConfig.dataFieldProp; //都得到自定义属性名
            propName = ele.getAttribute(FormVd.dataConfig.dataFieldProp);
            if (!propName) { //没有data-field-prop
                propName = FormVd.dataConfig.dataFieldDefaultProp;
            }
            let val = ele[propName];
            // 处理单选和复选框
            if (ele.type === 'checkbox' || ele.type === 'radio') {
                if (ele.checked) {
                    datas.push(val)
                }
            } else {
                datas.push(val);
            }
        })
        if (datas.length === 0) { //没有拿到数据
            return null;
        }
        if (datas.length === 1) {
            return datas[0];
        } else {
            return datas
        }
    }

    /**
     * 得到所有表单的数据
     */

    FormVd.prototype.getFormData = function () {
        let dataName = FormVd.dataConfig.fieldContainer;
        let containers = Array.from(this.option.formDom.querySelectorAll(`[${FormVd.dataConfig.fieldContainer}]`));
        let _this = this;
        let formData = {};
        containers.forEach(function (ele) {
            let field = ele.getAttribute(dataName);
            let data = _this.getFieldData(field);
            formData[field] = data;
        })
        return formData;
    }

    /**
     * 验证一个数据
     * @param {*} 验证的数据
     * @param {object} 验证规则的对象 
     * @param {object} 整个表单的数据
     */

    FormVd.prototype.validateData = function (data, ruleObj, formData) {
        if (typeof (ruleObj.rule) === 'string') { //规则是预设值
            let func = FormVd.validators[ruleObj.rule];
            if (!func) {
                throw new TypeError("rule is not correct");
            }
            if (func(data, formData)) { //验证正确
                return true;
            } else {
                return ruleObj.message
            }

        } else if (ruleObj.rule instanceof RegExp) { //规则是正则表达式
            if (!data) {
                return ruleObj.message;
            }
            if (ruleObj.rule.test(data)) {
                return true
            } else {
                return ruleObj.message
            }

        } else if (typeof (ruleObj.rule) === 'function') {
            return ruleObj.rule(data, formData)
        } else {
            throw new TypeError('rule is not right');
        }
    }

    /**
     * 验证一个form-item表单
     * 
     */

    FormVd.prototype.validateField = function (field, formData) {
        let data = formData[field]; //得到要验证的数据
        let ruleObjs = this.option.formRules[field]; //验证规则数组
        if (!ruleObjs) {
            return true;
        }
        for (var i = 0; i < ruleObjs.length; i++) {
            var ruleObj = ruleObjs[i];
            let res = this.validateData(data, ruleObj, formData);
            if (res !== true) {
                return {
                    field,
                    data,
                    ruleObj,
                    message: res
                }
            }
        }
        return true
    }

    /**
     * 验证整个或部分表单
     * 无参，验证整个表单
     * 有参，验证
     */

    FormVd.prototype.validate = function () {
        let formData = this.getFormData(); //得到所有的表单的值
        let fields;
        if (arguments.length === 0) {
            fields = Object.getOwnPropertyNames(formData);
        } else {
            fields = Array.from(arguments);
        }
        let _this = this;
        var results = fields.map(function (field) {
            return _this.validateField(field, formData);
        }).filter(function (item) {
            return item !== true;
        })
        return results
    }

    /**
     * 得到表单容器'form-item' 1.1
     */

    FormVd.prototype.getFieldContainer = function (field) {
        return this.option.formDom.querySelector(`[${FormVd.dataConfig.fieldContainer}=${field}]`);
    }

    /**
     * 得到form-item下的所有要验证表单元素data-field 1.2
     */

    FormVd.prototype.getFieldElements = function (fieldContainer) {
        return Array.from(fieldContainer.querySelectorAll(`[${FormVd.dataConfig.dataField}]`));
    }

    /**
     * 设置单个表单的状态
     * @param {*} validateResult 该表单项的错误信息，如果是undefined || null, 则没有错误
     * @param {*} field 验证的表单项的名称
     */


    FormVd.prototype.setFieldStatus = function (validateResult, field) {
        let fieldContainer = this.getFieldContainer(field);
        // 得到错误元素
        let errorElement = fieldContainer.querySelector(`[${FormVd.dataConfig.dataFieldError}]`);
        if (!errorElement) { //如果没有data-field-error的元素
            errorElement = fieldContainer.querySelector(`.${FormVd.dataConfig.dataFieldDefaultError}`);
        }
        if (validateResult) { //有错误
            errorElement.innerHTML = validateResult.message;
            fieldContainer.classList.add(this.option.errorClass);
        } else { //没有错误
            fieldContainer.classList.remove(this.option.errorClass);
            if (errorElement) {
                errorElement.innerHTML = "";
            }
        }
    }


    /**
     * 设置整个表单的状态或某个表单的状态
     */

    FormVd.prototype.setStatus = function () {
        if (arguments.length === 0) { //设置全部表达状态
            let formData = this.getFormData();
            var fields = Object.getOwnPropertyNames(formData);
        } else { //设置部分状态
            var fields = Array.from(arguments);
        }
        let results = this.validate.apply(this, fields);
        let _this = this;
        fields.forEach(function (field) {
            //找对应的不符合的，传给setFieldStatus
            let res = results.find(function (item) {
                return item.field === field;
            })
            _this.setFieldStatus(res, field);
        })

    }



    /**
     * 得到所有的表单容器
     */

    FormVd.prototype.getAllContainers = function () {
        let dataName = FormVd.dataConfig.fieldContainer;
        let containers = this.option.formDom.querySelectorAll(`[${dataName}]`);
        return Array.from(containers);
    }

    /**
     * 得到所有要验证的表单元素自定义属性的值
     */

    FormVd.prototype.getAllElement = function () {
        let containers = this.getAllContainers();
        let results = [],
            _this = this;
        containers.forEach(function (ele) {
            let obj = {
                field: ele.getAttribute(`${FormVd.dataConfig.fieldContainer}`)
            }
            obj.doms = _this.getFieldElements(ele);
            results.push(obj);
        })
        return results;
    }

    /**
     * 自定义属性的名字
     */

    FormVd.dataConfig = {
        fieldContainer: "data-field-container", //包裹整个表单的容器
        dataField: 'data-field', //验证的input select 等添加的自定义属性名
        dataFieldProp: 'data-field-prop', //验证的属性 默认是value
        dataFieldDefaultProp: "value", //默认验证的属性
        dataFieldListener: 'data-field-listener', //监听的事件名字 默认监听change事件
        dataFieldDefaultListener: 'change', //默认的监听的事件名
        dataFieldError: 'data-field-error', //错误消息的元素添加的自定义属性名
        dataFieldDefaultError: 'error' //默认错误消息的元素的
    }
    /**
     * 预设的验证规则, 通过返回true, 否则返回false
     */
    FormVd.validators = {
        required: function (data) { //非空验证
            if (!data) {
                return false;
            }
            if (Array.isArray(data) && data.length === 0) {
                return false
            } else {
                return true;
            }
        },
        mail: function (data) {
            if (!data) {
                return false;
            }
            let reg = /^\w+@\w+(\.\w+){1, 2}$/;
            return reg.test(data);
        },
        number: function (data) {
            if (data === null) {
                return false;
            }
            let reg = /^\d+(\.\d+)?$/
            return reg.test(data);
        }
    }


    return function () {
        let container = o$('.container'),
            startLogin = o$('.startLogin'),
            loginFocus = o$('.login-focus');
        //默认是密码登录
        let formValidatorLogin = new FormVd({
            formDom: o$('.form-login'),
            formRules: {
                phone: [{
                        rule: 'required',
                        message: "请输入手机号"
                    },
                    {
                        rule: /^\d{11}$/,
                        message: "手机号格式不正确"
                    }
                ],
                pwd: [
                    {
                        rule: 'required',
                        message: '请输入密码',
                    },
                    {
                        rule: /^.{6,12}$/,
                        message: "密码必须是6-12位"
                    }   
                ],
            },
            errorClass: 'has-error'
        })
        //切换到注册
        o$('.o-register').onclick = function () {
            container.classList.add('right-panel-active');
            formValidatorLogin = null;
            let formValidatorRegsiter = new FormVd({
                formDom: o$('.form-resigter'),
                formRules: {
                    nickName: [{
                        rule: 'required',
                        message: "请输入昵称"
                    }, ],
                    phone: [{
                            rule: 'required',
                            message: "请输入手机号"
                        },
                        {
                            rule: /^\d{11}$/,
                            message: "请输入十一位手机号"
                        }
                    ],
                    pwd: [{
                            rule: 'required',
                            message: '请输入密码',
                        },
                        {
                            rule: /^.{6,12}$/,
                            message: "账号必须是6-12位"
                        }
                    ],
                    validatorCode: [{
                        rule: 'required',
                        message: "输入验证码"
                    }]

                },
                errorClass: 'has-error'
            })
            o$('.startRegister').onclick = function () {
                formValidatorRegsiter.startValidator(true);
            }
            o$('.register-phone').focus();
        }
        //切换到登录
        o$('.o-login').onclick = function () {
            container.classList.remove('right-panel-active');
            let formValidatorLogin = new FormVd({
                formDom: o$('.form-login'),
                formRules: {
                    phone: [{
                            rule: 'required',
                            message: "请输入手机号"
                        },
                        {
                            rule: /^\d{11}$/,
                            message: "请输入十一位手机号"
                        }
                    ],
                    pwd: [{
                        rule: 'required',
                        message: '请输入密码',
                    }, ],
                },
                errorClass: 'has-error'
            })
            startLogin.onclick = function () {
                formValidatorLogin.startValidator(true);
                let userInfo = formValidatorLogin.getFormData();
                if (formValidatorLogin) {
                    ajaxFunc('post', `http://musicapi.leanapp.cn/login/cellphone?phone=${userInfo.phone}&password=${userInfo.pwd}`, callback, true);
                }
            }
        }

        //弹出登录框并获得焦点
        o$('.c-login').onclick = function () {
            container.style.transform = `translateY(0)`
            //自动获得焦点
            loginFocus.focus();
        }

        //点击关闭登录窗口
        o$('.cancle').onclick = function () {
            container.style.transform = `translateY(-73rem)`
        }

        //回车键登录
        window.onkeydown = function (e) {
            if (e.keyCode === 13) {
                startLogin.click();
            }
        }

        let userInfo; //用于保存数据

        //登录
        startLogin.onclick = function () {
            formValidatorLogin.startValidator(true);
            userInfo = formValidatorLogin.getFormData();
            let result = formValidatorLogin.validate();
            if (result.length === 0) {//校验没有错误的时候
                ajaxFunc('post', `http://musicapi.leanapp.cn/login/cellphone?phone=${userInfo.phone}&password=${userInfo.pwd}`, callback, true);
                // 显示loaing框
                o$('.loading').style.display = 'flex';
            }
        }

        // 获取用户每日推荐歌单
        function getDailyList() {
            ajaxFunc('post', 'http://musicapi.leanapp.cn/recommend/songs', getList, true);

            function getList(data) {
                if (JSON.parse(data).recommend) {
                    let times = 0;
                    let str = '';
                    data = JSON.parse(data).recommend;
                    for (let i = 0; i < data.length; i++) {
                        times++;
                        let songName = data[i].name;
                        let res = data[i].artists.map(function (author) {
                            return author.name;
                        })
                        let author = res.join('/');
                        let picUrl = data[i].album.picUrl;
                        let id = data[i].id
                        str += `
                        <a href="./music.html?id=${id}" target="_blank">
                            <li class="daily-item">
                                <div class="d-left">
                                    <img src="${picUrl}" alt="">
                                </div>
                                <div class="d-right">
                                    <p class="d-songName d-cm">${songName}</p>
                                    <p class="d-singer d-cm">${author}</p>
                                </div>
                            </li>
                        </a>
                        `
                        if (times === data.length - 1) { //保证只渲染一次
                            o$('.daily-music').innerHTML = str;
                            o$('.rec-music').style.display = 'block';
                        }
                    }
                } else {
                    o$('.rec-music').style.display = 'none';
                }
            }
        }

        //获得最近播放
        function getRecentPlay(uid) {
            ajaxFunc('post', `http://musicapi.leanapp.cn/user/record?uid=${uid}&type=1`, getList, true);

            function getList(data) {
                if (JSON.parse(data).weekData) {
                    let str = '';
                    let times;
                    data = JSON.parse(data).weekData;
                    /**
                     * 根据点击分页渲染
                     */
                    function renderData(startNum, endNum) {
                        times = startNum;
                        for (let i = startNum; i < endNum; i++) {
                            times++;
                            if (data[i]) {
                                let songName = data[i].song.name;
                                let author = data[i].song.ar[0].name;
                                let id = data[i].song.id;
                                let picUrl = data[i].song.al.picUrl;
                                str += `
                                    <li>
                                        <a href="#"><img src="${picUrl}" alt=""></a>
                                        <div class="desc-wd">
                                            <p>
                                                <a href="#">${songName}</a>
                                            </p>
                                            <p>
                                                <a href="#">${author}</a>
                                            </p>
                                        </div>
                                        <a href="./music.html?id=${id}"
                                            target="_blank" class="ico-play"></a>
                                        <i class="dis-modal"></i>
                                     </li>
                                    `
                                if (times === endNum) { //到达临界点后渲染
                                    o$('.recent-page').style.visibility = 'visible';
                                    o$('.login-items').innerHTML = str;
                                    str = '';
                                    o$('.login-items').classList.remove('isHide')
                                    o$('.dis-items').classList.add('isHide');
                                }
                            }
                        }
                    }
                    renderData(0, 10);
                    let pages = o$('.recent-page .item', true);
                    let len = pages.length;
                    // 得到余数
                    let rest = data.length % 10;
                    // 得到10的倍数的数量
                    let num = (data.length - rest) / 10;
                    for (let i = 0; i < len; i++) {
                        pages[i].onclick = function () {
                            o$('.p-active').classList.remove('p-active');
                            this.classList.add('p-active');
                            if (i < num) {
                                renderData(i * 10, (i + 1) * 10);
                            } else if (rest !== 0) {
                                renderData(i * 10, (i * 10) + rest)
                            } else {
                                renderData(i * 10, (i + 1) * 10);
                            }
                        }
                    }
                }
            }
        }


        //得到用户喜欢的歌单
        function getUserLove() {
            let items = 0; //限制拿回的数据，不然页面太大
            //轮播图
            let oSongList = {
                index: 0,
                init: function (options) {
                    this.initData(options);
                    this.render();
                    this.handle();
                    this.autoMove(++this.index);
                },
                initData: function (options) {
                    this.el = options.el;
                    this.oMain = this.el.getElementsByClassName('f-main')[0];
                    this.oList = this.el.getElementsByClassName('list')[0];
                    this.list = options.list;
                },
                render: function () {
                    let template = '';

                    for (let i = 0; i < this.list.length; i++) {
                        let item = this.list[i];
                        template += `
                      <li 
                        class="item ${i === this.index ? 'active' : ''}" 
                        data-index=${i}
                      >
                        <span class="title">${item.name}</span>
                      </li>
                    `;
                    }

                    this.oList.innerHTML = template;
                },
                handle: function () {
                    this.handleEnter();
                    this.handleLeave();
                },
                handleLeave: function () {
                    let self = this;
                    this.oList.onmouseleave = function () {
                        self.autoMove(self.getIndex(++self.index))
                    }
                },
                handleEnter: function () {
                    let self = this;
                    let oItemMap = this.oList.getElementsByClassName('item');
                    for (let i = 0; i < oItemMap.length; i++) {
                        (function (j) {
                            oItemMap[i].onmouseenter = function () {
                                clearTimeout(self.timer);
                                self.changePic(j);
                                self.index = j;
                            }
                        })(i)
                    }
                },
                autoMove: function (i) {
                    let self = this;

                    this.timer = setTimeout(function () {
                        self.changePic(i);
                        self.autoMove(self.getIndex(++self.index));
                    }, 3000)
                },
                changePic: function (i) {
                    let oItem = this.oList.getElementsByClassName('item')[i];
                    let oActive = this.oList.getElementsByClassName('active')[0];
                    if (oItem === oActive) {
                        return
                    };
                    if (oItem) {
                        oItem.classList.add('active');
                        oActive.classList.remove('active');
                        this.oMain.style.backgroundImage = `url(${this.list[i].img})`;
                    }
                },
                getIndex: function (index) {
                    let maxIndex = this.list.length - 1;

                    if (index > maxIndex) {
                        this.index = 0;
                        return 0;
                    }

                    return index;
                },
            };

            //得到用户喜欢的歌单
            ajaxFunc('post', `http://musicapi.leanapp.cn/login/cellphone?phone=${localStorage.getItem('phone')}&password=${localStorage.getItem('pwd')}`, getUserId, true);

            function getUserId(data) {
                //拿到id
                ajaxFunc('post', `http://musicapi.leanapp.cn/user/playlist?uid=${JSON.parse(data).account.id}`, getSongList, true);
            }

            function getSongList(data) {
                let times = 0;
                let list = []; //存放轮播图所用的图片，歌单名
                let ids = []; //存放id
                // 得到歌单id
                let arr = JSON.parse(data).playlist;
                let len = arr.length;
                if (len > 7) {
                    arr = arr.splice(0, 7);
                    len = arr.length;
                }
                for (let i = 0; i < len; i++) {
                    times++;
                    list.push({
                        name: arr[i].name,
                        img: arr[i].coverImgUrl
                    })
                    ids.push(arr[i].id)
                    if (times === len) {
                        oSongList.init({
                            el: o$('.f-banner'),
                            list: list
                        })
                        onDemand(ids[0])
                        for (let i = 0; i < o$('.list li', true).length; i++) {
                            o$('.list li', true)[i].onclick = function () {
                                onDemand(ids[i]);
                            }
                        }
                    }
                }
            }

            function onDemand(id) {
                let str = '';
                let len;
                let rest, //歌曲数量不是10的倍速的余数
                    tempEndNum; //暂时存的最后的数量
                let demandNum = function () {};
                ajaxFunc('post', `http://musicapi.leanapp.cn/playlist/detail?id=${id}`, songList, true);
                /**
                 * 获取歌曲详情
                 */
                function songList(data) {
                    let arr = JSON.parse(data).playlist.trackIds;
                    len = arr.length;
                    let favoritePage = o$('.f-page');

                    if (len > 10) {
                        favoritePage.innerHTML = '';
                        // 创建分页
                        function createPage() {
                            // 显示分页
                            favoritePage.style.visibility = 'visible';
                            let pageNum = Math.ceil(len / 10);
                            if (pageNum > 22) { //限制数量
                                pageNum = 22;
                            }
                            // 保存起来，统一插到f-page中
                            let fragment = document.createDocumentFragment();
                            for (let i = 0; i < pageNum; i++) {
                                let li = document.createElement('li');
                                li.classList.add('item')
                                li.classList.add(`f-page${i + 1}`);
                                if (i === 0) {
                                    li.classList.add('f-active');
                                }
                                li.innerText = i + 1
                                fragment.appendChild(li);
                            }
                            favoritePage.appendChild(fragment);
                        }
                        createPage()
                        /**
                         * 根据页数加载
                         */
                        demandNum = function (startNum, endNum) {
                            // 重新让items计时
                            items = 0;
                            //  将原来的str内容清零
                            str = '';
                            rest = len % 10;
                            let intNum = len - len % 10;
                            if (startNum === intNum && rest < 10) {
                                endNum = intNum + rest;
                                // 保存到外部，以便渲染时判断
                                tempEndNum = endNum;
                            }
                            for (let i = startNum; i < endNum; i++) {
                                ajaxFunc('get', `http://musicapi.leanapp.cn/song/detail?ids=${arr[i].id}`, myFavorite, true);
                            }
                        }

                        // 默认是0-10条
                        demandNum(0, 10);
                    } else {
                        // 隐藏分页
                        favoritePage.style.visibility = 'hidden';
                        for (let i = 0; i < len; i++) {
                            ajaxFunc('get', `http://musicapi.leanapp.cn/song/detail?ids=${arr[i].id}`, myFavorite, true);
                        }
                    }

                }

                function myFavorite(data) {
                    let id = JSON.parse(data).songs[0].id;
                    let url = JSON.parse(data).songs[0].al.picUrl; //图片
                    let author = JSON.parse(data).songs[0].ar[0].name; //歌手
                    let songName = JSON.parse(data).songs[0].al.name; //歌名
                    render(id, url, author, songName)
                }
                //渲染
                function render(id, url, author, songName) {
                    items++; //目的是判断数量，只插入一次dom
                    if (len > 10) { //数据长度大于10
                        str += `
                            <li class="music-item">
                                <a href="./music.html?id=${id}" target='_blank'><img src="${url}" alt="" target='_blank'></a>
                                <div class="desc">
                                    <p>${author}</p>
                                    <p>${songName}</p>
                                </div> 
                            </li>
                            `
                        if (items === 10 || (tempEndNum % 10 !== 0 && rest === items)) {

                            o$('.favorite-music').innerHTML = str;
                            o$('.o-favorite').style.display = 'block';
                            // 隐藏loading框
                            o$('.loading').style.display = 'none';
                        }
                        let pages = o$('.f-page .item', true);
                        let len = o$('.f-page .item', true).length;
                        for (let i = 0; i < len; i++) {
                            pages[i].onclick = function () {
                                o$('.f-active').classList.remove('f-active');
                                this.classList.add('f-active');
                                demandNum(i * 10, (i + 1) * 10);
                            }
                        }
                    } else {
                        str += `
                        <li class="music-item">
                            <a href="./music.html?id=${id}" target='_blank'><img src="${url}" alt="" target='_blank'></a>
                            <div class="desc">
                                <p>${author}</p>
                                <p>${songName}</p>
                            </div> 
                        </li>
                        `
                        o$('.o-favorite').style.display = 'block';
                        o$('.favorite-music').innerHTML = str;
                        // 隐藏loading框
                        o$('.loading').style.display = 'none';

                    }
                }
            }

        }


        // 刷新时登陆
        if (localStorage.getItem('phone')) {
            ajaxFunc('post', `http://musicapi.leanapp.cn/login/cellphone?phone=${localStorage.getItem('phone')}&password=${localStorage.getItem('pwd')}`, callback, true);
        }

        //  登录之后的到的数据
        function callback(data) {
            let url = JSON.parse(data).profile
            if (!url) {
                o$('.login-container').classList.add('error-login')
            } else { //登录成功
                let cLogin = o$('.c-login'),
                    hNav = o$('.h-nav'),
                    personMsg = o$('.person-msg');
                for (let prop in userInfo) {
                    localStorage.setItem(prop, userInfo[prop]);
                }
                // 改变类名,得到用户头像
                hNav.classList.add('login-register');
                cLogin.classList.add('success-login');
                let successLogin = o$('.success-login');
                successLogin.style.backgroundImage = `url(${JSON.parse(data).profile.avatarUrl})`;
                container.style.transform = `translateY(-73rem)`;
                cLogin.onclick = null;
                successLogin.onmouseenter = personMsg.onmouseenter = function () {
                    personMsg.style.height = "20rem";
                }
                successLogin.onmouseleave = personMsg.onmouseleave = function () {
                    personMsg.style.height = "0rem";
                }
                let uid = JSON.parse(data).profile.userId;

                //设置个人信息的地址
                o$('.p-info').href = `./userDetail.html?id=${uid}`

                //获取用户最近播放
                getRecentPlay(uid)
                // 得到用户每日推荐歌单
                getDailyList();


                getUserLove();
                //登出
                o$('.logout').onclick = function () {
                    //清除localStore
                    localStorage.clear();
                    //清除类名
                    hNav.classList.remove('login-register');
                    successLogin.style.backgroundImage = '';
                    successLogin.onmouseenter = null;
                    cLogin.classList.remove('success-login');
                    personMsg.style.height = '0';
                    //弹出登录框并获得焦点
                    cLogin.onclick = function () {
                        container.style.transform = `translateY(0)`
                        //自动获得焦点
                        loginFocus.focus();
                    }
                    //将用户喜欢的歌单清空
                    o$('.favorite-music').innerHTML = ''
                    o$('.o-favorite').style.display = 'none'
                    o$('.isHide').classList.remove('isHide')
                    o$('.login-items').classList.add('isHide')
                    //回到主页面
                    o$('.main').style.transform = 'translateX(0%)';
                    o$('.my-favorite').style.transform = 'translateX(100%)'
                    o$('.active').classList.remove('active');
                    this.classList.add('active');
                }
            }
        }
        //注册
        o$('.getValidatorCode').onclick = function () {
            let validatorPhone = o$('.validator-phone'),
                isShow = o$('.is-show'),
                phoneError = o$('.phone-error'),
                registerPhone = o$('.register-phone'),
                dataValidator = o$('.data-validator');
            //校验手机号
            if (dataValidator.value && /^\d{11}$/.test(dataValidator.value)) {
                isShow.style.display = 'block';
                isShow.style.opacity = '1';
                validatorPhone.style.opacity = 0;
                validatorPhone.style.display = 'none';
            } else if (dataValidator.value.length !== 11) { //手机号位数不够
                phoneError.innerText = "请您输入十一位手机号"
                registerPhone.classList.add('has-error');
            } else if (!/^\d+$/.test(dataValidator.value)) { //不是数字
                phoneError.innerText = "请您输入十一位数字的手机号"
                registerPhone.classList.add('has-error');
            } else if (!dataValidator.value) { //没有输入值
                phoneError.innerText = "请您输入手机号"
                registerPhone.classList.add('has-error');
            }
        }

    }
}())

/**
 * 轮播图
 */
let banner = (function () {
    return function () {
        let index = 0;
        let timer = null;
        let liNames = [];
        let spans,
            lis,
            len;
        ajaxFunc('post', 'http://musicapi.leanapp.cn/banner', bannerCallback, true);
        /**
         * 动态获取轮播图
         */
        function bannerCallback(data) {
            data = JSON.parse(data).banners;
            len = data.length;
            let str = "";
            let fragment = document.createDocumentFragment();
            for (let i = 0; i < len; i++) {
                str += `<li class='item${i + 1}'><a href="./music.html?id=${data[i].url.split('=')[1]}" target='_blank'><img src="${data[i].picUrl}" alt=""></a></li>`
                liNames.push(`item${i + 1}`)
                //动态创建span元素
                let span = document.createElement('span');
                if (i === 0) {
                    span.className = 'active';
                }
                fragment.appendChild(span);
            }
            o$('.wrapper-img').innerHTML = str;
            o$('.wrap-banner .dots').appendChild(fragment);
            imgs = o$('.b-imgs');
            spans = Array.from(o$('.dots span', true));
            lis = o$('.wrapper-img li', true);

            function setBg() {
                url = o$('.b-imgs .item2 img').src;
                o$('.wrap-banner').style.backgroundImage = `url('${url}')`
            }
            setBg()
            /**
             * 设置小圆点的状态
             */
            function setDotState(index) {
                let len = spans.length;
                for (let i = 0; i < len; i++) {
                    if (i === index) {
                        spans[i].classList.add('active');
                    } else {
                        spans[i].classList.remove('active');
                    }
                }
            }
            /**
             * 点击下一张
             */
            function next() {
                //将最后一个名字放到第一个
                liNames.unshift(liNames[liNames.length - 1]);
                //删掉最后一个名字
                liNames.pop();
                for (let i = 0; i < lis.length; i++) {
                    lis[i].className = liNames[i];
                }
                //设置背景
                setBg();
                index++;
                if (index === len) {
                    index = 0;
                }
                setDotState(index);
            }

            /**
             * 点击上一张
             */
            function prev() {
                //将第一名字放到最后一张
                liNames.push(liNames[0]);
                //将第一名字去掉
                liNames.shift();
                for (let i = 0; i < liNames.length; i++) {
                    lis[i].className = liNames[i];
                }
                //设置背景
                setBg()
                index--;
                if (index < 0) {
                    index = lis.length - 1;
                }
                setDotState(index)
            }

            o$('.right-arrow').onclick = function () {
                stop();
                next()
            }

            o$('.left-arrow').onclick = function () {
                stop();
                prev()
            }

            timer = setInterval(function () {
                next()
            }, 3000)

            imgs.onmouseenter = function () {
                stop();
            }

            imgs.onmouseleave = function () {
                timer = setInterval(function () {
                    next()
                }, 3000)
            }

            function stop() {
                clearInterval(timer)
            }

            spans.forEach(function (ele) {
                ele.onmouseenter = function () {
                    stop();
                    let curIndex = spans.indexOf(this);
                    let dis = curIndex - index;
                    if (dis === 0) { //索引值等于当前，不变
                        return;
                    } else if (dis > 0) { //向左翻
                        for (let i = 0; i < dis; i++) {
                            liNames.unshift(liNames[liNames.length - 1]);
                            liNames.pop();
                        }
                    } else if (dis < 0) { //向右翻
                        liNames.push(liNames[0]);
                        liNames.shift();
                    }
                    for (let i = 0; i < liNames.length; i++) {
                        lis[i].className = liNames[i];
                    }
                    setBg();
                    index = curIndex;
                    setDotState(index)
                }
                ele.onmouseleave = function () { //鼠标移出后重新打开定时器
                    timer = setInterval(function () {
                        next()
                    }, 3000)
                }
            })
        }
    }
}())

/**
 * 排行榜
 */

let rank = (function () {
    return function () {
        var imgShow = o$('.rank-wrapper')
        var imgItems = Array.from(o$('.rank-items .item', true));
        var closes = Array.from(o$('.close', true));



        let timer = setTimeout(() => {
            imgShow.classList.remove('init')
        }, 1000)

        closes.forEach((ele) => {
            ele.onclick = (e) => {
                e.stopPropagation();
                Array.from(o$('.rank-items .item', true)).forEach((ele) => {
                    ele.classList.remove('active')
                })
                imgShow.classList.remove('w-active');
            }
        })

        // 获取排行榜数据
        let times = 0;
        let str = '';

        function getTopList(idx, dom) {
            ajaxFunc('post', `http://musicapi.leanapp.cn/top/list?idx=${idx}`, render, true);

            function render(data) {
                data = JSON.parse(data).playlist.tracks
                for (let i = 0; i < data.length; i++) {
                    times++;
                    let id = data[i].id;
                    let songName = data[i].al.name;
                    let author = data[i].ar[0].name;
                    str += `
                    <li>
                        <a href="./music.html?id=${id}" target="_blank">
                            <span>${author}</span> -
                            <span>${songName}</span>
                        </a>
                     </li>
                    `
                    if (times === 21) {
                        times = 0
                        dom.innerHTML = str;
                        str = ''
                    }
                }
            }
        }

        o$('.btn', true)[0].onclick = function () {
            change(1, 0, o$('.more1'))
        }

        o$('.btn', true)[1].onclick = function () {
            change(0, 1, o$('.more2'))
        }

        o$('.btn', true)[2].onclick = function () {
            change(3, 2, o$('.more3'))
        }

        o$('.btn', true)[3].onclick = function () {
            change(18, 3, o$('.more4'))
        }

        o$('.btn', true)[4].onclick = function () {
            change(12, 4, o$('.more5'))
        }

        function change(idx, num, dom) {
            getTopList(idx, dom)
            imgItems[num].classList.add('active');
            imgShow.classList.add('w-active');
        }
    }
}())

/**
 * mv轮播
 */

let hotMv = (function () {
    return function () {
        // 拿回mv数据
        ajaxFunc('post', 'http://musicapi.leanapp.cn/top/mv?limit=10', getMvItem, true);

        function getMvItem(data) {
            let times = 0;
            let str = '';
            data = JSON.parse(data).data;
            for (let i = 0; i < data.length / 2; i++) {
                times++;
                let id = data[i].id;
                //因为是两张图片一个轮播,所以获取1对6 2对7的数据...
                let id2 = data[((data.length / 2)) + i].id;
                let imgUrl = data[i].cover;
                let imgUrl2 = data[((data.length / 2)) + i].cover;
                let songName = data[i].name;
                let songName2 = data[((data.length / 2)) + i].name;
                let author = data[i].artistName;
                let author2 = data[((data.length / 2)) + i].artistName;
                str += `
                <div class='wrap-img'>
                    <a href="./mv.html?id=${id}" target='_blank'>
                        <img src="${imgUrl}"
                        alt="">
                        <div class='desc'>
                            <p>${songName}</p>
                            <p>${author}</p>
                        </div>
                    </a>
                    <a href="./mv.html?id=${id2}" target='_blank'>
                        <img src="${imgUrl2}" alt="">
                        <div class='desc'>
                            <p>${songName2}</p>
                            <p>${author2}</p>
                        </div>
                    </a>
                </div>
                `
                if (times === data.length / 2) {
                    o$('.imgs').innerHTML = str;
                    //配置对象
                    let config = {
                        imgWidth: 1070, //图片的宽度
                        dotWidth: 12, //圆点的宽度
                        doms: {
                            divBanner: o$('.r-banner'),
                            divImgs: o$('.imgs'),
                            divDots: o$('.r-dots'),
                            divArrow: o$('.r-arrow'),
                        },
                        currentIndex: 0, //实际的图片索引   0~ imgNumbers - 1
                        timer: { // 计时器配置
                            duration: 16, //运动间隔时间  浏览器重绘时间大概就是16毫秒
                            total: 800, // 运动的总时间
                            id: null // 计时器的Id
                        },
                        autoMove: null
                    };
                    config.imgNumbers = config.doms.divImgs.children.length;
                    //初始化元素尺寸
                    function initSize() {
                        config.doms.divImgs.style.width = config.imgWidth * (config.imgNumbers + 2) + 'px';
                        config.doms.divDots.style.width = config.dotWidth * config.imgNumbers + 'px';
                    }

                    //初始化元素
                    function initElement() {
                        //创建小圆点
                        for (var i = 0; i < config.imgNumbers; i++) {
                            config.doms.divDots.appendChild(document.createElement('span'));
                        }

                        //复制图片
                        var children = config.doms.divImgs.children;
                        var newImgFirst = children[0].cloneNode(true);
                        var newImgLast = children[config.imgNumbers - 1].cloneNode(true);
                        config.doms.divImgs.appendChild(newImgFirst);
                        config.doms.divImgs.insertBefore(newImgLast, children[0]);
                    }

                    // 初始化位置 
                    function initPosition() {
                        //图片位置
                        var left = (-config.currentIndex - 1) * config.imgWidth;
                        config.doms.divImgs.style.marginLeft = left + 'px';
                    }

                    // 设置小圆点的状态
                    function setDotStatus() {
                        for (var i = 0; i < config.doms.divDots.children.length; i++) {
                            var dot = config.doms.divDots.children[i];
                            if (i == config.currentIndex) {
                                dot.className = 'active';
                            } else {
                                dot.className = '';
                            }
                        }
                    }

                    //初始化开关
                    function init() {
                        initSize();
                        initElement();
                        initPosition();
                        setDotStatus();
                    }

                    init();



                    /**
                     * 切换图片
                     * @param {*} index 
                     * @param {*} direction 
                     */

                    function switchTo(index, direction) {
                        //切换到自身
                        if (config.currentIndex === index) {
                            return;
                        }

                        //没有给定方向
                        if (!direction) {
                            direction = 'left';
                        }
                        // 移动到的目标的marginLeft
                        var newLeft = (-index - 1) * config.imgWidth;
                        // config.doms.divImgs.style.marginLeft = newLeft + 'px';
                        animateSwitch(); //调用该函数 慢慢改变marginLeft

                        //重新设置索引, 并且重新调用函数调整点的状态
                        config.currentIndex = index;
                        setDotStatus();

                        /**
                         * 设置动画，慢慢变化图片 即逐步改变marginLeft
                         */
                        function animateSwitch() {
                            //每次调用时清除原来计时器计时器
                            stopAnimate();

                            //1 计算运动的次数  
                            var number = Math.ceil(config.timer.total / config.timer.duration);

                            // 2 计算移动到目标的总距离
                            var distance,
                                curMarginLeft = parseFloat(getComputedStyle(config.doms.divImgs).marginLeft);
                            // console.log(curMarginLeft);
                            if (direction === 'left') { //默认从右向左移动  图片向左移动
                                if (newLeft < curMarginLeft) { //目标的marginLeft < 当前所在的marginLeft
                                    distance = newLeft - curMarginLeft;
                                } else { //   目标的marginLeft > 当前所在的marginLeft 即转一圈 大小算正负
                                    distance = -(config.imgNumbers * config.imgWidth - Math.abs(newLeft - curMarginLeft));
                                    //从右向左移动时移动的是负的
                                }
                            } else { //从左向右移动  图片向右移动
                                if (newLeft > curMarginLeft) { //目标的marginLeft > 当前的marginLeft
                                    distance = newLeft - curMarginLeft;
                                } else { // 目标的marginLeft < 当前的marginLeft
                                    // distance = config.doms.imgNumbers * config.imgWidth - Math.abs(newLeft - curMarginLeft);
                                    distance = config.imgNumbers * config.imgWidth - Math.abs(newLeft - curMarginLeft);
                                }
                            }
                            // console.log(distance);

                            // 3 计算每次移动的距离
                            var everyDistance = distance / number;

                            // 当前的次数
                            var curNumber = 0;
                            config.timer.id = setInterval(function () {
                                //改变divImgs的marginLeft
                                curMarginLeft += everyDistance;

                                //无缝衔接
                                var totalWid = config.imgNumbers * config.imgWidth;
                                if (direction === 'left' && Math.abs(curMarginLeft) > totalWid) { //图片向左走 到临界值
                                    curMarginLeft += totalWid;
                                } else if (direction === 'right' && Math.abs(curMarginLeft) < config.imgWidth) { //图片向右走到临界值
                                    curMarginLeft -= totalWid;
                                }
                                // console.log(curMarginLeft, everyDistance);
                                config.doms.divImgs.style.marginLeft = curMarginLeft + 'px';
                                curNumber++;
                                if (curNumber === number) { //到达运动的次数  即图片刚好到目标点
                                    stopAnimate();
                                }

                            }, config.timer.duration)
                        }

                        //清除计时器
                        function stopAnimate() {
                            clearInterval(config.timer.id);
                            config.timer.id = null;
                        }
                    }

                    //注册事件 左右
                    config.doms.divArrow.onclick = function (e) {
                        if (e.target.className == 'arrow-left') {
                            toLeft();
                        } else if (e.target.classList.contains('arrow-right')) {
                            toRight();
                        }
                    }

                    function toLeft() {
                        var index = config.currentIndex - 1;
                        if (index < 0) {
                            index = config.imgNumbers - 1;
                        }
                        switchTo(index, 'right')
                    }

                    function toRight() {
                        var index = config.currentIndex + 1;
                        if (index > config.imgNumbers - 1) {
                            index = 0;
                        }
                        // var index = (config.currentIndex + 1) % config.imgNumbers;
                        switchTo(index, 'left');

                    }

                    //注册点击小圆点的事件

                    config.doms.divDots.onclick = function (e) {
                        if (e.target.tagName === 'SPAN') {
                            var target = Array.from(this.children).indexOf(e.target);
                            dots(target);
                        }

                    }

                    function dots(target) {
                        switchTo(target, target > config.currentIndex ? 'left' : 'right');
                    }

                    //自动移动，当鼠标移上去时停止

                    config.autoMove = setInterval(function () {
                        var index = config.currentIndex + 1;
                        if (index > config.imgNumbers - 1) {
                            index = 0;
                        }
                        switchTo(index, 'left');
                    }, 3000)

                    config.doms.divBanner.onmouseenter = function () {
                        clearInterval(config.autoMove);
                        config.autoMove = null; // 要想下次使用，必须设置为null
                    }

                    config.doms.divBanner.onmouseleave = function () {
                        if (config.autoMove) {
                            return; //什么都不做
                        } else {
                            config.autoMove = setInterval(function () {
                                var index = config.currentIndex + 1;
                                if (index > config.imgNumbers - 1) {
                                    index = 0;
                                }
                                switchTo(index, 'left');
                            }, 3000)
                        }
                    }
                }
            }
        }

    }
}())

/**
 * 推荐音乐
 */

let mvRotate = (function () {
    return function () {
        function getSortSong(idx) {
            let str = '';
            let times = 0;
            if (arguments.length > 0) {
                ajaxFunc('post', `http://musicapi.leanapp.cn/top/list?idx=${idx}`, getSongs, true);
            } else {
                ajaxFunc('post', 'http://musicapi.leanapp.cn/personalized/newsong', getLasestSongs, true);
            }
            //默认是新歌
            function getLasestSongs(data) {

                data = JSON.parse(data).result;
                for (let i = 0; i < data.length; i++) {
                    times++;
                    let id = data[i].id;
                    let songName = data[i].name;
                    let author = data[i].song.album.artists[0].name;
                    let picUrl = data[i].picUrl;
                    str += `
                    <li class='mv-item'>
                    <div class="picbox">
                        <div class="show"><img src="${picUrl}" alt=""></div>
                        <div class="hide">
                            <p>
                                <a href="#">${songName}</a>
                            </p>
                            <p><a href="#">${author}</a></p>
                            <a href='./music.html?id=${id}' class='play' target='_blank'></a>
                        </div>
                    </div>
                </li>
                    `
                    if (times === data.length) {
                        o$('.lastest-items').innerHTML = str
                        var lis = Array.from(o$('.mv-item', true));
                        lis.forEach((ele, index) => {
                            ele.addEventListener('mouseenter', function (e) {
                                addClass(e, ele, 'i')
                            })

                            ele.addEventListener('mouseleave', function (e) {
                                addClass(e, ele, 'o')
                            })
                        })
                        o$('.lastest-recommend .m-title').style.display = 'block';
                        o$('.lastest-recommend .sort-nav').style.display = 'block';

                        function addClass(e, ele, state) {
                            //判断鼠标进入的方向后添加类名 
                            var x = e.offsetX - ele.offsetWidth / 2;
                            var y = e.offsetY - ele.offsetHeight / 2;
                            // 求角度 0上 1 右 2下 3左
                            var angle = (Math.round((Math.atan2(y, x) * (180 / Math.PI) + 180) / 90) + 3) % 4;
                            var direction;
                            switch (angle) {
                                case 0:
                                    direction = 'top';
                                    break;
                                case 1:
                                    direction = 'right';
                                    break;
                                case 2:
                                    direction = 'bottom';
                                    break;
                                case 3:
                                    direction = 'left'
                                    break;
                            }
                            ele.className = state + '-' + direction;
                        }
                        times = 0;
                        str = '';
                    }
                }
            }
            //其他类的
            function getSongs(data) {
                data = JSON.parse(data).playlist.tracks
                for (let i = 0; i < data.length; i++) {
                    times++;
                    let id = data[i].id;
                    let songName = data[i].al.name;
                    let picUrl = data[i].al.picUrl;
                    let author = data[i].ar[0].name;
                    str += `
                    <li class='mv-item'>
                    <div class="picbox">
                        <div class="show"><img src="${picUrl}" alt=""></div>
                        <div class="hide">
                            <p>
                                <a href="#">${songName}</a>
                            </p>
                            <p><a href="#">${author}</a></p>
                            <a href='./music.html?id=${id}' class='play' target='_blank'></a>
                        </div>
                    </div>
                </li>
                    `
                    if (times === 10) { //推荐音乐数据
                        o$('.lastest-items').innerHTML = str
                        var lis = Array.from(o$('.mv-item', true));
                        lis.forEach((ele, index) => {
                            ele.addEventListener('mouseenter', function (e) {
                                addClass(e, ele, 'i')
                            })

                            ele.addEventListener('mouseleave', function (e) {
                                addClass(e, ele, 'o')
                            })
                        })
                        o$('.lastest-recommend .m-title').style.display = 'block';
                        o$('.lastest-recommend .sort-nav').style.display = 'block';

                        function addClass(e, ele, state) {
                            //判断鼠标进入的方向后添加类名 
                            var x = e.offsetX - ele.offsetWidth / 2;
                            var y = e.offsetY - ele.offsetHeight / 2;
                            // 求角度 0上 1 右 2下 3左
                            var angle = (Math.round((Math.atan2(y, x) * (180 / Math.PI) + 180) / 90) + 3) % 4;
                            var direction;
                            switch (angle) {
                                case 0:
                                    direction = 'top';
                                    break;
                                case 1:
                                    direction = 'right';
                                    break;
                                case 2:
                                    direction = 'bottom';
                                    break;
                                case 3:
                                    direction = 'left'
                                    break;
                            }
                            ele.className = state + '-' + direction;
                        }
                        times = 0;
                        str = '';
                    }
                }
            }
        }
        o$('.nav-items').onclick = function (e) {
            if (e.target.tagName === 'SPAN') {
                o$('.wd-active').classList.remove('wd-active')
                e.target.classList.add('wd-active')
                if (e.target.classList.contains('gt')) { //港台
                    getSortSong(14)
                } else if (e.target.classList.contains('hy')) { //华语
                    getSortSong(17)
                } else if (e.target.classList.contains('hg')) { //韩国
                    getSortSong(11)
                } else if (e.target.classList.contains('rb')) { //日本
                    getSortSong(10)
                } else if (e.target.classList.contains('qt')) { //其他
                    getSortSong(3);
                } else if (e.target.classList.contains('nd')) { //内地
                    getSortSong();
                }
            }
        }
        getSortSong();
    }
}())

/**
 * 歌手
 */

let showSinger = (function () {
    return function () {
        /**
         * 根据偏移量和限制数量发送请求
         */
        function getPageData(offset, limit) {
            ajaxFunc('post', `http://musicapi.leanapp.cn/top/artists?offset=${offset}&limit=${limit}`, getSingerInfo, true);
        }
        /**
         * 处理请求回来的数据
         */
        function getSingerInfo(data) {
            let times = 0;
            let str = '';
            data = JSON.parse(data).artists;
            for (let i = 0; i < data.length; i++) {
                times++;
                let name = data[i].name;
                let picUrl = data[i].picUrl;
                let id = data[i].id
                str += `
                <li class="box">
                    <a href='./music.html?sid=${id}' target= "_blank">
                        <div class='img'>
                            <img src="${picUrl}" alt="">
                        </div>
                        <div class="box-bg">
                        ${name}
                        </div>
                    </a>
                </li>
                
                `
                if (times === data.length) {
                    o$('.wrap-box').innerHTML = str;
                    o$('.singer-page').style.visibility = 'visible';
                    var divBoxs = o$('.box', true);
                    var divBgs = o$('.box-bg', true);
                    divBoxs.forEach(function (box) {
                        box.addEventListener('mouseenter', function (e) {
                            addClass(e, box, 'in');
                        })
                    })

                    for (let i = 0; i < divBoxs.length; i++) {
                        divBoxs[i].addEventListener('mouseenter', function (e) {
                            addClass(e, divBgs[i], 'in');
                        })
                        divBoxs[i].addEventListener('mouseleave', function (e) {
                            addClass(e, divBgs[i], 'out')
                        })
                    }
                    /**
                     * 添加和移出类名以达到效果
                     */
                    function addClass(e, ele, state) {
                        ele.style.display = 'block';
                        var x = e.offsetX - ele.offsetWidth / 2;
                        var y = e.offsetY - ele.offsetHeight / 2;
                        // 求角度 0上 1 右 2下 3左
                        var angle = (Math.round((Math.atan2(y, x) * (180 / Math.PI) + 180) / 90) + 3) % 4;
                        // var direction;
                        switch (angle) {
                            case 0:
                                removeClass(ele)
                                ele.classList.add(`${state}-top`)
                                break;
                            case 1:
                                removeClass(ele)
                                ele.classList.add(`${state}-right`)
                                break;
                            case 2:
                                removeClass(ele)
                                ele.classList.add(`${state}-bottom`)
                                break;
                            case 3:
                                removeClass(ele)
                                ele.classList.add(`${state}-left`)
                                break;
                        }

                        function removeClass(divBg) {
                            divBg.classList.remove('in-top')
                            divBg.classList.remove('in-right')
                            divBg.classList.remove('in-left')
                            divBg.classList.remove('in-bottom')
                            divBg.classList.remove('out-top')
                            divBg.classList.remove('out-left')
                            divBg.classList.remove('out-right')
                            divBg.classList.remove('out-bottom')
                        }
                    }
                }
            }
        }
        getPageData(0, 10);
        let pages = o$('.singer-page .item', true)
        let len = pages.length;
        for (let i = 0; i < len; i++) {
            pages[i].onclick = function () {
                o$('.s-active').classList.remove('s-active');
                this.classList.add('s-active');
                getPageData(i * 10, 10);
            }
        }
    }
}())

/**
 * 导航栏切换
 */

let navSwitch = (function () {
    return function () {
        let oMain = o$('.main');
        let myFavorite = o$('.my-favorite');
        //导航栏切换
        o$('.o-favorite').onclick = function (e) {
            oMain.style.transform = 'translateX(-100%)';
            myFavorite.style.transform = 'translateX(0)'
            o$('.active').classList.remove('active');
            this.classList.add('active');
        }

        o$('.nav-main').onclick = function (e) {
            oMain.style.transform = 'translateX(0%)';
            myFavorite.style.transform = 'translateX(100%)'
            o$('.active').classList.remove('active');
            this.classList.add('active');
        }
    }
}())


/**
 * 启动所有函数的初始化函数
 */

function init() {
    banner();
    hotMv();
    rank();
    showSinger();
    mvRotate();
    search();
    login();
    navSwitch();
    // rainMove();
}

init();