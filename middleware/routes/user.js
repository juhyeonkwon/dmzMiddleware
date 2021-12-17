const express = require('express');
const mariadb = require('mariadb');
const dbconfig = require('../dbconfig');
const router = express.Router();
const jwt = require('../modules/auth')
const crypto = require('crypto');
const secret = require('../config/secret');
const auth = require('../modules/auth');

const pool = mariadb.createPool(dbconfig.mariaConf);


//register
/**
 * @swagger
 *  /auth/signup:
 *      post:
 *          tags:
 *              - user
 *          description: 회원가입을 합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/UserSignup'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                             $ref: '#/components/schemas/Insert'
 */
router.post('/signup', async function(req, res) {    

    let SQL = "INSERT INTO users(user_id, user_password, department) VALUES(?, ?, ?) "

    const password = crypto.createHmac("sha256", secret.secretKey).update(req.body.password).digest('hex');

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
       let rows;
        try {
            rows = await connection.query(SQL, [req.body.id, password, req.body.department, req.body.admin]);
        } catch (e) {
            rows = e
        } finally {
            res.send(rows)
            connection.end();

        }
        
    })

});


//id 중복을 찾습니다람쥐!!!
/**
 * @swagger
 *  /auth/overlap:
 *      post:
 *          tags:
 *              - user
 *          description: 중복을 확인합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Overlap'
 *          responses:
 *              '200':
 *                  description: 0은 중복 있음, 1은 중복 없음
 * 
 */
 router.post('/overlap', async function(req, res) {
    let connection = await mariadb.createConnection(dbconfig.mariaConf);

    const SQL = 'SELECT user_id FROM users where user_id = ?';

    let rows = await connection.query(SQL, [ req.body.id ]);

    if(rows.length === 0) {
        res.send('1')
    } else {
        res.send('0');
    }

    connection.end();
})


//login
//1 = 로그인 성공, 0 = 로그인 정보 불일치, -1 오류 발생
/**
 * @swagger
 *  /auth/login:
 *      post:
 *          tags:
 *              - user
 *          description: 로그인을 합니다
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          responses:
 *              "200":
 *                  description: 토큰값을 가져옵니다.
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              properties:
 *                                  auth:
 *                                      type: string
 * 
 */
router.post('/login', async function(req, res) {

    console.log('login');
    let param = [
        id = req.body.id,
    ]

    let password = crypto.createHmac("sha256", secret.secretKey).update(req.body.password).digest('hex')

    let connection = await mariadb.createConnection(dbconfig.mariaConf);

    let SQL = "SELECT user_id, user_password, department, admin from users where user_id = ?";

    let rows;

    try {
        rows = await connection.query(SQL, param);

        if(rows.length === 0) {
            res.send('0');
            return ;
        }
    } catch(e) {
        console.log(e);
        res.send('-1');
        return ;
    }

    //비밀번호가 일치한다면 토큰을 생성해서 토큰을 저장합니다!! 그리고 토큰을 전달합니다람쥐!!!
    if(await checkPassword(rows[0].user_password, password)) {
        const token = jwt.generate(req.body.id, rows[0].admin);
        try {
            await connection.query("UPDATE users SET token = ? WHERE user_id = ?", [token, req.body.id]);
            res.send({
                token : token,
                department : rows[0].department,
                admin : rows[0].admin
            })
        } catch(e) {
            console.log(e);
            res.send('-1');
            return ;
        } finally {
            connection.end();
        }

    } else {
        connection.end();

        res.send('0');
        return ;
    }

    // console.log(jwt.verify(req.body.token))

});

async function checkPassword(password, password2) {
    if(password === password2) {
        return true;
    } else {
        return false;
    }

}


//유저 수정
/**
 * @swagger
 *  /auth/modify_auth:
 *      put:
 *          tags:
 *              - user
 *          description: 유저들의 부서와 권한을 수정합니다. 배열로 값을 받습니다
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/UserModifyAuth'
 *          responses:
 *              "200":
 *                  description: 수정 성공 메세지
 *          security:
 *              - JWT: []
 */
