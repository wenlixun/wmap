<template>
    <div class="w-leaflet-map">
        <slot></slot>
    </div>
</template>

<script>
    import L from "leaflet";
    import eventsBinder from "../utils/eventsBinder";
    import propsBinder from "../utils/propsBinder";

    //地图上的事件
    const events = [
        /* Interaction events */
        "click", "dblclick", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "contextmenu", "keypress", "preclick",
        /* Map state change events */
        "zoomlevelschange", "resize", "unload", "viewreset", "load", "zoomstart", "movestart", "zoom", "move", "zoomend", "moveend",
        /* Layer events */
        "baselayerchange", "overlayadd", "overlayremove", "layeradd", "layerremove",
        /* Popup events */
        "popupopen", "popupclose", "autopanstart",
        /* Tooltip events */
        "tooltipopen", "tooltipclose ",
        /* Location events and others */
        "locationerror", "locationfound", "zoomanim"
    ];

    const props = {
        center: {
            type: [Object, Array],
            custom: true,
            default: undefined,
        },
        bounds: {
            custom: true,
            default: undefined,
        },
        zoom: {
            type: Number,
            default: undefined,
        },
        minZoom: {
            type: Number,
            default: undefined,
        },
        maxZoom: {
            type: Number,
            default: undefined,
        },
        paddingBottomRight: {
            custom: true,
            default: null,
        },
        paddingTopLeft: {
            custom: true,
            default: null
        },
        padding: {
            custom: true,
            default: null
        },
        worldCopyJump: {
            type: Boolean,
            default: false
        },
        crs: {
            custom: true,
            default: () => L.CRS.EPSG3857,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
    }

    export default {
        props: props,
        name: "map",
        mounted() {
            const options = this.options;
            Object.assign(options, {
                minZoom: this.minZoom,
                maxZoom: this.maxZoom,
                worldCopyJump: this.worldCopyJump,
                crs: this.crs
            });
            if (this.center != null) {
                options.center = this.center;
            }
            if (this.zoom != null) {
                options.zoom = this.zoom;
            }
            //创建map对象，这个对象在子图层中有用
            this.mapObject = L.map(this.$el, options);

            //将Vue上注册的事件，与mapObject的事件绑定
            eventsBinder(this, this.mapObject, events);
            //监听props
            propsBinder(this, this.mapObject, props);

            //该mount事件执行于子组件的mounted之后,将mapObject传到各个子组件去
            const children = this.$children;
            for (var i = 0; i < children.length; i++) {
                if (typeof children[i].deferredMountedTo === "function") {
                    children[i].deferredMountedTo(this.mapObject);
                } else if (typeof children[i].$children[0].deferredMountedTo === "function") {
                    children[i].$children[0].deferredMountedTo(this.mapObject);
                }
            }

            //
            this.setBounds(this.bounds);
            this.mapObject.whenReady(function () {
                this.$emit('l-ready')
            }, this);
        },
        methods: {
            setCenter(newVal, oldVal) {
                if (newVal == null) {
                    return;
                }

                let wasUndefined = false;
                let oldLat = 0;
                let oldLng = 0;
                if (oldVal == null) {
                    wasUndefined = true;
                } else if (Array.isArray(oldVal)) {
                    oldLat = oldVal[0];
                    oldLng = oldVal[1];
                } else {
                    oldLat = oldVal.lat;
                    oldLng = oldVal.lng;
                }

                let newLat = 0;
                let newLng = 0;
                if (Array.isArray(newVal)) {
                    newLat = newVal[0];
                    newLng = newVal[1];
                } else {
                    newLat = newVal.lat;
                    newLng = newVal.lng;
                }
                let centerChanged = wasUndefined || (newLat != oldLat) || (newLng != oldLng);
                if (centerChanged) {
                    this.mapObject.setView(newVal, this.zoom);
                }
            },
            setBounds(newVal, oldVal) {
                if (!(newVal && newVal.isValid())) {
                    return;
                }

                var options = {};
                if (this.padding) {
                    options.padding = this.padding;
                } else {
                    if (this.paddingBottomRight) {
                        options.paddingBottomRight = this.paddingBottomRight;
                    }
                    if (this.paddingTopLeft) {
                        options.paddingTopLeft = this.paddingTopLeft;
                    }
                }
                this.mapObject.fitBounds(newVal, options);
            },
            setPaddingBottomRight(newVal, oldVal) {
                this.paddingBottomRight = newVal;
            },
            setPaddingTopLeft(newVal, oldVal) {
                this.paddingTopLeft = newVal;
            },
            setPadding(newVal, oldVal) {
                this.padding = newVal;
            },
            setCrs(newVal, oldVal) {
                console.log('Changing CRS is not yet supported by Leaflet');
            },
            fitBounds(bounds) {
                this.mapObject.fitBounds(bounds);
            }
        },

    }
</script>

<style type="text/css">
    .w-leaflet-map {
        width: 100%;
        height: 100%;
    }
</style>