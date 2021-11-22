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


router.post('/login', async function(req, res) {

    let param = [
        id = req.body.id,
        password = password = crypto.createHmac("sha256", secret.secretKey).update(req.body.password).digest('hex')
    ]

    const token = jwt.generate(req.body.id);

    console.log(token);

    console.log(jwt.verify(req.body.token))

    res.send(token)

});

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


router.post('/test', jwt.auth, function(req, res) {
    console.log('done');
    res.send('done');
})




module.exports = router;