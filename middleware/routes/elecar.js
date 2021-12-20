const express = require('express');
const router = express.Router();
const maria = require('mariadb');
const auth = require('../modules/auth');
const dbconfig = require('../dbconfig');

const redis = require("redis");
const app = require('../server');
const { rows } = require('mssql');

const pool = maria.createPool(dbconfig.mariaConf2);

//레디스 세팅
const client = redis.createClient({
    host : '192.168.0.21',
    port : 6379,
    password : '1234'
});

//elecar의 현재상태를 불러옵니다!!
/**
 * @swagger
 *  /elecar/current:
 *      get:
 *          tags:
 *              - elecar
 *          description: 고소차의 현재 상태 조회
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Elecar'
 *          security:
 *              - JWT: []
 */
router.get('/current', auth.auth, async function(req, res) {

    maria.createConnection(dbconfig.mariaConf).then(async connection => {
        let rows;
        try {
            rows = await connection.query("SELECT eqp_id, current_gps_lon, current_gps_lat, department, CAST(last_timestamp AS CHAR) as last_timestamp, useYN, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM elecar where current_gps_lon != 0");
        } catch(e) {
            rows = e
        }
        res.send(rows);
    
        connection.end();
    })


});

/**
 * @swagger
 *  /elecar/measure:
 *      post:
 *          tags:
 *              - elecar
 *          description: 고소차의 실시간 정보를 POST합니다
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ElecarMeasure'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/ElecarMeasure'
 */
router.post('/measure', async function(req, res) {

    maria.createConnection(dbconfig.mariaConf).then(async connection => {
        let param = [
            req.body.eqp_id,
            parseFloat(req.body.gps_lon),
            parseFloat(req.body.gps_lat),
            parseInt(req.body.eqp_spec_code.slice(0,2)),
            req.body.department,
            req.body.req_no.slice(0,4) + "-" + req.body.req_no.slice(4,6) + "-" + req.body.req_no.slice(6,8),                    //신청 일자(20200812 / 까지)
            req.body.use_date.slice(0,4) + "-" + req.body.use_date.slice(4,6) + "-" + req.body.use_date.slice(6,8),                  //실제 사용 일자 날짜 까지
            req.body.use_timestamp.slice(0,4) + "-" + req.body.use_timestamp.slice(4,6) + "-" + req.body.use_timestamp.slice(6,8) + " " + req.body.use_timestamp.slice(9,11) + ":" + req.body.use_timestamp.slice(11,13) + ":" +req.body.use_timestamp.slice(13,15),                 //사용 시간 시간까지 다
        ]
    
        let rows;
    
        try {
            rows = await connection.query("INSERT INTO elecar_measure(eqp_id, gps_lon, gps_lat, eqp_spec_code, department, req_no, use_date, use_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", param);
    
            //실시간 업데이트 다람쥐..
            row2 = await connection.query("UPDATE elecar set current_gps_lon = ?, current_gps_lat = ?, department = ?, last_timestamp= ?, useYN = 1 WHERE eqp_id = ?", [param[1], param[2], param[4], param[7], param[0]]);
    
            req.app.get("io").emit("new_elecar", param)
    
            client.AUTH('1234', function(err, reply) {
                const key = req.body.eqp_id + "_" + req.body.use_timestamp.slice(0,4) + "-" + req.body.use_timestamp.slice(4,6) + "-" + req.body.use_timestamp.slice(6,8)
    
                let data = JSON.stringify({
                    gps_lon : req.body.gps_lon,
                    gps_lat : req.body.gps_lat,
                    use_timestamp : req.body.use_timestamp.slice(0,4) + "-" + req.body.use_timestamp.slice(4,6) + "-" + req.body.use_timestamp.slice(6,8) + " " + req.body.use_timestamp.slice(9,11) + ":" + req.body.use_timestamp.slice(11,13) + ":" +req.body.use_timestamp.slice(13,15)
                })
    
                client.LPUSH(key, data, function(err, reply) {
                });
    
            })
        } catch(e) {
            console.log(e);
        } finally {
            res.send(rows);  
            connection.end();   
        }    
    })

    
   
});

//elecar의 상세정보를 불러옵니다
/**
 * @swagger
 *  /elecar/locations:
 *      get:
 *          tags:
 *              - elecar
 *          description: 고소차의 상세 정보 조회
 *          parameters:
 *              - in: query
 *                name: key
 *                schema:
 *                  type: string
 *          example:
 *              key: N255_2020-06-01
 *          responses:
 *              "200":
 *                  description: 상세정보
 */
