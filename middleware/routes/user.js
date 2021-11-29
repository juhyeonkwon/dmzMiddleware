const express = require('express');
const mariadb = require('mariadb');
const dbconfig = require('../dbconfig');
const router = express.Router();
const jwt = require('../modules/auth')
const crypto = require('crypto');
const secret = require('../config/secret')

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
 *                          $ref: '#/components/schemas/User'
 *          responses:
 *              "200":
 *                  description: 현재 상태
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                             $ref: '#/components/schemas/Insert'
 */
router.post('/signup', async function(req, res) {    

    let SQL = "INSERT INTO users(user_id, user_password) VALUES(?,?) "

    const password = crypto.createHmac("sha256", secret.secretKey).update(req.body.password).digest('hex');

    mariadb.createConnection(dbconfig.mariaConf).then(async connection => {
       let rows;
        try {
            rows = await connection.query(SQL, [req.body.id, password]);
        } catch (e) {
            rows = e
        } finally {
            res.send(rows)
        }
        
    })

});

//login
//1 = 로그인 성공, 0 = 로그인 정보 불일치, -1 오류 발생
/**
 * @swagger
 *  /auth/login:
 *      post:
 *          tags:
 *              - user
 *          description: 로그인을 합니다람
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
 */
router.post('/login', async function(req, res) {

    let param = [
        id = req.body.id,
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

    //비밀번호가 일치한다면 토큰을 생성해서 토큰을 저장합니다!! 그리고 토큰을 전달합니다람쥐!!!
    if(await checkPassword(rows[0].user_password, password)) {
        const token = jwt.generate(req.body.id);
        try {
            await connection.query("UPDATE users SET token = ? WHERE user_id = ?", [token, req.body.id]);
            res.cookie("auth", token);
            res.send(token)
            return ;

        } catch(e) {
            console.log(e);
            res.send('-1');
            return ;
        }

    } else {
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

//id 중복을 찾습니다람쥐!!!
router.post('/overlap', async function(req, res) {
    let connection = mariadb.createConnection(dbconfig.mariaConf);

    const SQL = 'SELECT user_id FROM users where user_id = ?';

    let rows = await connection.query(SQL, [ id ]);

    if(rows.length === 0) {
        res.send('1')
    } else {
        res.send('0');
    }

})


router.post('/check', jwt.auth, function(req, res) {
    res.send('1');
})




module.exports = router;