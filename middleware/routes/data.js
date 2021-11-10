const express = require('express');
const mysql = require('mysql');
const oracle = require('oracledb');
const tedious = require('tedious');
const router = express.Router();

//메인 폴더의 dbconfig에서 user, pw, host, db등 수정해 주세요.
const dbconfig = require("../dbconfig");

oracle.autoCommit = true;


router.post('/', function(req, res) {

    //post로 받은 body 데이터를 data변수에 할당합니다.
    let data = req.body;

    
    //DB에 저장할 데이터들을 입력 해주세요 
    params = [
        
    ]

    let sql = "INSERT INTO 테이블명(col, col col) VALUES (?, ?, ?)"
   
    /*mysql*/
    let connection = mysql.createConnection(dbconfig.mysqlConf);

    connection.connect();

    connection.query(sql, param, function(err, result, fields) {
        if(err) {
            console.error(err);
            return ;
        }

        console.log(result);
        console.log('Insert Done : ' + params); 
    });

    connection.end(); 
    /*mysql 끝 */



    /*oracleDB*/
    // oracle.getConnection(dbconfig.oracleConf, function(err, connection) {
    //     connection.execute(sql, params, function(err, result) {
            
    //         if(err) {
    //             console.error(err);
    //             return ;
    //         }

    //         console.log(result);
    //         console.log('Insert Done : ' + params); 
    //     });
    // });
    /*oracle 끝 */

    /*mssql*/
    // let msconn = new tedious.Connection(dbconfig.mssqlConf);
    // msconn.on('connect', (err) => {
    //     if(err) {
    //         console.error(err);
    //     }

    //     let sql = "INSERT INTO 테이블명(col1, col2, col3) VALUES (@col1, @col2, @col3);"
    //     let request = new tedious.Request(sql, (err) => {
    //         if(err) {
    //             console.error(err);
    //         }
    //     });
    
    //     request.addParameter('col1', TYPES.NvarChar, 'col1 입력');
    //     request.addParameter('col2', TYPES.NvarChar, 'col2 입력');
    //     request.addParameter('col3', TYPES.Int, 3);
    
        //  request.on('row', (columns) => {
        //     columns.forEach((column) => {
        //         console.log('Insert Done : ' + column)
        //     })
        // });
    
    //     request.on("requestCompleted", function (rowCount, more) {
    //         msconn.close();
    //     });

    //     msconn.execSql(request);
    // });

    /*mssql 끝*/

})


router.get('/', function(req, res) {

    res.send("data");
});

//mssql function
function executeQuery() {

}

module.exports = router;