router.get('/locations', function(req, res) {
    
    let key = req.query.key;

    console.log(key)

    client.AUTH("1234", function(err, reply) {
        client.LRANGE(key, 0, -1, function(err, reply) {
            res.send(JSON.parse("[" + reply + "]"));
        })
    });

});


//현재 사용중인 고소차들의 위치를 보여줍니다.
/**
 * @swagger
 *  /elecar/usinglocation:
 *      get:
 *          tags:
 *              - elecar
 *          description: 사용중인 고소차들의 위치 정보 제공
 *          responses:
 *              "200":
 *                  description: 위치정보
 */
router.get('/usinglocation', function(req, res) {
//SELECT eqp_id, current_gps_lon, current_gps_lat FROM elecar WHERE useYN = 1;
    maria.createConnection(dbconfig.mariaConf).then(async connection => {
        let rows;
        try {
            rows = await connection.query("SELECT eqp_id, current_gps_lon, current_gps_lat FROM elecar WHERE useYN = 1");
        } catch(e) {
            rows = e
        }
        res.send(rows);

        connection.end();
    })

});


/**
 * @swagger
 *  /elecar/rent:
 *      post:
 *          tags:
 *              - elecar
 *          description: 고소차를 대여합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ElecarRent'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/ElecarRent'
 *          security:
 *              - JWT: []
 */
router.post('/rent', auth.auth, function(req, res) {

    maria.createConnection(dbconfig.mariaConf).then(async connection => {
        
        const param = [
            id = await auth.verifynotasync(req.headers.authorization.split('Bearer ')[1]).id,
            req.body.start_time,
            req.body.end_time,
            req.body.eqp_id
        ]

        let SQL = "UPDATE elecar SET useYN = 1, department = (SELECT department FROM users WHERE user_id = ?), start_time = ?, end_time = ? WHERE eqp_id = ?";

        try {
            let rows = await connection.query(SQL, param);

            let param2 = [
                req.body.eqp_id,
            ]

            let rows2 = await connection.query("SELECT eqp_id, current_gps_lon, current_gps_lat, department, CAST(last_timestamp AS CHAR) as last_timestamp, useYN, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM elecar WHERE eqp_id = ?", param2);

            await connection.query("INSERT INTO elecar_history(eqp_id, department, date) VALUES (?, (SELECT department FROM users WHERE user_id = ?), ?)", [req.body.eqp_id, param[0], req.body.start_time])

            req.app.get("io").emit("update_elecar", rows2);

            client.AUTH('1234', function(err, reply) {
                const key = req.body.start_time.split(' ')[0]

                client.GET('elecar_' + key, function(err, reply) {
                    if(reply === null) {
                        client.SET('elecar_' + key, '1');
                    } else {
                        let num = parseInt(reply) + 1;
                        
                        client.SET('elecar_' + key, num+'');

                    }
                })
    
            })

            res.send(rows);

        } catch(e) {
            console.log(e)
            res.send(e);
        } finally {
            connection.end();
        }    
    });
});

/**
 * @swagger
 *  /elecar/return:
 *      post:
 *          tags:
 *              - elecar
 *          description: 사용중인 고소차를 반납합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ElecarReturn'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/ElecarReturn'
 *          security:
 *              - JWT: []
 */
router.post('/return', auth.auth, function(req, res) {
    maria.createConnection(dbconfig.mariaConf).then(async connection => {
        
        const param = [
            req.body.eqp_id
        ]

        let SQL = "UPDATE elecar SET useYN = 0, department = '', start_time = null, end_time = null WHERE eqp_id = ?";

        try {
            let rows = await connection.query(SQL, param);

            let rows2 = await connection.query("SELECT eqp_id, current_gps_lon, current_gps_lat, department, CAST(last_timestamp AS CHAR) as last_timestamp, useYN, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM elecar WHERE eqp_id = ?", param);

            req.app.get("io").emit("update_elecar", rows2);

            res.send(rows);

        } catch(e) {
            console.log(e)
            res.send(e);
        } finally {
            connection.end();
        }

    
    });
})