router.put('/modify_auth', auth.auth, auth.verifyAdmin, function(req, res) {
    console.log(req.body[0]);


    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {       

        let sql = 'UPDATE users set department = ?, admin = ? where idx = ?'
        let param;

        for(let i = 0; i < req.body.length; i++) {

            param = [req.body[i].department, req.body[i].admin, req.body[i].idx]

            try {
                await connection.query(sql, param);
            } catch (e) {
                res.send(e);
                connection.end();
                break;
            } finally {
                if(i === (req.body.length - 1)) {
                    res.status(200).json({ status : 1});
                    connection.end();
                }

            }
        }



    });
});

/**
 * @swagger
 *  /auth/delete:
 *      delete:
 *          tags:
 *              - user
 *          description: 유저를 삭제합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/UserDelete'
 *          responses:
 *              "200":
 *                  description: 삭제 성공 메세지
 *          security:
 *              - JWT: []
 */
 router.delete('/delete', auth.auth, auth.verifyAdmin, function(req, res) {

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {       

        let sql = 'delete from users where user_id = ?'
        let param = [req.body.id]

        let rows;

        try {
            rows = await connection.query(sql, param);
            res.status(200).json({ status : 1});

        } catch (e) {
            rows = e;
            res.end(e)
        } finally {
            connection.end();
        }
    });
});



/**
 * @swagger
 *  /auth/password_user:
 *      put:
 *          tags:
 *              - user
 *          description: 사용자가 직접 자신의 비밀번호를 수정합니다. 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Password'
 *          responses:
 *              "200":
 *                  description: 수정 성공 메세지
 *          security:
 *              - JWT: []
 */
router.put('/password_user', auth.auth, async function(req, res) {

    let token = req.headers.authorization.split('Bearer ')[1];

    let value = await jwt.verify(token)


    let param = [
        id = value.id,
    ]

    let password = crypto.createHmac("sha256", secret.secretKey).update(req.body.password).digest('hex')

    let connection = await mariadb.createConnection(dbconfig.mariaConf);

    let SQL = "SELECT user_id, user_password from users where user_id = ?";

    let rows;

    try {
        rows = await connection.query(SQL, param);

        if(rows.length === 0) {
            res.send('0');
            return ;
        }
    } catch(e) {
        console.log(e);
        res.send('-1');
        return ;
    }

    //비밀번호가 일치한다면 비밀번호를 변경합니다.
    if(await checkPassword(rows[0].user_password, password)) {
        let new_password = crypto.createHmac("sha256", secret.secretKey).update(req.body.new_password).digest('hex')

        try {
            await connection.query("UPDATE users SET user_password = ? WHERE user_id = ?", [new_password, value.id]);
            res.send('1');

        } catch(e) {
            console.log(e);
            res.send('-1');
        } finally {
            connection.end();
        }
    } else {
        connection.end();
        res.send('0');
        return ;
    }
});

/**
 * @swagger
 *  /auth/password_author:
 *      put:
 *          tags:
 *              - user
 *          description: 관리자가 해당 사용자의 비밀번호를 수정합니다. 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/PasswordManage'
 *          responses:
 *              "200":
 *                  description: 수정 성공 메세지
 *          security:
 *              - JWT: []
 */
 router.put('/password_author', auth.auth, auth.verifyAdmin, async function(req, res) {


    let password = crypto.createHmac("sha256", secret.secretKey).update(req.body.password).digest('hex')  

    let param = [
        password,
        id = req.body.user_id,
    ]

    let connection = await mariadb.createConnection(dbconfig.mariaConf);

    try {
        await connection.query("UPDATE users SET user_password = ? WHERE user_id = ?", param);
        res.send('1');

    } catch(e) {
        console.log(e);
        res.send('-1');
    } finally {
        connection.end();
    }
   
})

/**
 * @swagger
 *  /auth/list:
 *      get:
 *          tags:
 *              - user
 *          description: 유저 리스트를 불러옵니다
 *          responses:
 *              "200":
 *                  description: 유저정보
 */
 router.get('/list', async function(req, res) {
    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

        let rows = await connection.query('SELECT * FROM user_list');

        res.send(rows);
    })
})



router.post('/check', jwt.auth, function(req, res) {
    res.send('1');
})




module.exports = router;