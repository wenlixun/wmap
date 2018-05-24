<template>
  <div class="main-operate">
    <div class="OMap_Pan">
      <div class="Operate_Image O_Pan_Top" @click="panTop"></div>
      <div class="Operate_Image O_Pan_Bottom" @click="panBottom"></div>
      <div class="Operate_Image O_Pan_Left" @click="panLeft"></div>
      <div class="Operate_Image O_Pan_Right" @click="panRight"></div>
      <div class="Operate_Image O_Pan_Center" @click="panCenter"></div>
    </div>
    <div class="OMap_Locate">
      <div class="Operate_Image OMap_lacated_btn" title="定位当前位置" @click=""></div>
    </div>
    <div class="OMap_Zoom">
      <div class="Operate_Image OMap_Zoom_In" @click="clickZoomIn"></div>
      <div class="OMap_Zoom_Sliderbar" @mousemove="onSliderMouseMove" @mouseup="onSliderMouseUp" @mouseleave="onSliderMouseLeave">
        <div class="Operate_Image OMap_Zoom_Top" :style='{height:maxBarHeight +"px"}'></div>
        <div class="Operate_Image OMap_Zoom_Bottom" :style='{height:(currentY + sliderBarHeight/2) + "px"}'></div>
        <div class="Operate_Image OMap_Zoom_Btn" :style='{bottom:currentY + "px"}' @mousedown="onSliderBarMouseDown"></div>
      </div>
      <div class="Operate_Image OMap_Zoom_Out" @click="clickZoomOut"></div>
    </div>
  </div>
</template>

<script>
  const props = {
    options: {
      default: () => ({})
    }
  };
  export default {
    props: {},
    mounted() {
      let _this = this;

      L.Control.MapOperation = L.Control.extend({
        options: {
          position: "topleft"
        },
        onAdd: function (map) {
          this._map = map,
            this._container = _this.$el;

          _this.minZoom = this._map.options.minZoom || 0,
            _this.maxZoom = this._map.options.maxZoom || 18,
            _this.currentZoom = this._map.getZoom(),
            _this.step = (_this.maxBarHeight - _this.sliderBarHeight) / (_this.maxZoom - _this.minZoom),
            _this.currentY = (_this.currentZoom - _this.minZoom) * _this.step,
            _this.map = map;

          let stop = L.DomEvent.stopPropagation;
          for (let a = 0, len = this._container.children.length; a < len; a++) {
            let child = this._container.children[a];
            L.DomEvent
            .on(child, "click", stop)
            .on(child, "mousedown", stop)
            .on(child, "dblclick", stop)
          }

          map.on("zoomend", function () {
            _this.currentZoom = this._map.getZoom();
          }, this)
          return this._container;
        }
      });
      this.$mapOperation = new L.Control.MapOperation(this.options)
    },
    data() {
      return {
        maxZoom: null,
        minZoom: null,
        step: null,
        map: null,
        sliderBarHeight: 12,//固定
        maxBarHeight: 152,//固定
        currentZoom: null,
        currentY: 0,
        validate: false
      }
    },
    computed: {
      sliderOffsetTop: function () {
        return this.getElementAbsPositionTop(document.getElementsByClassName("OMap_Zoom_Top")[0]);
      }
    },
    watch: {
      currentZoom: function (newVal, oldVal) {
        if (newVal != oldVal) {
          this.map.setZoom(newVal);
          this.setSliderValue(newVal, false)
        }
      }
    },
    methods: {
      deferredMountedTo(parent) {
        this.map = parent;
        this.$mapOperation.addTo(parent);
      }
      ,
      panTop() {
        var step = Math.abs((this.map.getBounds().getNorth() - this.map.getBounds().getSouth()) / 3);
        this.moveMapBounds(0, step);
      }
      ,
      panBottom() {
        var step = Math.abs((this.map.getBounds().getNorth() - this.map.getBounds().getSouth()) / 3);
        this.moveMapBounds(0, -step);
      }
      ,
      panLeft() {
        var step = Math.abs((this.map.getBounds().getEast() - this.map.getBounds().getWest()) / 3);
        this.moveMapBounds(-step, 0);
      }
      ,
      panRight() {
        var step = Math.abs((this.map.getBounds().getEast() - this.map.getBounds().getWest()) / 3);
        this.moveMapBounds(step, 0);
      }
      ,
      moveMapBounds(stepLng, stepLat) {
        var c = this.map.getCenter();
        this.map.panTo({lng: c.lng + stepLng, lat: c.lat + stepLat});
      }
      ,
      panCenter() {
        this.map.setView(this.map.options.center, this.map.options.zoom)
      }
      ,
      onSliderBarMouseDown(e) {
        this.validate = true;
      }
      ,
      onSliderMouseMove(e) {
        if (this.validate) {
          var bottomVal = this.maxBarHeight - (e.clientY - this.sliderOffsetTop);
          if (bottomVal > this.maxBarHeight - this.sliderBarHeight) bottomVal = this.maxBarHeight - this.sliderBarHeight;
          if (bottomVal < 0) bottomVal = 0;

          var steps = Math.round(bottomVal / this.step);
          this.setSliderValue(steps, true)
        }
      },
      onSliderMouseUp(e) {
        if (this.validate == true) {
          this.validate = false;

          var steps = Math.round(this.currentY / this.step);//多少级(格)
          this.currentZoom = this.minZoom + steps;
        }
      },
      onSliderMouseLeave(e) {
        if (this.validate == true) {
          this.validate = false;
        }
      },
      getElementAbsPositionTop(ele) {
        var top = 0;
        while (ele != document.body) {
          top += ele.offsetTop;
          ele = ele.offsetParent;
        }
        return top;
      },
      setSliderValue(zoom, fixed) {
        zoom = fixed ? zoom : (zoom - this.minZoom)
        this.currentY = this.step * (zoom);
      },
      clickZoomIn() {
        this.currentZoom < this.maxZoom && (this.currentZoom += 1)
      },
      clickZoomOut() {
        this.currentZoom > this.minZoom && (this.currentZoom -= 1)
      }
    }
  }
