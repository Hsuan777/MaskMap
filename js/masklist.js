var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
xhr.send(null);
xhr.onload = function () {
  // - originalData    -> 原始資料，若取得使用者位置資訊，則加入距離資料
  // - data            -> 篩選資料用
  // - countyF()       -> 取得縣市列表
  // - townF()         -> 取得縣市之區鄉鎮列表
  // - quantityMask()  -> 取得要顯示的口罩數量並依照數量多至少排序
  // - townName        -> 紀錄目前區鄉鎮名稱
  // - quantityRecord  -> 紀錄目前口罩顯示數量
  // - locationUser    -> 使用者目前位置
  var originalData = JSON.parse(xhr.responseText).features;
  var data = [];
  var county = document.getElementById('county');
  var town = document.getElementById('town');
  var quantity = document.getElementById('quantity');
  var townName = '';
  var quantityRecord = '';
  var locationUser = '';
  var pageLocalArray = [1];


  // 預先執行功能
  countyF();
  scrollFunction();
  // 判斷 +功能 -> 若使用者同意被取得位置，則執行功能
  // - 已匯入 leaflet.js
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
    function success(position) {
      // 取得 -> 使用者位置
      locationUser = L.latLng(position.coords.latitude, position.coords.longitude);

      // 取得 -> 使用者與藥局距離 && 增加原始資料 geometry.distance && 顯示使用者所在區域資料
      for (i = 0; i < originalData.length; i++) {
        originalData[i].geometry.distance = parseInt((locationUser.distanceTo(
          L.latLng(originalData[i].geometry.coordinates[1], originalData[i].geometry.coordinates[0])
        ) / 1000).toFixed(1));
      }
      // 取得 -> 取得最近一間藥局所在區域，作為使用者目前區域
      // - 但可能遇到跨區問題，或是網路定位錯誤
      originalData.sort(function (a, b) {
        return a.geometry.distance > b.geometry.distance ? 1 : -1;
      });
      townName = originalData[0].properties.town;

      // 執行所在區域藥局清單並顯示第一頁
      quantityMask(townName, 0)
      pharmacyList(1);


      // 預先顯示使用者目前區域
      document.getElementById('area').textContent = originalData[0].properties.county + townName;

      // 設定 -> leaflet參數 
      // - center 定位
      // - zoom 縮放等級
      var map = L.map('map', {
        center: [position.coords.latitude, position.coords.longitude],
        zoom: 13
      });

      // 將 openstreetmap 加入地圖，map 為網頁的 #map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // 將每個定點做群組，強化搜尋體驗
      // - 參考 https://github.com/Leaflet/Leaflet.markercluster
      var markers = L.markerClusterGroup().addTo(map);

      // 使用者為中心，方圓 5公里視覺化
      L.circle([position.coords.latitude, position.coords.longitude], { radius: 5000 }).addTo(map);

      // 對每筆資料上不同 icon，並顯示資訊
      for (let i = 0; i < data.length; i++) {
        var mask = "";

        if (data[i].properties.mask_adult == 0) {
          mask = greyIcon;
        } else if (data[i].properties.mask_adult < 50) {
          mask = orangeIcon;
        } else if (data[i].properties.mask_adult >= 50) {
          mask = greenIcon;
        };
        markers.addLayer(L.marker(
          [data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]],
          { icon: mask })
          .bindPopup(data[i].properties.name
            + "<br>" + "成人口罩 : "
            + data[i].properties.mask_adult
            + "<br>" + "兒童口罩 : "
            + data[i].properties.mask_child
            + "<br>" + "備註 : "
            + data[i].properties.note
          ));
      }
      map.addLayer(markers);
    }
    function error() {
      alert('無法取得你的位置');
    }
  } else {
    alert('Sorry, 你的裝置不支援地理位置功能。')
  }


  // 事件 -> 縣市 所選值改變時，連帶變更資料
  county.addEventListener('change', function (e) {
    var selectTown = document.querySelectorAll(".select__town");
    for (i = 0; i < selectTown.length; i++) {
      town.removeChild(selectTown[i]);
    }
    clearPharmacyData();
    townF(this.value);
    var dataList = document.getElementById('dataList');
    var pagination = document.querySelector('.pagination');
    dataList.textContent = "未選擇區鄉鎮";
    pagination.style.display = 'none';
  });


  // 事件 -> 區鄉鎮 所選值改變時，連帶變更資料
  town.addEventListener('change', function (e) {
    townName = this.value;
    data = [];
    clearPharmacyData();
    quantityMask(townName, quantityRecord);
    pageLocalArray[0] = 1;
    localStorage.setItem('pageLinkNumber', JSON.stringify(pageLocalArray));
    pharmacyList(1);
    var pagination = document.querySelector('.pagination');
    pagination.style.display = 'block';
  });


  // 事件 -> 數量排序 所選值改變時，連帶變更資料
  quantity.addEventListener('change', function (e) {
    data = [];
    // console.log(typeof(this.value)); -> 類型為字串
    quantityMask(townName, parseInt(this.value));
    quantityRecord = parseInt(this.value);

    clearPharmacyData();
    pageLocalArray[0] = 1;
    localStorage.setItem('pageLinkNumber', JSON.stringify(pageLocalArray));
    pharmacyList(1);
    distance.checked = false;
  });


  // 事件 -> 距離排序
  distance.addEventListener('change', function () {
    console.log(this.checked);
    if (this.checked == true) {
      data = [];
      quantityMask(townName, quantityRecord);
      clearPharmacyData();
      pageLocalArray[0] = 1;
      localStorage.setItem('pageLinkNumber', JSON.stringify(pageLocalArray));
      pharmacyList(1);
    } else {
      data = [];
      quantityMask(townName, quantityRecord);
      clearPharmacyData();
      pageLocalArray[0] = 1;
      localStorage.setItem('pageLinkNumber', JSON.stringify(pageLocalArray));
      pharmacyList(1);
    }
  });


  // 事件 -> 點擊上下頁
  pageLocalArray[0] = 1;
  localStorage.setItem('pageLinkNumber', JSON.stringify(pageLocalArray));
  var pageLink = document.querySelectorAll('.page-link');
  pageLink[0].addEventListener('click', function () {
    if (pageLocalArray[0] - 1 === 0) {
      alert('已經在第一頁 !')
      return;
    } else {
      pageLocalArray[0] = pageLocalArray[0] - 1;
      localStorage.setItem('pageLinkNumber', JSON.stringify(pageLocalArray));
      clearPharmacyData();
      pharmacyList(pageLocalArray[0]);
      topFunction(0);
    }
  });
  pageLink[1].addEventListener('click', function () {
    if (pageLocalArray[0] + 1 === Math.ceil(data.length / 10) + 1) {
      alert('最後一頁囉 !')
      return;
    } else {
      pageLocalArray[0] = pageLocalArray[0] + 1;
      localStorage.setItem('pageLinkNumber', JSON.stringify(pageLocalArray));
      clearPharmacyData();
      pharmacyList(pageLocalArray[0]);
      topFunction(0);
    }
  });


  // 功能 -> 藥局清單
  // - num 為頁數
  function pharmacyList(num) {
    var pharmacyRow = document.querySelector('.js-pharmacyList');
    var dataList = document.getElementById('dataList');

    var dataLength = '';
    var pageTotal = Math.ceil(data.length / 10);
    dataList.textContent = '共' + data.length + '筆資料，第' + num + '頁，共' + pageTotal + '頁'
    // TODO: 可新增 5筆、15筆、20筆資料
    // - 小於 10 筆資料
    // - 滿 10 筆資料且不是最後一頁
    // - 最後一頁且有餘數
    if (data.length < 10) {
      dataLength = data.length % 10;
    } else if (data.length % 10 === 0 || num !== pageTotal) {
      dataLength = num * 10;
    } else if (data.length % 10 !== 0 && num === pageTotal) {
      dataLength = (num - 1) * 10 + data.length % 10;
    }
    // i = 0; i < data.length; i++
    // i = (num - 1) * 10; i < dataLength; i++



    for (i = (num - 1) * 10; i < dataLength; i++) {

      var col = document.createElement('div');
      var card = document.createElement('div');
      var flex = document.createElement('div');
      var mask__Pharmacy = document.createElement('h4');
      var mask__Adult = document.createElement('h6');
      var mask__Child = document.createElement('h6');
      var mask__Address = document.createElement('a');
      var mask__Phone = document.createElement('a');
      var mask__Updated = document.createElement('p');
      var mask__Note = document.createElement('p');
      var mask__Distance = document.createElement('small');


      mask__Pharmacy.textContent = data[i].properties.name;
      mask__Adult.innerHTML = '成人' + '<br>' + data[i].properties.mask_adult;
      mask__Child.innerHTML = '兒童' + '<br>' + data[i].properties.mask_child;
      mask__Address.innerHTML = '<span class="material-icons mr-1">place</span>' + data[i].properties.address;
      mask__Phone.innerHTML = '<span class="material-icons">phonelink_ring</span>' + data[i].properties.phone;
      mask__Updated.innerHTML = '<span class="material-icons mr-1cd">update</span>' + data[i].properties.updated;
      mask__Note.innerHTML = '<span class="material-icons">event_note</span>' + data[i].properties.note;
      mask__Distance.textContent = data[i].geometry.distance + 'km';

      col.classList.add('col', 'col-md-4', 'col-lg-12', 'mb-3', 'js-col');
      card.classList.add('card', 'p-1');
      flex.classList.add('d-flex', 'justify-content-around');
      mask__Pharmacy.classList.add('text-center', 'font-weight-bold', 'mt-2', 'mr-2');
      mask__Distance.classList.add('ml-2');
      mask__Address.classList.add('d-flex', 'align-items-start');
      mask__Address.setAttribute('href', 'http://maps.google.com/maps?q=' + data[i].properties.address);
      mask__Phone.classList.add('d-flex', 'align-items-center', 'ml-1', 'my-2');
      mask__Phone.setAttribute('href', 'tel:' + data[i].properties.phone);
      mask__Updated.classList.add('d-flex', 'align-items-center');
      mask__Note.classList.add('d-flex', 'align-items-start');


      mask__Adult.classList.add('p-3', 'h3', 'text-white', 'rounded', 'text-nowrap', 'mr-1');
      mask__Child.classList.add('p-3', 'h3', 'text-white', 'rounded', 'text-nowrap');
      if (data[i].properties.mask_adult === 0) {
        mask__Adult.classList.add('bg-zero', 'mask__quantity', 'mask__zero')
      } else if (data[i].properties.mask_adult <= 50) {
        mask__Adult.classList.add('bg-warning', 'mask__quantity', 'mask__warning')
      } else if (data[i].properties.mask_adult > 50) {
        mask__Adult.classList.add('bg-success', 'mask__quantity', 'mask__success')
      }
      if (data[i].properties.mask_child === 0) {
        mask__Child.classList.add('bg-zero', 'mask__quantity', 'mask__zero')
      } else if (data[i].properties.mask_child <= 50) {
        mask__Child.classList.add('bg-warning', 'mask__quantity', 'mask__warning')
      } else if (data[i].properties.mask_child > 50) {
        mask__Child.classList.add('bg-success', 'mask__quantity', 'mask__success')
      }


      pharmacyRow.appendChild(col).appendChild(card);
      card.appendChild(flex);
      flex.appendChild(mask__Adult);
      flex.appendChild(mask__Child);
      card.appendChild(mask__Pharmacy).appendChild(mask__Distance);
      card.appendChild(mask__Address);
      card.appendChild(mask__Phone);
      card.appendChild(mask__Updated);
      card.appendChild(mask__Note);
    }
  }


  // 功能 -> 縣市列表
  // - county會有空值
  function countyF() {
    var countyArray = [];
    for (let i = 0; i < originalData.length; i++) {
      if (countyArray.indexOf(originalData[i].properties.county) === -1 && (originalData[i].properties.county) !== "") {
        countyArray.push(originalData[i].properties.county);
      }
    }
    for (let i = 0; i < countyArray.length; i++) {
      var option = document.createElement('option');
      option.textContent = countyArray[i];
      option.setAttribute('value', countyArray[i]);
      county.appendChild(option);
    }
  }


  // 功能 -> 區、鄉、鎮列表
  function townF(county) {
    var townArray = [];
    for (let i = 0; i < originalData.length; i++) {
      if (townArray.indexOf(originalData[i].properties.town) === -1 && (originalData[i].properties.county) !== ""
        && originalData[i].properties.county === county) {
        townArray.push(originalData[i].properties.town);
      }
    }
    for (let i = 0; i < townArray.length; i++) {
      var option = document.createElement('option');
      option.classList.add('select__town');
      option.textContent = townArray[i];
      option.setAttribute('value', townArray[i]);
      town.appendChild(option);
    }
  }


  //  功能 -> 選擇要顯示的口罩數量，若開啟最近距離則依距離排序，否則數量排序
  function quantityMask(name, num) {
    for (i = 0; i < originalData.length; i++) {
      if (name === originalData[i].properties.town && originalData[i].properties.mask_adult >= num) {
        data.push(originalData[i]);
      }
    }
    if (distance.checked === true) {
      data.sort(function (a, b) {
        return a.geometry.distance > b.geometry.distance ? 1 : -1;
      });
      console.log(data)
    } else {
      data.sort(function (a, b) {
        return a.properties.mask_adult > b.properties.mask_adult ? -1 : 1;
      });
    }
  }

  // 功能 -> 清除資料
  function clearPharmacyData() {
    var pharmacyRow = document.querySelector('.js-pharmacyList');
    var jsCol = document.querySelectorAll(".js-col");
    for (i = 0; i < jsCol.length; i++) {
      pharmacyRow.removeChild(jsCol[i]);
    }
  }
}



