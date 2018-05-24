<template>
  <div class="leaflet-control-coordinates">
    <div class="uiElement label">
      <span class="labelFirst">{{lng}} {{lat}}</span>
    </div>
  </div>
</template>

<script>
  import L from 'leaflet'

  const defaultOption = {
    position: "bottomright",
    //decimals used if not using DMS or labelFormatter functions
    decimals: 4,
    //decimalseperator used if not using DMS or labelFormatter functions
    decimalSeperator: ".",
    //label templates for usage if no labelFormatter function is defined
    labelTemplateLng: "Lng: {x}",
    labelTemplateLat: "Lat: {y}",
    //label formatter functions
    labelFormatterLat: undefined,
    labelFormatterLng: undefined,
    //use Degree-Minute-Second
    useDMS: false
  };
  const props = {
    options: {
      default: () => ({})
    }
  };
  export default {
    props: props,
    mounted() {
      let options = Object.assign({}, defaultOption, this.options);

      let _this = this;
      L.Control.Coordinates = L.Control.extend({
        onAdd(map) {
          this._container = _this.$el
          this._container.style.margin = 0 + "px";
          this._container.style.position = 'relative';

          return this._container;
        }
      })

      this.$coorControl = new L.Control.Coordinates(options);
    },
    data() {
      return {
        lng: "",
        lat: ""
      }
    },
    methods: {
      deferredMountedTo(parent) {
        this.parent = parent;
        this.parent.on("mousemove", _update, this);

        this.$coorControl.addTo(parent);
      }
    }
  }

  function _update(e) {
    let tempLng = this.options.labelTemplateLng,
      tempLat = this.options.labelTemplateLat;
    this.lng = tempLng.replace("{x}", _getNumber(e.latlng.lng, this.options));
    this.lat = tempLat.replace("{y}", _getNumber(e.latlng.lat, this.options));
  }

  function _getNumber(n, opts) {
    var res;
    if (opts.useDMS) {
      res = _toDMS(n);
    } else {
      res = _round(n, opts.decimals, opts.decimalSeperator)
    }
    return res;
  }

  function _toDMS(deg) {
    var d = Math.floor(Math.abs(deg));
    var minfloat = (Math.abs(deg) - d) * 60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat - m) * 60;
    var s = Math.round(secfloat);
    if (s == 60) {
      m++;
      s = "00";
    }
    if (m == 60) {
      d++;
      m = "00";
    }
    if (s < 10) {
      s = "0" + s;
    }
    if (m < 10) {
      m = "0" + m;
    }
    var dir = "";
    if (deg < 0) {
      dir = "-";
    }
    return ("" + dir + d + "° " + m + "' " + s + "''");//&deg;
  }

  function _round(num, dec, sep) {
    let res = formatNum(num, dec) + "",
      numbers = res.split(".");
    if (numbers[1]) {
      var d = dec - numbers[1].length;
      for (; d > 0; d--) {
        numbers[1] += "0";
      }
      res = numbers.join(sep || ".");
    }
    return res
  }

  function formatNum(n, digits) {
    var pow = Math.pow(10, digits || 5);
    return Math.round(n * pow) / pow;
  }

</script>

<style>
  .leaflet-control-coordinates {
    background-color: #D8D8D8;
    background-color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }

  .leaflet-control-coordinates, .leaflet-control-coordinates .uiElement input {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
  }

  .leaflet-control-coordinates .uiElement {
    margin: 4px;
  }

  .leaflet-control-coordinates .uiElement .labelFirst {
    margin-right: 4px;
  }

  .leaflet-control-coordinates .uiHidden {
    display: none;
  }

  .leaflet-control-coordinates .uiElement.label {
    color: inherit;
    font-weight: inherit;
    font-size: inherit;
    padding: 0;
    display: inherit;
  }

</style>
