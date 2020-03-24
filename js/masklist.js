var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
xhr.send(null);
xhr.onload = function () {
  var data = JSON.parse(xhr.responseText).features;
  var county = document.getElementById('county');
  var town = document.getElementById('town');
  var pharmacyUl = document.querySelector(".js-pharmacyList");


  // 功能 -> 列出所有縣市
  countyF();

  // 事件 -> 所選值改變時，連帶變更資料
  county.addEventListener('change', function (e) {
    var selectTown = document.querySelectorAll(".select__town");
    for (i = 0; i < selectTown.length; i++) {
      town.removeChild(selectTown[i]);
    }
    var liAll = document.querySelectorAll(".js-li");
    for (i = 0; i < liAll.length; i++) {
      
      pharmacyUl.removeChild(liAll[i]);
    }
    townF(e.target.value);
  });
  town.addEventListener('change', function (e) {
    var liAll = document.querySelectorAll(".js-li");
    for (i = 0; i < liAll.length; i++) {
      
      pharmacyUl.removeChild(liAll[i]);
    }
    pharmacyList(e.target.value);

  });

  function pharmacyList(name) {

    for (i = 0; i < data.length; i++) {
      if (name === data[i].properties.town) {

        var li = document.createElement('li');
        li.classList.add('js-li');
        li.textContent = data[i].properties.name;
        pharmacyUl.appendChild(li);
        console.log(data[i].properties.town);
      }
    }
  }


  // 功能 -> 列出所有縣市
  function countyF() {
    var countyArray = [];
    for (let i = 0; i < data.length; i++) {
      if (countyArray.indexOf(data[i].properties.county) === -1 && (data[i].properties.county) !== "") {
        countyArray.push(data[i].properties.county);
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
    for (let i = 0; i < data.length; i++) {
      if (townArray.indexOf(data[i].properties.town) === -1 && (data[i].properties.county) !== ""
        && data[i].properties.county === county) {
        townArray.push(data[i].properties.town);
      }
    }
    for (let i = 0; i < townArray.length; i++) {
      var option = document.createElement('option');
      option.classList.add('select__town');
      option.textContent = townArray[i];
      option.setAttribute('value', townArray[i]);
      town.appendChild(option);
      // town.innerHTML = '<option value="">'+townArray[i]+'</option>';
    }
  }
}


