const express = require('express');
const mariadb = require('mariadb');
const dbconfig = require('../dbconfig');
const router = express.Router();
const auth = require('../modules/auth');
const redis = require('redis')


//레디스 세팅
const client = redis.createClient({
    host : '192.168.0.21',
    port : 6379,
    password : '1234'
});

/**
 * @swagger
 *  /welding/gbs03/measure:
 *      post:
 *          tags:
 *              - welding
 *          description: GBS03 용접기의 실시간 정보를 전송합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/WeldingMeasure'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/WeldingMeasure'
 */
router.post('/gbs03/measure', async function(req, res) {

    let param = [
        req.body.eqp_id,
        req.body.date,
        req.body.acquisition_rate,
        req.body.welding_time,
        req.body.avg_amp,
        req.body.avg_volt,
        req.body.avg_welding_volt,
        req.body.avg_wirespeed,
        req.body.sum_wire,
        req.body.sum_inching_wire,
        req.body.sum_total_wire,
    ]

    let sql = "INSERT INTO gbs03_measure(eqp_id, date, acquisition_rate, welding_time, avg_amp, avg_volt, avg_welding_volt, avg_wirespeed, sum_wire, sum_inching_wire, sum_total_wire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )"
    
    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        try {
            let rows = await connection.query(sql, param);

            res.send(rows);
    
            client.AUTH('1234', function(err, reply) {
                client.GET(param[1] + '_watt_' + 'gbs03' , function(err, reply) {
                    let watt = parseFloat(req.body.avg_amp) * parseFloat(req.body.avg_welding_volt);                    
                    if(reply === null) {
                        client.SET(param[1] + '_watt_' + 'gbs03',  watt);
                    } else {
                        watt = watt + parseFloat(reply);
                        client.SET(param[1] + '_watt_' + 'gbs03',  watt);
                    }
                })    
            });
        } catch (e) {
            res.send(e);
        } finally {
            connection.end()
        }
     
    }).catch(err => {
        console.log(err)
        res.send(err);
    })


});

/**
 * @swagger
 *  /welding/gbs03/current:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기 gbs03의 현재 상태를 불러옵니다
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Welding'
 *          security:
 *              - JWT: []
 */
router.get('/gbs03/current', auth.auth, function(req, res) {

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        
        let sql = "SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM gbs03";

        try {
            let rows = await connection.query(sql);

            res.send(rows);
        } catch(e) {
            res.status(401).json({ error : 'db error'})
        } finally {
            connection.end();
        }

    });

});



/**
 * @swagger
 *  /welding/gbs03/measure:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기 gbs03의 측정 정보들을 가져옵니다. (GBS031404)
 *          parameters:
 *              - in: query
 *                name: eqp_id
 *                schema:
 *                  type: string
 *          example:
 *              eqp_id: GBS031404
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *          security:
 *              - JWT: []
 */
router.get('/gbs03/measure', auth.auth, function(req,res) {

    let eqp_id = req.query.eqp_id;

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
            
        let sql = "SELECT idx, eqp_id, CAST(date AS CHAR) as date, acquisition_rate, welding_time, avg_amp, avg_volt, avg_welding_volt, avg_wirespeed, sum_wire, sum_inching_wire, sum_total_wire FROM gbs03_measure WHERE eqp_id = ?";

            try {
                let rows = await connection.query(sql, [eqp_id]);

                res.send(rows);
            } catch(e) {
                res.status(401).json({ error : 'db error'})
            } finally {
                connection.end();
            }

    });
});

/**
 * @swagger
 *  /welding/gbs03/average:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기 gbs03의 평균 정보를 가져옵니다. (GBS031404)
 *          parameters:
 *              - in: query
 *                name: eqp_id
 *                schema:
 *                  type: string
 *          example:
 *              eqp_id: GBS031404
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *          security:
 *              - JWT: []
 */
