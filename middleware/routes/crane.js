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


const pool = mariadb.createPool(dbconfig.mariaConf);


//실시간 측정값 insert
router.post('/measure', async function(req, res) {

    let param = [
        req.body.use_timestamp,
        req.body.crane_id,
        req.body.gps_lon,
        req.body.gps_lat,
        req.body.department
    ]

    let connection = await pool.getConnection();
  
    let sql = 'INSERT INTO crane_measure(use_timestamp, crane_id, gps_lon, gps_lat, department) VALUES (?, ?, ?, ?, ?)';

    let rows = await connection.query(sql, param);


    //실시간 측정값을 crane 테이블에 반영한다.
    let sql2 = 'UPDATE crane SET department = ?, cur_gps_lon = ?, cur_gps_lat = ? where crane_id = ?'
    let rows2 = await connection.query(sql2, [req.body.department, req.body.gps_lon, req.body.gps_lat, req.body.crane_id]);

    res.send(rows + rows2);

    connection.end();

});


//만약 csv 파일로 보낼경우.
let multer = require('multer');
const { initOracleClient } = require('oracledb');
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


router.get('/current', async function(req, res) {

    let connection = await pool.getConnection();
  
    let sql = 'SELECT * FROM crane';

    let rows = await connection.query(sql);

    res.send(rows);


})







module.exports = router;