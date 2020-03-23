var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
xhr.send(null);
xhr.onload = function () {
  var data = JSON.parse(xhr.responseText).features;
//   var county = document.getElementById('county');
  var countyArray = [];
//   var countyName =
//   {
//     "county": "",
//   }

//   county.addEventListener('change', function (e) {
//     // 指定縣市之所有藥局
//     console.log(e.target.value);

//     for (let i = 0; i < data.length; i++) {
//       if (e.target.value === data[i].county) {
//         console.log(data[i].county);
//         countyName.county = data[i].county;
//         countyArray.push(countyName.county);
//       }
//     }
//   });
  countyF();
//   console.log(countyArray);
  function countyF(){
    // 市 -> 縣
    var countyArray =[];
    // 區、鄉、鎮
    var townArray =[];
    for (let i = 0; i < data.length; i++){
      
      if (countyArray.indexOf(data[i].properties.county) === -1 && (data[i].properties.county) !== ""){
        countyArray.push(data[i].properties.county);
      }
      if (townArray.indexOf(data[i].properties.town) === -1 && (data[i].properties.county) !== "" 
      && data[i].properties.county === countyArray[8]){
        townArray.push(data[i].properties.town);
      }
    }
    console.log(countyArray);
    console.log(townArray);
    return;
  }
}