router.get('/gbs03/average', auth.auth, function(req, res) {

    let eqp_id = req.query.eqp_id;


    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

        let sql = "SELECT eqp_id, avg(acquisition_rate) AS acquisition_rate, avg(welding_time) AS welding_time, AVG(avg_amp) AS avg_amp, AVG(avg_volt) AS avg_volt, AVG(avg_welding_volt) AS avg_welding_volt, AVG(avg_wirespeed) AS avg_wirespeed , AVG(sum_wire) AS sum_wire, AVG(sum_inching_wire) AS sum_inching_wire, AVG(sum_total_wire) AS sum_total_wire FROM gbs03_measure where eqp_id = ? GROUP BY eqp_id"

        try {
            let rows = await connection.query(sql, [eqp_id])

            res.send(rows)
        } catch(err) {
            console.log(err);
            res.status(401).json({ error : 'db error'})
        } finally {
            connection.end();
        }

    })
})

/**
 * @swagger
 *  /welding/tbar/measure:
 *      post:
 *          tags:
 *              - welding
 *          description: tbar 용접기의 실시간 정보를 전송합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/WeldingMeasure'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/WeldingMeasure'
 */
router.post('/tbar/measure', function(req, res) {
    let param = [
        req.body.eqp_id,
        req.body.date,
        req.body.acquisition_rate,
        req.body.welding_time,
        req.body.avg_amp,
        req.body.avg_volt,
        req.body.avg_welding_volt,
        req.body.avg_wirespeed,
        req.body.sum_wire,
        req.body.sum_inching_wire,
        req.body.sum_total_wire,
    ]


    let sql = "INSERT INTO tbar_measure(eqp_id, date, acquisition_rate, welding_time, avg_amp, avg_volt, avg_welding_volt, avg_wirespeed, sum_wire, sum_inching_wire, sum_total_wire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )"

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
      try {
        let rows = await connection.query(sql, param);

        res.send(rows);

        
        client.AUTH('1234', function(err, reply) {
            client.GET(param[1] + '_watt_' + 'tbar' , function(err, reply) {
                let watt = parseFloat(req.body.avg_amp) * parseFloat(req.body.avg_welding_volt);                    
                if(reply === null) {
                    client.SET(param[1] + '_watt_' + 'tbar',  watt);
                } else {
                    watt = watt + parseFloat(reply);
                    client.SET(param[1] + '_watt_' + 'tbar',  watt);
                }
            })    
        });
      } catch(e) {
          res.send(e);
      } finally {
          connection.end();
      }
    }).catch(err => {
        console.log(err)
        res.send(err);
    })
});




/**
 * @swagger
 *  /welding/tbar/current:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기 tbar의 현재 상태를 불러옵니다
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Welding'
 *          security:
 *              - JWT: []
 */
router.get('/tbar/current', auth.auth, function(req, res) {

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        
        let sql = "SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM tbar";

        try {
            let rows = await connection.query(sql);

            res.send(rows);
        } catch(e) {
            res.status(401).json({ error : 'db error'})
        } finally {
            connection.end();
        }

    });
});


/**
 * @swagger
 *  /welding/tbar/measure:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기 tbar의 측정 정보들을 가져옵니다. (TBAR0001)
 *          parameters:
 *              - in: query
 *                name: eqp_id
 *                schema:
 *                  type: string
 *          example:
 *              eqp_id: TBAR0001
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *          security:
 *              - JWT: []
 */
 router.get('/tbar/measure', auth.auth, function(req,res) {

    let eqp_id = req.query.eqp_id;

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
            

        let sql = "SELECT idx, eqp_id, CAST(date AS CHAR) as date, acquisition_rate, welding_time, avg_amp, avg_volt, avg_welding_volt, avg_wirespeed, sum_wire, sum_inching_wire, sum_total_wire FROM tbar_measure WHERE eqp_id = ?";

        try {
            let rows = await connection.query(sql, [eqp_id]);

            res.send(rows);
        } catch(e) {
            res.status(401).json({ error : 'db error'})
        } finally {
            connection.end();
        }

    });
});

