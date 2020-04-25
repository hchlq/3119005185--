/**
 * 动画插件
 * @param {Object} options 
 */

Animate.prototype.start = function () {
    if (this.timer || this.currentNumber === this.number) {
        return;
    }
    if (this.option.onstart) {
        this.option.onstart.call(this);
    }
    this.timer = setInterval(() => {
        this.currentNumber++;
        for (var prop in this.currentState) {
            // 最后一次运动
            if (this.currentNumber === this.number) {
                this.currentState[prop] = this.option.end[prop]
            } else {
                this.currentState[prop] += this.everyDistance[prop];
            }
        }
        if (this.option.onchange) {
            this.option.onchange.call(this);
        }
        if (this.currentNumber === this.number) {
            if (this.option.onover) {
                this.option.onover.call(this);
            }
            this.stop()
        }

    }, this.option.duration)
}

Animate.prototype.stop = function () {
    clearInterval(this.timer);
    timer = null;
}

function Animate(options) {
    var defaultOptions = {
        duration: 16, //默认事件是16毫秒
        total: 1000, //默认总时间
        begin: {},
        end: {}
    }
    this.option = Object.assign({}, defaultOptions, options);
    this.timer = null;
    this.number = Math.ceil(this.option.total / this.option.duration); //总运动的次数
    this.currentNumber = 0; //当前运动的次数
    this.currentState = clone(this.option.begin);
    // 计算总距离
    this.dis = {};
    // 所有属性每次运动的距离
    this.everyDistance = {};
    for (var prop in this.option.begin) {
        this.dis[prop] = this.option.end[prop] - this.option.begin[prop];
        this.everyDistance[prop] = this.dis[prop] / this.number;
    }
}

/**
 * 克隆对象
 * @param {*} obj 
 * @param {*} deep 是否深度克隆
 */
function clone(obj, deep) {

    if (Array.isArray(obj)) { //数组
        if (deep) {
            var arr = [];
            for (var i = 0; i < obj.length; i++) {
                arr.push(clone(obj[i], deep));
            }
            return arr;
        } else {
            return obj.slice();
        }

    } else if (typeof (obj) === "object") { //普通对象
        var newObj = {};
        for (var prop in obj) {
            if (deep) { //深度克隆
                newObj[prop] = clone(obj[prop], deep);
            } else {
                newObj[prop] = obj[prop];
            }
        }
        return newObj;
    } else { //函数、原始类型
        return obj; //递归出口
    }
}