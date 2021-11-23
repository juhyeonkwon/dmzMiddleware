const express = require('express');
const router = express.Router();
const maria = require('mariadb');
const auth = require('../modules/auth');
const dbconfig = require('../dbconfig');


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

    
    let connection = await maria.createConnection(dbconfig.mariaConf);

    let rows;
    try {
        rows = await connection.query("SELECT * FROM elecar");
    } catch(e) {
        rows = e
    }

    res.send(rows);

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

    let connection = await maria.createConnection(dbconfig.mariaConf);

    let param = [
        req.body.eqp_id,
        req.body.gps_lon,
        req.body.gps_lat,
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
        row2 = await connection.query("UPDATE elecar set current_gps_lon = ?, current_gps_lat = ?, department = ?, last_timestamp= ? WHERE eqp_id = ?", [param[1], param[2], param[4], param[7], param[0]]);

        console.log(rows);
    } catch(e) {
        console.log(e);
    } finally {
        res.send(rows);     
    }        



})


module.exports = router;