/**
 * @swagger
 *  /welding/tbar/average:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기 tbar의 평균 정보를 가져옵니다. (TBAR0001)
 *          parameters:
 *              - in: query
 *                name: eqp_id
 *                schema:
 *                  type: string
 *          example:
 *              eqp_id: TBAR0001
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *          security:
 *              - JWT: []
 */
router.get('/tbar/average', auth.auth, function(req, res) {

    let eqp_id = req.query.eqp_id

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

        let sql = "SELECT eqp_id, avg(acquisition_rate) AS acquisition_rate, avg(welding_time) AS welding_time, AVG(avg_amp) AS avg_amp, AVG(avg_volt) AS avg_volt, AVG(avg_welding_volt) AS avg_welding_volt, AVG(avg_wirespeed) AS avg_wirespeed , AVG(sum_wire) AS sum_wire, AVG(sum_inching_wire) AS sum_inching_wire, AVG(sum_total_wire) AS sum_total_wire FROM tbar_measure where eqp_id = ? GROUP BY eqp_id"

        try {
            let rows = await connection.query(sql, eqp_id)

            res.send(rows)
        } catch(err) {
            res.status(401).json({ error : 'db error'})
        } finally {
            connection.end();
        }

    })
});

/**
 * @swagger
 *  /welding/using:
 *      get:
 *          tags:
 *              - welding
 *          description: 현재 사용중인 용접기들의 리스트를 불러옵니다.
 *          responses:
 *              "200":
 *                  description: 사용중인 용접기 리스트
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Welding'
 *          security:
 *              - JWT: []
 */
 router.get('/using', auth.auth, function(req, res) {

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        
        let sql = "SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department, type, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM gbs03 WHERE use_yn = 1 UNION SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department, type, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM tbar WHERE use_yn = 1 ";


        

        try {
            let rows = await connection.query(sql);

            res.send(rows);
        } catch(e) {
            console.log(e)
            res.status(401).json({ error : 'db error'})
        } finally {
            connection.end();
        }

    });

});



//사용량을 확인합니다람쥐..
/**
 * @swagger
 *  /welding/usage:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기의 사용량을 확인합니다! tbar 또는 gbs03을 파라미터로 받습니다.
 *          parameters:
 *              - in: query
 *                name: type
 *                schema:
 *                  type: string
 *          example:
 *              type: gbs03
 *          responses:
 *              "200":
 *                  description: 사용량
 *          security:
 *              - JWT: []
 */
 router.get('/usage', auth.auth, function(req, res) {
    let type;
    if(req.query.type === 'tbar') {
        type = 'tbar'
    } else {
        type = 'gbs03'
    }

    let today = new Date();
    let month = (today.getMonth() + 1) < 10 ? '0'+ (today.getMonth() + 1) : (today.getMonth() + 1);
    let day = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
    let date = today.getFullYear() + '-' +  month + '-' + day;

    client.AUTH('1234', function(err, reply) {
        client.GET('welding_' + type + '_' + date, function(err, reply) {

            if(reply === null) {
                res.send('{}');
            } else {
                let json = JSON.parse(reply);

                res.send(json);
            }
        })    
    });
});

//일주일간 전력 사용량 확인
/**
 * @swagger
 *  /welding/watts:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기의 전력 사용량을 확인합니다. query로 gbs03, tbar를 입력합니다.
 *          parameters:
 *              - in: query
 *                name: type
 *                schema:
 *                  type: string
 *          example:
 *              type: gbs03
 *          responses:
 *              "200":
 *                  description: 사용량
 *          security:
 *              - JWT: []
 */
 router.get('/watts', auth.auth, function(req, res) {
    
    let type = req.query.type;
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
            client.GET(keys[i] + '_watt_' + type, function(err, reply) {
                if(reply === null || reply === NaN) {
                    rows.push({date : keys[i], amount : 0})
                } else {
                    rows.push({date : keys[i], amount : parseFloat(reply)});
                }

                if(i == 6) {
                    res.send(rows)
                }
            });
        }       
        
    });    
});

