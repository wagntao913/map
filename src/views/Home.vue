<template>
<div>
  <el-form :model="queryForm" ref="queryForm" label-width="80px" :inline="false" size="normal">
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
  <div id="map" class="map-main"></div>
</div>

</template>

<script>
// @ is an alias to /src
import Vue from 'vue'
import { loadAMap } from '@/utils/loadAMap'
export default {
  name: 'Home',
  data () {
    return {
      queryForm: {
        address: ''
      },
      POIList: [],
      POIMarkers: [],
      map: null,
      geocoder: null,
      infoWIndow: null,
      POIInfoWindow: null,
      POISearch: null
    }
  },
  mounted () {
    loadAMap().then(res => {
      console.log('== ===')
      /* eslint-disable no-undef */
      // this.map.addControl(new AMap.ToolBar({ extensions: 'all' }))
      this.map = new AMap.Map('map', {
        resizeEnable: true,
        zoom: 11
      })
      this.geocoder = new AMap.Geocoder()
      this.infoWindow = new AMap.InfoWindow({
        isCustom: false,
        autoMove: true,
        offset: new AMap.Pixel(-10, -43)
      })
      this.POIInfoWindow = new AMap.InfoWindow({
        isCustom: false,
        autoMove: true,
        offset: new AMap.Pixel(-10, -43)
      })
      this.map.on('click', (event) => {
        this.addMrker(event.lnglat)
      })
    }).catch(err => {
      console.log('err', err)
      console.log('高德地图加载失败')
    })
  },
  methods: {
    searchClick () {
      console.log('== searchClick ==')
      if (!this.queryForm.address) return false
      this.getPOIList(this.queryForm.address)
    },
    getPOIList (keywords) {
      const _this = this
      this.POISearch = new AMap.PlaceSearch({
        // city: city,
        // citylimit: true,
        extensions: 'all'
        // type: category,
        // pageSize: page.pageSize,
        // pageIndex: params.page.pageNum
      })
      this.POISearch.search(keywords, (status, res) => {
        console.log(status, res)
        if (status === 'complete' && res.info === 'OK') {
          _this.POIList = res.poiList.pois
          console.log(_this.POIList)
          _this.addPOIMarker(_this.POIList)
        }
      })
    },
    // POI数据打点
    addPOIMarker (POIList) {
      POIList.forEach((item, index) => {
        const marker = new AMap.Marker({
          map: this.map,
          icon: require('@/assets/' + (index + 1) + '.png'),
          position: [item.location.lng, item.location.lat],
          size: new AMap.Size(21, 32)
        })
        marker.on('click', () => {
          this.showPOIInfo(item)
        })
        this.POIMarkers.push(marker)
      })
      this.map.setFitView(null, true, [100, 100, 100, 450])
    },
    // 显示POIinfo弹框
    showPOIInfo (value) {
      const address = value.pname + value.cityname + value.adname + value.address
      const content = `
      <div class="title"> ${value.name} </div>
      <div class="content">
        <p>地址: ${address} </p>
        <p>电话: ${value.tel} </p>
      </div>`
      this.POIInfoWindow.setContent(content)
      this.POIInfoWindow.open(this.map, [value.location.lng, value.location.lat])
      this.map.setCenter([value.location.lng, value.location.lat])
      this.map.panBy(-185, 0)
    },
    // 地圖增加標記點
    addMrker (position) {
      const _this = this
      this.geocoder.getAddress([position.lng, position.lat], (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          this.map.clearInfoWindow()
          const marker = new AMap.Marker({
            map: _this.map,
            position: new AMap.LngLat(position.lng, position.lat),
            size: new AMap.Size(60, 26),
            offset: new AMap.Pixel(-10, -33),
            extData: result.regeocode
          })
          marker.on('click', (e) => {
            _this.addInfowindow(marker)
          })
          _this.map.add(marker)
          marker.setMap(_this.map)
        }
      })
    },
    addInfowindow (marker) {
      console.log(marker)
      const positionInfo = marker.getExtData()
      const WindowDOM = Vue.extend({
        render: h => {
          return (<div style='min-width: 220px;'>
            <p style='margin: 10px 0px 0px 0px;font-size:14px;'><b>{positionInfo.formattedAddress}</b></p>
            <p style='margin: 5px 0px 0px 0px;font-size:14px;'><span>{positionInfo.addressComponent.province}{positionInfo.addressComponent.city}{positionInfo.addressComponent.district}{positionInfo.addressComponent.street}</span></p>
            <p style='margin: 5px 0px 0px 0px;font-size:14px;'>
              <a style='color:#1e346e;font-size:14px;text-decoration:underline;' onClick={() => this.infoWindowHandler(positionInfo)}>设为起点</a>
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
    infoWindowHandler () {
      console.log('显示按钮')
    }
  }
}
</script>
<style lang="scss" scoped>
.map-main {
  height: 500px;
}
</style>
<style lang="scss" >
.amap-info-content {
  width: 300px;
  padding: 0;
  .amap-info-close {
    top: 7px;
    right: 5px !important;
  }
  .title {
    padding: 5px;
    padding-right: 22px;
    background: #F9F9F9;
    border-bottom: 1px solid #cccccc;
  }
  .content {
    padding: 10px 5px;
    line-height: 20px;
    font-size: 12px;
  }
}
</style>
