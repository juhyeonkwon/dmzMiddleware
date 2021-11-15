/*오라클 DB일 경우 사용하는 서버에서 oracle client를 다운받아야합니다!*/

module.exports = {
    oracleConf : {
        user : '',
        password : '',
        host : '',
        database : '',
    },
    mysqlConf : {
        user: '',
        password: '',
        host : '',
        database: '',
    },
    mssqlConf : {
        server: '', 
        authentication: {
            type: 'default',
            options: {
                userName: '',
                password: ''
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            //encrypt: true,
            database: ''
        }
    },
    mariaConf : {
        host : "192.168.0.21",
        port : '3307',
        user : 'root',
        password : 'root!',
        database: "dxdata",
        permitLocalInfile : 'true'    
    },
}

