
<template>
  <div class="map-search-main">
    <el-form
      :model="queryForm"
      ref="queryForm"
      label-width="80px"
      :inline="false"
      size="normal"
    >
      <el-form-item label="">
        <el-row>
          <el-col :span="16">
            <el-input v-model="queryForm.address"></el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" size="default" @click="searchClick">
              搜索
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <div id="map" class="map-content"></div>
  </div>
</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import { loadAMap } from '@/utils/loadAMap'

// const AMap = window.AMap

export default {
  data () {
    return {
      queryForm: {
        address: ''
      },
      map: null,
      geocoder: null,
      infoWIndow: null
    }
  },
  mounted () {
    const _this = this
    loadAMap().then(() => {
      console.log('== map search ==')
      _this.map = new AMap.Map('map', {
        resizeEnable: true,
        zoom: 11
      })
      _this.geocoder = new AMap.Geocoder()
      _this.infoWindow = new AMap.InfoWindow({
        isCustom: false,
        autoMove: true,
        offset: new AMap.Pixel(-10, -43),
      })
      _this.map.on('click', (event) => {
        _this.addMrker(event.lnglat)
      })
    })
  },
  methods: {
    searchClick () {
      console.log('== searchClick ==')
    },
    // 地圖增加標記點
    addMrker (position) {
      const _this =this
      this.geocoder.getAddress([position.lng, position.lat], (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          // console.log(result)
          const marker = new AMap.Marker({
            map: _this.map,
            position: [position.lng, position.lat],
            // position: new AMap.LngLat(position.lng, position.lat),
            size: new AMap.Size(60, 26),
            offset: new AMap.Pixel(-10, -33),
            extData: result.regeocode
          })
          // marker.on('click',(e)=>{
          //   _this.addInfowindow(marker)
          // })
          _this.map.add(marker);
          marker.setMap(_this.map)
        }
      })
    },
    addInfowindow (marker) {
      console.log(marker)
      // this.map.clearInfoWindow()
      const positionInfo = marker.getExtData()
      const WindowDOM = Vue.extend({
        render: h => {
          return (<div style='min-width: 220px;'>
            <p style='margin: 10px 0px 0px 0px;font-size:14px;'><b>{positionInfo.formattedAddress}</b></p>
            <p style='margin: 5px 0px 0px 0px;font-size:14px;'><span>{positionInfo.addressComponent.province}{positionInfo.addressComponent.city}{positionInfo.addressComponent.district}{positionInfo.addressComponent.street}</span></p>
            <p style='margin: 5px 0px 0px 0px;font-size:14px;'>
              <a style='color:#1e346e;font-size:14px;text-decoration:underline;' onClick={() => this.infoWindowHandler(positionInfo)}>显示按钮</a>
              {positionInfo.type === 'tail' ? <a style='color:#1e346e;font-size:14px;text-decoration:underline;margin-left:10px' onClick={() => this.infoWindowHandler(positionInfo)}>隐藏按钮</a> : ''}
            </p>
          </div>)
        }
      })
      const component = (new WindowDOM()).$mount()
      this.infoWindow.setContent(component.$el)
      this.infoWindow.open(this.map, marker.getPosition())
      this.map.setCenter(marker.getPosition())
    },
    infoWindowHandler(){
      console.log('显示按钮')
    }
  }
}
</script>

<style lang="scss" scoped>
.map-content {
  height: 500px;
}
</style>
