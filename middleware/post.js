/*
*   랜덤으로 크레인 정보를 전송하는 script
*
*
*/


const request = require('request')

setInterval(getRamdomLocation, 2000)

function getRamdomLocation() {

    let lon_temp;
    let lat_temp;

    while(true) {
        lon_temp = Math.random();

        if(lon_temp > 0.69 && lon_temp < 0.723)
            break;
    }

    let lon = 128 + lon_temp

    while(true) {
        lat_temp = Math.random();

        if(lat_temp > 0.86 && lat_temp < 0.96)
            break;            
    }

    let lat = 34 + lat_temp;

    let date = new Date();
    let month = date.getMonth() + 1
    let day = date.getDate();

    if(day < 10) {
        day = '0' + date.getDate();
    }

    let paramDate = date.getFullYear() + '-' + month + '-' + day + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    request.post({
        uri : 'http://127.0.0.1:3333/crane/measure',
        headers : {"Content-Type" : "application/json"},
        port: 80,
        method : "POST",
        body : {
            crane_id : "crane_" + (Math.floor(Math.random() * 11) + 1),
            use_timestamp : paramDate,
            gps_lon : lon,
            gps_lat : lat,
            department : '디엑스데이타람쥐',
        },
        json : true,
    }, async (err, response, body) => {
        console.log("데이터삽임 완료..");
     });
}


