const express = require('express');
const router = express.Router();


//전역변수 활용
let body_data = new Array();

//전역변수를 활용해서 캐시, 서버에서 데이터를 가져가게 함
router.post('/', function(req, res) {
    console.log(req.body)
    //post로 받은 body 데이터를 data변수에 할당합니다.
    body_data.push(req.body);    
    res.send(body_data)
});

router.get('/', function(req, res) {
    let resData = body_data;
    body_data = []
    res.send(resData);
});


//redis를 활용해서 서버에서 데이터를 가져가게 함
const redis = require('redis');
const client = redis.createClient({
    host : '192.168.0.21',
    port : 6379,
    password : '1234'
})

router.post('/redis', function(req, res) {

    client.AUTH('1234', (err, reply) => {
        if(err) {
            console.log(err);
            return ;
        }

        console.log(req.body)

        client.LPUSH("data", JSON.stringify(req.body));   

        res.send("데이터 삽입 완료");
     });
});

router.get('/redis', function(req, res) {
    client.AUTH('1234', (err, reply) => {
        if(err) {
            console.log(err);
            return ;
        }
        client.LRANGE("data", 0, -1, function(err, reply) {
            let res_data = JSON.parse("[" + reply + "]");

            client.DEL("data");

            res.send(res_data);
        })
    });
});


    
router.post('/mongo', function(req,res) {

})

module.exports = router;
