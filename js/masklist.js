var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
xhr.send(null);
xhr.onload = function () {
  var originalData = JSON.parse(xhr.responseText).features;
  var data = [];
  var county = document.getElementById('county');
  var town = document.getElementById('town');
  var quantity = document.getElementById('quantity');
  var townName = '';

  // 預設
  // - 數量大於零
  // - 排序 多 ->少
  // - 列出所有縣市
  // - "未選"區鄉鎮 -> 不顯示
  quantityMask(0);
  data.sort(function (a, b) {
    return a.properties.mask_adult > b.properties.mask_adult ? -1 : 1;
  });
  countyF();
  quantity.classList.add('d-none');
  
 
  

  // 事件 -> 縣市 所選值改變時，連帶變更資料
  county.addEventListener('change', function (e) {
    var selectTown = document.querySelectorAll(".select__town");
    for (i = 0; i < selectTown.length; i++) {
      town.removeChild(selectTown[i]);
    }
    quantity.classList.remove('d-inline');
    quantity.classList.add('d-none');
    clearPharmacyData();
    townF(e.target.value);
  });
  // 事件 -> 區鄉鎮 所選值改變時，連帶變更資料
  town.addEventListener('change', function (e) {
    
    townName = e.target.value;
    quantity.classList.add('d-inline');
    clearPharmacyData();
    pharmacyList(e.target.value);
    
    
  });

  // 事件 -> 數量排序 所選值改變時，連帶變更資料
  quantity.addEventListener('change', function (e) {
    
    data =[];
    quantityMask(parseInt(e.target.value));
    data.sort(function (a, b) {
      return a.properties.mask_adult > b.properties.mask_adult ? -1 : 1;
    });

    clearPharmacyData();
    pharmacyList(townName);
    console.log(data);
  });

  function pharmacyList(name) {
    var pharmacyRow = document.querySelector('.js-pharmacyList');
    for (i = 0; i < data.length; i++) {
      if (name === data[i].properties.town) {
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


        mask__Pharmacy.textContent = data[i].properties.name;
        mask__Adult.innerHTML = '成人' + '<br>' + data[i].properties.mask_adult;
        mask__Child.innerHTML = '兒童' + '<br>' + data[i].properties.mask_child;
        mask__Address.innerHTML = '<span class="material-icons mr-1">place</span>' + data[i].properties.address;
        mask__Phone.innerHTML = '<span class="material-icons">phonelink_ring</span>' + data[i].properties.phone;
        mask__Updated.innerHTML = '<span class="material-icons mr-1cd">update</span>' + data[i].properties.updated;
        mask__Note.innerHTML = '<span class="material-icons">event_note</span>' + data[i].properties.note;

        col.classList.add('col', 'col-md-4', 'mb-3', 'js-col');
        card.classList.add('card', 'p-1');
        flex.classList.add('d-flex', 'justify-content-around');
        mask__Pharmacy.classList.add('text-center', 'font-weight-bold', 'mt-2');
        mask__Address.classList.add('d-flex', 'align-items-start');
        mask__Address.setAttribute('href', 'http://maps.google.com/maps?q=' + data[i].properties.address);
        mask__Phone.classList.add('d-flex', 'align-items-center', 'ml-1', 'my-2');
        mask__Phone.setAttribute('href', 'tel:' + data[i].properties.phone);
        mask__Updated.classList.add('d-flex', 'align-items-center');
        mask__Note.classList.add('d-flex', 'align-items-start');


        mask__Adult.classList.add('p-3', 'h3', 'text-white', 'rounded', 'text-nowrap','mr-1');
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
        card.appendChild(mask__Pharmacy);
        card.appendChild(mask__Address);
        card.appendChild(mask__Phone);
        card.appendChild(mask__Updated);
        card.appendChild(mask__Note);
      }
    }
  }


  // 功能 -> 列出所有縣市
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

  // 功能 -> 列出該縣市之"區、鄉、鎮"
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

  // 功能 -> 選擇要顯示的口罩數量
  function quantityMask(num) {
    for (i = 0; i < originalData.length; i++) {
      if (originalData[i].properties.mask_adult >= num) {
        data.push(originalData[i]);
      }
    }
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