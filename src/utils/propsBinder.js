/**
 * propsBinder是通过监听props的变动，将变化的prop作用到leaflet对象上
 *
 * */

//首字母大写
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function (vueElement, leafletElement, props) {
    const keys = Object.keys(props);
    for (var i = 0; i < keys.length; i++) {
        const key = keys[i];
        const setMethodName = "set" + capitalizeFirstLetter(key);
        //如果是对象或数组，深检测
        const deepValue = (porps[key].type === Object) || ((porps[key].type === Array)) || (Array.isArray(props[key].type));
        //普通函数调用vue实例绑定的方法
        if (props[key].custom) {
            vueElement.$watch(key, (newVal, oldVal) => {
                vueElement[setMethodName](newVal, oldVal);
            }, {
                deep: deepValue
            });
        } else if (setMethodName === "setOptions") {
            vueElement.$watch(key, (newVal, oldVal) => {
                L.setOptions(leafletElement, newVal)
            }, {
                deep: deepValue
            });
        } else {
            vueElement.$watch(key, (newVal, oldVal) => {
                leafletElement[setMethodName](newVal);
            }, {
                deep: deepValue
            });
        }
    }
}