//일주일간 전력 사용량 확인
/**
 * @swagger
 *  /welding/watts/rank:
 *      get:
 *          tags:
 *              - welding
 *          description: 전날 전력 사용량이 높은 용접기들을 확인합니다(10개). query로 gbs03, tbar를 입력합니다.
 *          parameters:
 *              - in: query
 *                name: type
 *                schema:
 *                  type: string
 *          example:
 *              type: gbs03
 *          responses:
 *              "200":
 *                  description: 사용량
 *          security:
 *              - JWT: []
 */
 router.get('/watts/rank', auth.auth, function(req, res) {
    
    let type = req.query.type;
    let today = new Date();
    today.setDate(today.getDate() - 1);

    let sql;

    if(type === 'gbs03') {
        sql = "SELECT eqp_id, CAST(date AS CHAR) as date, acquisition_rate, welding_time, avg_amp, avg_volt, avg_amp * avg_volt AS watt, avg_welding_volt, avg_wirespeed, sum_wire, sum_inching_wire, sum_total_wire FROM gbs03_measure g WHERE g.date = ? ORDER BY watt DESC LIMIT 10";
    } else {
        sql = "SELECT eqp_id, CAST(date AS CHAR) as date, acquisition_rate, welding_time, avg_amp, avg_volt, avg_amp * avg_volt AS watt, avg_welding_volt, avg_wirespeed, sum_wire, sum_inching_wire, sum_total_wire FROM tbar_measure g WHERE g.date = ? ORDER BY watt DESC LIMIT 10"
    }

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

    let paramDate = toStr(today);

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

        try {
            let rows = await connection.query(sql, [ paramDate ]);

            res.send(rows);
        } catch(e) {
            console.log(e)
            res.status(401).json({ error : 'db error'})
        } finally {
            connection.end();
        }
    })
    
});

//대여
/**
 * @swagger
 *  /welding/rent:
 *      put:
 *          tags:
 *              - welding
 *          description: 용접기를 대여합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/WeldingRent'
 *          responses:
 *              "200":
 *                  description: 1
 *              "401":
 *                  description: -1
 *          security:
 *              - JWT: []
 */
router.put('/rent', auth.auth, async function(req, res) {
    
    //파라미터로 tbar인지 gbs03인지 여부를 받는다

    let sql, sql2, type;
    if(req.body.type === 'tbar') {
        sql = 'UPDATE tbar set use_yn = 1, department = (SELECT department FROM users WHERE user_id = ?), start_time = ?, end_time = ? where eqp_id = ?';
        sql2 = "SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM tbar where eqp_id = ?";
        type = 'tbar'
    } else {
        sql = 'UPDATE gbs03 set use_yn = 1, department = (SELECT department FROM users WHERE user_id = ?), start_time = ?, end_time = ? where eqp_id = ?';
        sql2 = "SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department, CAST(start_time AS CHAR) as start_time, CAST(end_time AS CHAR) as end_time FROM gbs03 where eqp_id = ?";
        type = 'gbs03'
    }

    const param = [
        id = await auth.verifynotasync(req.headers.authorization.split('Bearer ')[1]).id,
        req.body.start_time,
        req.body.end_time,
        req.body.eqp_id,
    ]

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

        try {
            let rows = await connection.query(sql, param);
        
            if(rows.affectedRows != 1) {
                res.send({ status : -1});
            } else {
                res.send(rows)
            }

            let rows2 = await connection.query(sql2, [ req.body.eqp_id ]);

            req.app.get("io").emit("rent_welding", rows2);

            client.AUTH('1234', function(err, reply) {
                const key = req.body.start_time.split(' ')[0]

                client.GET('welding_' + type + '_' + key, function(err, reply) {
                    let eqp_id = req.body.eqp_id;

                    if(reply === null) {
                        let tempjson = { };
                        tempjson[eqp_id + ''] = 1;
                        client.SET('welding_' + type + '_' + key, JSON.stringify(tempjson));
                    } else {
                        let json = JSON.parse(reply);

                        if(json[eqp_id+''] === undefined) {
                            json[eqp_id+''] = 1;
                        } else {
                            json[eqp_id+''] = json[eqp_id+''] + 1
                        }
                        client.SET('welding_' + type + '_' + key, JSON.stringify(json));
                    }
                })    
            })

        } catch(e) {
            res.send({ status : -1});
        } finally {
            connection.end();
        }
    })
});




