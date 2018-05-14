/**
 * vueElement:Vue对象
 * leaflet:leaflet中的各种对象
 * events:事件，字符串数组
 * */
export default function (vueElement, leaflet, events) {

    for (let i = 0; i < events.length; i++) {
        //输出的名字
        const expName = "w-" + events[i];
        //这个leaflet对象事件的名
        const eventName = events[i];
        leaflet.on(eventName, function (e) {
            vueElement.$emit(expName, e);
        })
    }
}
