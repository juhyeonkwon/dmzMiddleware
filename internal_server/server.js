/* 내부 서버에서 실행시키는 파일입니다. NodeJs로 실행시켜야합니다!*/

const mysql = require('mysql');
const oracle = require('oracledb');
const tedious = require('tedious');
const request = require('request');



//메인 폴더의 dbconfig에서 user, pw, host, db등 수정해 주세요.
const dbconfig = require("./dbconfig");

oracle.autoCommit = true;


getMysql();

function getMysql() {

    request.get({
        url : 'http://127.0.0.1:3333/api/',
        port: 80,
        method : "GET"
    }, async (err, response, body) => {
        console.log(JSON.parse(body));
        let data = JSON.parse(body);
            
        let sql = "INSERT INTO 테이블명(col, col col) VALUES (?, ?, ?)"
    
        /*mysql*/
        let connection = mysql.createConnection(dbconfig.mysqlConf);

        connection.connect();

        for(let i = 0; i < data.length; i++) {
            let param = [
                data[i].col1,
            ]
            connection.query(sql, param, function(err, result, fields) {
                if(err) {
                    console.error(err);
                    return ;
                }

                console.log(result);
                console.log('Insert Done : ' + params); 
            });
        }
        connection.end();     
    });  
}   

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