/**
 * @swagger
 *  /welding/return:
 *      put:
 *          tags:
 *              - welding
 *          description: 용접기를 반납합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/WeldingReturn'
 *          responses:
 *              "200":
 *                  description: 1
 *              "401":
 *                  description: -1
 *          security:
 *              - JWT: []
 */
router.put('/return', auth.auth, async function(req, res) {
    
    //파라미터로 tbar인지 gbs03인지 여부를 받는다

    let sql, sql2
    if(req.body.type === 'tbar') {
        sql = "UPDATE tbar set use_yn = 0, department = '', start_time = null, end_time = null where eqp_id = ?"
        sql2 = "SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department FROM tbar where eqp_id = ?";


    } else {
        sql = "UPDATE gbs03 set use_yn = 0, department = '', start_time = null, end_time = null where eqp_id = ?"
        sql2 = "SELECT eqp_id, CAST(last_timestamp AS CHAR) as last_timestamp, use_yn, department FROM gbs03 where eqp_id = ?";

    }

    const param = [
        req.body.eqp_id,
    ]

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

        try {
            let rows = await connection.query(sql, param);
        
            if(rows.affectedRows != 1) {
                res.send({ status : -1});
            } else {
                res.send(rows)
            }

            let rows2 = await connection.query(sql2, [ req.body.eqp_id ]);

            req.app.get("io").emit("rent_welding", rows2);

        } catch(e) {
            res.send({ status : -1});
        } finally {
            connection.end();
        }
    })
});


/**
 * @swagger
 *  /welding/reservation:
 *      get:
 *          tags:
 *              - welding
 *          description: 용접기에 대한 예약을 확인합니다.
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
 *              key: TBAR0001
 *              date : 2021-12-17
 *          responses:
 *              "200":
 *                  description: 예약정보
 */
 router.get('/reservation', function(req, res) {
    
    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

        const SQL = "SELECT reserv_id, eqp_id, start_time, end_time, department, type  FROM welding_reservation e WHERE eqp_id = ? AND e.date = ?;"

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
 *  /welding/reservation:
 *      post:
 *          tags:
 *              - welding
 *          description: 용접기에 대해 예약을 합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/WeldingReserv'
 *          responses:
 *              "200":
 *                  description: affectedRows 
 *          security:
 *              - JWT: []
 */
router.post('/reservation', auth.auth, function(req, res) {
    console.log(req.body)
    //INSERT INTO welding_reservation(eqp_id, date, start_time, end_time, department, type) VALUES ('', '2021-12-07', '15:00', '1:00', '디엑스데이타람쥐');
    
    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        let param = [
            req.body.eqp_id,
            req.body.date,
            req.body.start_time,
            req.body.end_time,
            req.body.department,
            req.body.type
        ];

        const SQL = "INSERT INTO welding_reservation(eqp_id, date, start_time, end_time, department, type) VALUES (?, ?, ?, ?, ?, ?)";

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
 *  /welding/canclereserve:
 *      delete:
 *          tags:
 *              - welding
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
    
    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        let param = [
            req.body.reserv_id,
        ];

        const SQL = "DELETE FROM welding_reservation WHERE reserv_id = ?";

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




module.exports = router;