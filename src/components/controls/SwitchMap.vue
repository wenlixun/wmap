<template>
  <div class="leaflet-control-switchmap" onselectstart="return false;">

  </div>
</template>

<script>


  const props = {
    options: {
      type: Object,
      default: () => ({})
    }
  };
  const defaultOptions = {
    position: "topright",
    align: "horizontal",//vertical or horizontal
    width: 80,
    height: 60,
    displayForSingleLayer: false,//单个图层时，是否显示控件
    defaultActive: 0,
    layers: []//required,
  };
  export default {
    props: props,
    mounted() {
      let options = Object.assign({}, defaultOptions, this.options);

      let _this = this;
      L.Control.SwitchLayers = L.Control.extend({
        options: {
          position: "topright",
          align: "horizontal"
        },
        initialize: function (options) {
          L.Control.prototype.initialize.call(this, options);
        },
        onAdd: function (map) {
          this._container = _this.$el;

          this._container.style.margin = "5px 5px 0px 0px";

          if (!this._isArray(this.options.layers)) {
            console.error("提供的layers不是数组");
          } else {
            if (this.options.layers.length == 0) {
              console.error("layers数量至少为1");
            } else {
              this.map = map,
                this._activeItemId = (this.options.defaultActive < this.options.layers.length - 1) ? this.options.defaultActive : 0;

              this._container.className += " control-" + this.options.align;

              if (this.options.layers.length == 1 && !this.options.displayForSingleLayer) {

              } else {
                for (let i = 0, len = this.options.layers.length; i < len; i++) {
                  let info = this.options.layers[i];
                  (i == this._activeItemId) ?
                    (this._activeItem = this._createItem(("item" + i), info.title, ("switchmap-item active"), info.bgUrl, this._container, this._switchMap, this)) :
                    this._createItem(("item" + i), info.title, "switchmap-item", info.bgUrl, this._container, this._switchMap, this)
                }
              }
              this.options.layers[this._activeItemId].layer.addTo(this.map);
            }
          }
          return this._container;
        },
        onRemove: function (map) {
          map.removeLayer(this.options.layers[this._activeItemId].layer);
        },
        _createItem: function (id, html, className, backgroundUrl, container, fn, context) {
          let w = this.options.width,
            h = this.options.height;
          var item = L.DomUtil.create("div", className, container),
            subItem = L.DomUtil.create("div", "item-title", item);

          item.id = id;
          item.style.backgroundImage = "url(" + backgroundUrl + ")";
          item.style.backgroundSize = w + "px" + " " + h + "px";
          subItem.innerHTML = html;
          subItem.id = "subitem_" + id;

          item.style.width = w + "px";
          item.style.height = h + "px";

          var stop = L.DomEvent.stopPropagation;
          L.DomEvent
          .on(item, "click", stop)
          .on(item, "mousedown", stop)
          .on(item, "dblclick", stop)
          .on(item, "click", fn, context)

          return item;
        },
        _switchMap: function (e) {
          this.map.stop();
          var target = e.target;
          if(e.target.id.startsWith("subitem_"))
            target = e.target.parentNode;

          var si = target === this._activeItem;
          if (si) {
            return;
          } else {
            this._activeItem.className = this._activeItem.className.replace("active", "");
            target.className += " active";
            this._preActiveItemId = Number.parseInt(this._activeItem.id.slice(4));

            this._activeItem = target;
            this._activeItemId = Number.parseInt(target.id.slice(4));

            this.map.removeLayer(this.options.layers[this._preActiveItemId].layer).addLayer(this.options.layers[this._activeItemId].layer)
          }
        },
        _isArray: function (o) {
          return typeof o !== 'undefined' && o instanceof Array && o.__proto__.constructor == Array && Array.isArray(o);
        }
      })

      L.control.switchMap = function (options) {
        return new L.Control.SwitchLayers(options);
      }
      this.$switchControl = L.control.switchMap(options);
    },
    data() {
      return {}
    },
    conputed: {},
    methods: {
      deferredMountedTo(parent) {
        this.$switchControl.addTo(parent)
      }
    }
  }
</script>

<style lang="scss">
  $main-color: #69c448;
  $shadow-color: #666666;
  .leaflet-control-switchmap .switchmap-item {
    border: 1px solid #666;
    position: relative;
    cursor: pointer;
    overflow: hidden;
  }

  /* 垂直排列 */
  .control-vertical .switchmap-item {
    display: block;
    margin: 5px 0px;
    border-radius: 5px;
    box-shadow: 2px 2px 5px 1px $shadow-color
  }

  /* 水平排列 */
  .control-horizontal .switchmap-item {
    display: inline-block;
    margin: 0px 5px;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
    box-shadow: 2px 2px 5px 1px $shadow-color
  }

  .switchmap-item .item-title {
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 18px;
    line-height: 18px;
    text-align: center;
    color: #222222;
    background: rgba(255, 255, 255, 0.6);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .switchmap-item.active {
    border-width: 2px;
    border-color: $main-color;
  }

  .active .item-title {
    background-color: $main-color;
    color: white;
  }
</style>
