export function loadAMap () {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve()
    }
    window.init = function () {
      resolve()
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = '//webapi.amap.com/maps?v=1.4.15&key=c25fa87e31b534f7d2e452ae956f1a71&plugin=AMap.Autocomplete,AMap.Geocoder,AMap.ToolBar,Amap.Marker,AMap.PlaceSearch,&callback=init'
    script.onerror = reject
    document.head.appendChild(script)
  })
}
