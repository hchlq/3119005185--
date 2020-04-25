/**
 * 轮播图
 */
var banner = (function () {
    return function () {
        var imgs = document.querySelectorAll('.banner img');
        var leftArrow = document.querySelector('.left-arrow');
        var rightArrow = document.querySelector('.right-arrow');
        var spans = document.querySelectorAll('.dots span');
        var dots = document.querySelector('.dots');
        var mainBanner = document.querySelector('.main-banner');
        var oIndex = 0;

        function animation() {
            oIndex = oIndex % 9;
            if (oIndex < 0) {
                oIndex = 9;
            }
            _arguments = arguments
            var animate = new Animate({
                duration: 30,
                total: 3000,
                begin: {
                    opacity: 0,
                    r: getRandomNum(0, 255),
                    g: getRandomNum(0, 255),
                    b: getRandomNum(0, 255)
                },
                end: {
                    opacity: 1,
                    r: getRandomNum(0, 255),
                    g: getRandomNum(0, 255),
                    b: getRandomNum(0, 255),
                },
                onchange() {
                    rightArrow.onclick = () => {
                        this.stop()
                        initElement()
                        oIndex++;
                        animation(..._arguments);
                        changeDotState(oIndex)
                    }
                    leftArrow.onclick = () => {
                        this.stop();
                        initElement();
                        oIndex--;
                        animation(..._arguments);
                        changeDotState(oIndex)
                    }

                    dots.onclick = (e) => {
                        if (e.target.tagName === 'SPAN') {
                            var index = Array.from(dots.children).indexOf(e.target);
                            if (index === oIndex) {
                                return;
                            }
                            this.stop();
                            initElement();
                            oIndex = index;
                            animation(..._arguments);
                            changeDotState(oIndex)
                        }
                    }
                    mainBanner.style.background = `rgba(${this.currentState.r}, ${this.currentState.g}, ${this.currentState.b})`
                    _arguments[oIndex].style.opacity = 1;
                },
                onover() {
                    initElement()
                    oIndex++;
                    animation(..._arguments)
                    changeDotState(oIndex);
                    _arguments[oIndex].style.opacity = 0;

                }
            })
            animate.start()
        }


        function getRandomNum(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min)
        }

        function initial(dom) {
            dom.style.opacity = '0';
        }

        function initElement() {
            for (var i = 0; i < imgs.length; i++) {
                initial(imgs[i]);
            }
        }

        function changeDotState(index) {
            for (var i = 0; i < spans.length; i++) {
                spans[i].className = '';
                spans[index].className = 'active';
            }
        }


        function init() {
            initElement()
            animation(...imgs)
        }
        init();
    }
}())

/**
 * 精彩推荐轮播
 */

var hotRecommend = (function () {
    return function () {
        //配置对象
        var config = {
            imgWidth: 1070, //图片的宽度
            dotWidth: 12, //圆点的宽度
            doms: {
                divBanner: document.querySelector('.r-banner'),
                divImgs: document.getElementsByClassName('imgs')[0],
                divDots: document.querySelector('.r-banner .r-dots'),
                divArrow: document.getElementsByClassName('r-arrow')[0],
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
            if (e.target.className == 'left') {
                toLeft();
            } else if (e.target.classList.contains('right')) {
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
                }, 2000)
            }
        }
    }
}())



/**
 * 排行榜
 */

var rank = (function () {
    return function () {
        var imgShow = document.querySelector('.rank-wrapper')
        var imgItems = Array.from(document.querySelectorAll('.item'));
        var closes = Array.from(document.querySelectorAll('.close'));
        var btns = Array.from(document.querySelectorAll('.inner .btn'));



        let timer = setTimeout(() => {
            imgShow.classList.remove('init')
        }, 1000)

        for (let i = 0; i < btns.length; i++) {
            btns[i].onclick = function () {
                imgItems[i].classList.add('active');
                imgShow.classList.add('w-active');
            }
        }

        closes.forEach((ele) => {
            ele.onclick = (e) => {
                e.stopPropagation();
                Array.from(document.querySelectorAll('.item')).forEach((ele) => {
                    ele.classList.remove('active')
                })
                imgShow.classList.remove('w-active');
            }
        })
    }
}())

/**
 * 歌手介绍
 */

var showSinger = (function () {
    return function () {
        var divBoxs = document.querySelectorAll('.box');
        var divBgs = document.querySelectorAll('.box-bg');
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
}())

/**
 * MV
 */

var mvRotate = (function () {
    return function () {
        var lis = Array.from(document.querySelectorAll('.mv-item'));
        lis.forEach((ele, index) => {
            ele.addEventListener('mouseenter', function (e) {
                addClass(e, ele, 'i')
            })

            ele.addEventListener('mouseleave', function (e) {
                addClass(e, ele, 'o')
            })
        })

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
            console.log(state + '-' + direction)
        }
    }
}())

/**
 * 侧栏播放器
 */

var asidePlayer = (function () {
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
            // prograssWidth: $('.prograss').offsetWidth,
            // curDom: $('.current'),
            musicPics: [],
            oAudio: $('.audio')
        }
        let musicConfig = Object.assign({}, defaultConfig, options);
        console.log(musicConfig)
        $('.audio').src = musicConfig.musicArr[0];
        /**
         * 点击播放暂停
         */
        $('.start').onclick = function () {
            console.log(this, 11)
            if (!musicConfig.playState) {
                $('.cube-container').style.animationPlayState = 'running'
                play();
            } else {
                play('pause');
                $('.cube-container').style.animationPlayState = 'paused'
            }
        }

        /**
         * 点击播放上一首
         */
        $('.prev').onclick = function () {
            $('.cube-container').style.animationPlayState = 'running'
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
            $('.cube-container').style.animationPlayState = 'running'
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
        }

        /**
         * 播放或暂停
         * @param {*} state 
         */
        function play(state) {
            if (state === 'pause') {
                $('.audio').pause();
                musicConfig.playState = false;
            } else {
                musicConfig.oAudio.play();
                musicConfig.playState = true;
            }
        }

        $('.audio').onended = function () {
            musicConfig.oIndex ++
            if (musicConfig.oIndex === musicConfig.musicArr.length) {
                musicConfig.oIndex = 0
            }
            changeMusic(musicConfig.oIndex)
            play();
        }

        /**
         * 根据时间变化进度条改变
         */
        // $('.audio').addEventListener('timeupdate', prograssMove);

        /**
         * 随机播放
         */

        function randomPlay() {
            musicConfig.musicArr = musicConfig.musicArr.sort(function () {
                return Math.random() - 0.5;
            })
        }
    }
   
    return function () {
        var cubePlayer = document.querySelector('.cube-container');
        // var prev = document.querySelector('.prev');
        // var next = document.querySelector('.next');
        // var start = document.querySelector('.start');
        // var state = false;
        // cubePlayer.style.animationPlayState = 'running';
        // cubePlayer.style.animationPlayState = 'paused';
        let options = {
            musicArr: ['./music/song_1.mp3', './music/song_2.mp3', './music/song_3.mp3'],
            musicPics: ['./music/song_1.jpg', './music/song_2.jpg', './music/song_3.jpg'],
        }
        player(options)
    }
}())


/**
 * 启动所有函数的初始化函数
 */

function init() {
    banner();
    hotRecommend();
    rank();
    showSinger();
    mvRotate();
    asidePlayer()
}

init();