var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
xhr.send(null);
xhr.onload = function () {
  var data = JSON.parse(xhr.responseText).features;
  var county = document.getElementById('county');
  var town = document.getElementById('town');

  // 市 -> 縣
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



  county.addEventListener('change', function (e) {
    // 列出該縣市之所有藥局
    var selectTown = document.querySelectorAll(".select__town");
    for (i = 0; i < selectTown.length; i++) {
      town.removeChild(selectTown[i]);
    }
    townF(e.target.value);


  });


  function townF(county) {
    // 區、鄉、鎮
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
    console.log(townArray);
    return;
  }
}