// 取得 + 判斷  -> 奇偶數
var d = new Date();
EvenOdd = document.getElementById('EvenOdd');
switch (d.getDay()) {
  case 1:
  case 3:
  case 5:
    EvenOdd.textContent = "奇數"
    break;
  case 2:
  case 4:
  case 6:
    EvenOdd.textContent = "偶數"
    break;
  case 0:
    EvenOdd.textContent = "奇偶數"
    break;
}


// 取得 -> 使用 ICON 大頭針 
//  - 參考 https://github.com/pointhi/leaflet-color-markers
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
var greyIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



// 事件 BOM 'onscroll' -> 每當畫面捲動觸發一次 scrollFunction();
window.onscroll = function () {
  scrollFunction();
};


function scrollFunction() {
  var top = document.querySelector('.top');

  // 判斷 -> 若滾動頁面超過 100 ，則顯示
  // - document.documentElement -> <html>, For Chrome, Firefox, IE and Opera
  // - document.body -> <body>, for  Safari
  if (window.pageYOffset > 100 || document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    top.style.display = "block";
  } else {
    top.style.display = "none";
  }

  // 事件 'click' -> 回到頂部
  top.addEventListener('click', function (event) {
    event.preventDefault();
    topFunction(0);
  }, false)
}

function topFunction(scrollNumber) {
  // BOM -> 平滑滾動
  window.scrollTo({
    top: scrollNumber,
    behavior: "smooth"
  });
}

