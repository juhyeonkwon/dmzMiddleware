/*  crane.js
*   크레인 정보 POST로 들어오면 정보들을 Maria DB에 저장, 
*   CSV로 들어올경우를 예상해서 insertCSV 쿼리문 작성도 해놨음
*   
*   Date: 2021-11-15
*   Author : juhyeonKwon(dxdata)
*/

const express = require('express');
const mariadb = require('mariadb');
const dbconfig = require('../dbconfig');
const router = express.Router();
const auth = require('../modules/auth')
const pool = mariadb.createPool(dbconfig.mariaConf2);


//실시간 측정값 insert
/**
 * @swagger
 *  /crane/measure:
 *      post:
 *          tags:
 *              - crane
 *          description: 크레인의 실시간 정보를 POST합니다
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CraneMeasure'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/CraneMeasure'
 */
router.post('/measure', async function(req, res) {

    let param = [
        req.body.crane_id,
        req.body.timestamp,
        req.body.gps_lon,
        req.body.gps_lat,
        req.body.department,
        data1 = (req.body.data1 !== undefined) ? req.body.data1 : null,
        data2 = (req.body.data2 !== undefined) ? req.body.data2 : null,
        data3 = (req.body.data3 !== undefined) ? req.body.data3 : null,

    ]


    try {

        let connection = await mariadb.createConnection(dbconfig.mariaConf);
  
        let sql = 'INSERT INTO crane_measure(crane_id, timestamp, gps_lon, gps_lat, department, data1, data2, data3) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
        let rows = await connection.query(sql, param);
    
    
        //실시간 측정값을 crane 테이블에 반영한다.
        let sql2 = 'UPDATE crane SET department = ?, cur_gps_lon = ?, cur_gps_lat = ?, last_timestamp = ? where crane_id = ?'
        let rows2 = await connection.query(sql2, [req.body.department, req.body.gps_lon, req.body.gps_lat,req.body.timestamp,  req.body.crane_id, ]);
    
        req.app.get("io").emit("new", param)
    
        res.send(rows);

        connection.end();

    } catch(e) {
        console.log(e);
        res.send(e);
    }



});


//만약 csv 파일로 보낼경우.
let multer = require('multer');

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './csv/');
    }
})

const upload = multer({storage : storage});
router.post('/csv', upload.single('file') ,async function(req, res) {
    let connection = await pool.getConnection();

    modifyCsv(file, connection);


})

async function modifyCsv(file, conn) {

    fs.readFile(filePath + "/" + file, async function(err, buf) {
        
        let rows = buf.toString().split("\n");

        let temp = []

        for(let i = 1; i < rows.length; i++) {
            if(rows[i] === '')
                    continue;

            rows[i] = rows[i].split(",");
            
            let tempParam = [
                req.body.use_timestamp,
                req.body.crane_id,
                req.body.gps_lon,
                req.body.gps_lat,
                req.body.department
            ];

            rows[i] = tempParam[0] + ',' + tempParam[1] + ',' + tempParam[2] + ',' + tempParam[3] + ',' + tempParam[4]
        }   
        console.log(file + ' : done');            
      
        fs.writeFileSync('../modify/' + file, rows.join('\n'))


        insertCSV(file, conn)               

    });     
}

async function insertCSV(file, conn) {
    
    let path = "/var/lib/mysql/dxdata/20200601.csv";

    let sql = "LOAD DATA LOCAL INFILE '../csv/" + file + "' \n"
    + " REPLACE \n" 
    + " INTO TABLE `dxdata`.`crane` \n" 
    + " COLUMNS TERMINATED BY ',' \n" 
    + " ENCLOSED BY '\"'" 
    + " LINES TERMINATED BY '\\n' \n" 
    + " IGNORE 1 LINES " 
    + " (@csv_col1, @csv_col2, @csv_col3, @csv_col4, @csv_col5, @csv_col6, @csv_col7, @csv_col8) \n" 
    + " SET `crane_id` = @csv_col1, `use_timestamp` = @csv_col2, `gps_lon` = @csv_col3, `gps_lat` = @csv_col4, `department` = @csv_col5;"

    try {
        const rows = await conn.query(sql, []);

        console.log(rows);
    } catch(e) {
        console.log(e);
    } finally {
        
    }        
}

router.post('/rent', async function(req,res) {

    let params = [
        rental_start = req.body.start,
        rental_end = req.body.end,
        department = req.body.department,
        crane_id = req.body.crane_id,
    ]

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        let sql = 'UPDATE crane set rental_start = ?, rental_end = ?, department = ? WHERE crane_id = ?'

        rows = await connection.query(sql, params);

        res.send(rows);
    }).catch(err => {
        console.log(err)
        res.send(err);
    })

});

/**
 * @swagger
 *  /crane/current:
 *      get:
 *          tags:
 *              - crane
 *          description: 크레인의 현재 상태 조회
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Crane'
 *          security:
 *              - JWT: []
 */
router.get('/current', auth.auth, async function(req, res) {
    let rows;
    
    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
        let sql = 'SELECT crane_id, use_yn, CAST(rental_start AS CHAR) as rental_start, CAST(rental_end AS CHAR) as rental_end , cur_gps_lon, cur_gps_lat, department, CAST(last_timestamp AS CHAR) as last_timestamp FROM crane;';
    
        rows = await connection.query(sql);

        res.send(rows);
        connection.end();

    }).catch(err => {
        console.log(err)
        res.send(err)
        connection.end();

    })

})


router.post('/killSwitch', function() {
    mariadb.createConnection(dbconfig.mariaConf).then(connection => {

        for(let i = 1557; i < 2000; i++) {
            try {
                connection.query("KILL "+ i);
            } catch(e) {
                break;
            }
        }


    })
})

module.exports = router;