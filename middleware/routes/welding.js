const express = require('express');
const mariadb = require('mariadb');
const dbconfig = require('../dbconfig');
const router = express.Router();

const pool = mariadb.createPool(dbconfig.mariaConf2);

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
        let rows = await connection.query(sql, param);

        res.send(rows);
    }).catch(err => {
        console.log(err)
        res.send(err);
    })


});


router.get('/gbs03/current', function(req, res) {

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
        let rows = await connection.query(sql, param);

        res.send(rows);
    }).catch(err => {
        console.log(err)
        res.send(err);
    })
});

router.get('/tbar/current', function(req, res) {
    
})



module.exports = router;