</script>

<style lang="scss" scoped>
  $main-color: #0085ca;
  $shadow-color: #666666;
  $pan-size: 50px;
  $arrow-size: 9px;
  .main-operate {
    .Operate_Image {
      background: url("./image/operation_control.png")
    }
    & > div {
      //box-shadow: 0px 0px 3px 1px $shadow-color;
      //background: #fff;
      margin: 5px auto;
    }

    .OMap_Pan {
      box-shadow: 0px 0px 3px 1px $shadow-color;
      position: relative;
      background: #fff;
      width: $pan-size;
      height: $pan-size;
      border-radius: 50%;

      & > div {
        width: 14px;
        height: 14px;
        position: absolute;
        cursor: pointer;
      }

      .O_Pan_Top {
        top: 1px;
        left: calc(50% - 7px);
        background-position: 0 -56px;
        &:hover {
          background-position: -15px -56px;
        }
      }
      .O_Pan_Bottom {
        bottom: 1px;
        left: calc(50% - 7px);
        background-position: 0 -97px;
        &:hover {
          background-position: -15px -97px;
        }
      }
      .O_Pan_Left {
        top: calc(50% - 7px);
        left: 1px;
        background-position: 0 -68px;
        &:hover {
          background-position: -15px -68px;
        }
      }
      .O_Pan_Right {
        top: calc(50% - 7px);
        right: 1px;
        background-position: 0 -82px;
        &:hover {
          background-position: -15px -82px;
        }
      }
      .O_Pan_Center {
        top: calc(50% - 6px);
        left: calc(50% - 6px);
        background-position: -2px -113px;
        &:hover {
          background-position: -17px -113px;
        }
      }
    }

    .OMap_Locate {
      width: 18px;
      height: 18px;
      cursor: pointer;
      .OMap_lacated_btn {
        width: 100%;
        height: 100%;
        background-position: -1px -134px;
      }
    }

    .OMap_Zoom {
      width: 18px;
      height: 150px;

      .OMap_Zoom_In {
        width: 18px;
        height: 18px;
        cursor: pointer;
        background-position: -1px -156px;
        &:hover {
          background-position: -31px -156px;
        }
      }

      .OMap_Zoom_Out {
        width: 18px;
        height: 18px;
        cursor: pointer;
        background-position: -1px -180px;
        &:hover {
          background-position: -31px -180px;
        }
      }

      .OMap_Zoom_Sliderbar {
        position: relative;
        .OMap_Zoom_Top {
          margin: 0 auto;
          width: 8px;
          height: 152px;
          background-position: -52px -153px;
        }
        .OMap_Zoom_Bottom {
          position: absolute;
          bottom: 0px;
          left: 5px;
          width: 8px;
          height: 6px;
          background-position: -52px 0px
        }
        .OMap_Zoom_Btn {
          position: absolute;
          width: 18px;
          height: 12px;
          cursor: pointer;
          bottom: 140px;
          background-position: -31px -138px;
        }
      }
    }
  }
</style>