// ? 問題 
// - this ; e.target 
// - change事件是相同觸發元素相同目標 ?
// - ul>li 監聽 ul click事件時，是同一個觸發元素不同目標 ?
// - 若剛好目標相同，怎樣的情況較適合哪一種 ?

// ? 問題
// - top.style.display ; top.classList.add('d-block')
// - style寫在該元素上，classList則是加入 class
// - 用哪一個比較好? 怎樣的情況適合哪一種 ?
// - 會因為權重的問題而推薦用 classList ?

// ? 問題
// - innerHTML ; appendChild() 
// - innerHTML 會複寫 ;  appendChild()則是往下新增與其他操作
// - 若跨網域資料有安全性疑慮則不推薦 innerHTML
// - 但為了組字串方便而混用，在多數情況下，較推薦使用哪一種方式組字串呢 ?


// ? 問題 
// - 排序皆由數量多到少 -> 數量排序與距離排序擇一
// - 條件一:數量、條件二:距離
// - 單一篩選 數量
// - 單一篩選 距離
// - 多重條件篩選 數量(0、50、100) && 距離(5、10、20、不選)
// - 如何"取得"未觸發 change事件所選值
// - 若已觸發則如何保留所選值，然後綜合其他所選條件再去做行為
// - 不選如何寫"判斷"

// ? 問題 
// - 中心點如何增加大頭針 ?
// - 點選 || hover 該藥局後，地圖移動至該座標並顯示大頭針