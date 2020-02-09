// var map = L.map('map').setView([25.0469108,121.2075245], 16);
var map = L.map('map', {
    center: [25.0489946, 121.2077829],
    zoom: 16
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 使用圖資ICON 大頭針
var greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var orangeIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// 資料陣列，抓跨網資料，故註解
// var data = [
//     { 'name': '123', lat: , lng: },
//     { 'name': '早餐店', lat: , lng:  }
// ]

// 預先加入 .addTo(map)
var markers = L.markerClusterGroup().addTo(map);

// 每筆資料加上大頭針
// 原來寫法
// for (let i = 0; i < data.length; i++) {
//   L.marker([data[i].lat,data[i].lng],{icon: greenIcon})
//    .addTo(map)
//    .bindPopup('<h1>'+data[i].name+'</h1><hr><p>成人口罩:200個</p><p>兒童口罩:50</p>');
// }
// 利用迴圈將資料釘在地圖上
// for (let i = 0; i < data.length; i++) {
//   markers
//   .addLayer(L.marker([data[i].lat,data[i].lng],{icon: greenIcon}))
//   .bindPopup('<h1>'+data[i].name+'</h1><hr><p>成人口罩:200個</p><p>兒童口罩:50</p>');
// }
// map.addLayer(markers);


// markerCluster 原始寫法
// var markers = L.markerClusterGroup();
// markers.addLayer(L.marker(getRandomLatLng(map)));
// 可在這裡增加自選項目
// map.addLayer(markers);


// marker([定位],{icon: colorIcon}.addTo(map).bindPopup('顯示文字').預設開啟/關閉
// L
//     .marker([25.0489946, 121.2077829], { icon: greenIcon })
//     .addTo(map)
//     .bindPopup('<h1>測試藥局</h1><hr><p>成人口罩:200個</p><p>兒童口罩:50</p>')
//     .openPopup();









var xhr = new XMLHttpRequest();

xhr.open('get','https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
// 這行不用加，是因為原始資料是字串
// xhr.setRequestHeader('Content-type', 'application/json');
xhr.send(null);
// 。 .send -> 空值或null 都是狀態4

// 。 readyState
//  : 0 -> 已產生了一個 XMLHttpRequest，但未撈取資料
//  : 1 -> 使用了 open()，但未傳送資料過去
//  : 4 -> 已撈到資料了
//  : 2 -> 偵測有送出指令
//  : 3 -> loading 量大可能出現

// 。 status 頁面/資料
//  : 200 ->  存在
//  : 404 ->  不存在

// 。open
//  ,true  -> 為非同步，可讓程式未回傳資料就繼續往下執行
//  ,false -> 為同步，程式需等待資料回傳後才繼續往下執行。
//使用chrome會得到警告訊息，其告知開發者這會對使用者造成不當影響。


xhr.onload =function () {
//   抓取 JSON內的 features陣列資料，因瀏覽器傳遞的是字串，故需 parse
  var data = JSON.parse(xhr.responseText).features;
  for (let i = 0; i < data.length; i++) {
    markers.addLayer(L.marker([data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], {icon: greenIcon}).bindPopup(data[i].properties.name));
  }
  map.addLayer(markers);  
}