//고소차에대한 예약을 확인합니다.
/**
 * @swagger
 *  /elecar/reservation:
 *      get:
 *          tags:
 *              - elecar
 *          description: 고소차에 대한 예약을 확인합니다.
 *          parameters:
 *              - in: query
 *                name: eqp_id
 *                schema:
 *                  type: string
 *              - in: query
 *                name: date
 *                schema:
 *                  type: string
 *          example:
 *              key: N255
 *              date : 2020-06-01
 *          responses:
 *              "200":
 *                  description: 상세정보
 */
router.get('/reservation', function(req, res) {

    console.log(req.query.eqp_id);
    console.log(req.query.date);
    
    maria.createConnection(dbconfig.mariaConf).then(async connection => {

        const SQL = "SELECT reserv_id, eqp_id, start_time, end_time, department  FROM elecar_reservation e WHERE eqp_id = ? AND e.date = ?;"

        let param = [
            req.query.eqp_id,
            req.query.date
        ];

        try {
            let rows = await connection.query(SQL, param);

            res.send(rows);

        } catch(e) {
            res.send(e);
        } finally {
            connection.end();
        }

    })


});

/**
 * @swagger
 *  /elecar/reservation:
 *      post:
 *          tags:
 *              - elecar
 *          description: 고소차에 대해 예약을 합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ElecarReserv'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/ElecarReserv'
 *          security:
 *              - JWT: []
 */
router.post('/reservation', auth.auth, function(req, res) {
    //INSERT INTO elecar_reservation(eqp_id, date, start_time, end_time, department) VALUES ('N-229', '2021-12-07', '15:00', '1:00', '디엑스데이타람쥐');
    
    maria.createConnection(dbconfig.mariaConf).then(async connection => {
        let param = [
            req.body.eqp_id,
            req.body.date,
            req.body.start_time,
            req.body.end_time,
            req.body.department
        ];

        const SQL = "INSERT INTO elecar_reservation(eqp_id, date, start_time, end_time, department) VALUES (?, ?, ?, ?, ?)";

        try {
            let rows = await connection.query(SQL, param);

            res.send(rows);

        } catch(e) {
            res.send(e);
        } finally {
            connection.end();
        }
    })
})


/**
 * @swagger
 *  /elecar/canclereserve:
 *      delete:
 *          tags:
 *              - elecar
 *          description: 고소차에 대해 예약을 취소합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - reserv_id
 *                          properties:
 *                               reserv_id:
 *                                  type: string
 *          responses:
 *              "200":
 *                  description: 삭제정보
 *          security:
 *              - JWT: []
 */
router.delete('/canclereserve', auth.auth, function(req, res) {
    
    maria.createConnection(dbconfig.mariaConf).then(async connection => {
        let param = [
            req.body.reserv_id,
        ];

        const SQL = "DELETE FROM elecar_reservation WHERE reserv_id = ?";

        try {
            let rows = await connection.query(SQL, param);

            res.send(rows);

        } catch(e) {
            res.send(e);
        } finally {
            connection.end();
        }
    })
});



//최근 일주일간의 주간 사용량 제공 
/**
 * @swagger
 *  /elecar/usage:
 *      get:
 *          tags:
 *              - elecar
 *          description: 고소차의 최근 7일 사용량을 제공합니다
 *          responses:
 *              "200":
 *                  description: 주간사용량
 */
router.get('/usage', async function(req, res) {
    let today = new Date();

    // today.setHours(today.getHours() + 9);


    function toStr(date) {

        function zeroNumber(num) {
            if(num < 10) {
                return '0'+ num;
            } else {
                return num;
            }
        }       

        return date.getFullYear() + '-' + zeroNumber(date.getMonth() + 1) + '-' + zeroNumber(date.getDate())
    }

    let keys = [];

    keys.push(toStr(today))

    for(let i = 0; i < 6; i++ ) {       
        today.setDate(today.getDate() - 1);

        keys.push(toStr(today))
    }    

    client.AUTH('1234', async function(err, reply) {
        let rows = []
        for(let i = 0; i < keys.length; i++ ) {
            client.GET('elecar_' + keys[i], function(err, reply) {
                if(reply === null) {
                    rows.push({date : keys[i], amount : 0})
                } else {
                    rows.push({date : keys[i], amount : parseInt(reply)});
                }

                if(i == 6) {
                    res.send(rows)
                }
            });
        }       
        
    });    
})



module.exports = router;