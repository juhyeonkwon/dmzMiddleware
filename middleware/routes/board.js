const express = require('express');
const router = express.Router();

const mariadb = require('mariadb');
const dbconfig = require('../dbconfig');
const auth = require('../modules/auth');

/**
 * @swagger
 *  /board/notice/login/:
 *      get:
 *          tags:
 *              - board
 *          description: 로그인 화면의 공지사항 리스트를 불러옵니다.
 *          responses:
 *              "200":
 *                  description: 공지사항 리스트
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/NoticeLogin'
 */
router.get('/notice/login', function(req, res) {

    try {
        mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

            try {
                let rows = await connection.query("SELECT CAST(date AS CHAR) as date, user_id, title FROM board_notice order by board_idx desc limit 12");

                res.send(rows)
            } catch(e) {
                console.log(e)
                res.status(500);
            } finally {
                connection.end();
            }

        })
    } catch (e) {
        res.status(500);
    } finally {
        return;
    }
});


/**
 * @swagger
 *  /board/notice/list/:
 *      get:
 *          tags:
 *              - board
 *          description: 공지사항 리스트를 불러옵니다.
 *          responses:
 *              "200":
 *                  description: 공지사항 리스트
 *          security:
 *              - JWT: []
 */
router.get('/notice/list', auth.auth, function(req, res) {
    try {
        mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

            try {
                let rows = await connection.query("SELECT board_idx, user_id, title, CAST(date AS CHAR) as date FROM board_notice");

                res.send(rows)
            } catch(e) {
                console.log(e)
                res.status(500);
            } finally {
                connection.end();
            }

        })
    } catch (e) {
        res.status(500);
    } finally {
        return;
    }
});


/**
 * @swagger
 *  /board/notice/:
 *      get:
 *          tags:
 *              - board
 *          description: 공지사항 게시글을 불러옵니다
 *          parameters:
 *              - in: query
 *                name: board_idx
 *                schema:
 *                  type: string
 *          responses:
 *              "200":
 *                  description: 공지사항 게시글
 *          security:
 *              - JWT: []
 */
router.get('/notice', auth.auth, function(req, res) {

    let query_id = req.query.board_idx;

    try {
        mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

            try {
                let rows = await connection.query("SELECT board_idx, user_id, title, content, CAST(date AS CHAR) as date FROM board_notice WHERE board_idx = ?", [query_id]);

                res.send(rows)
            } catch(e) {
                console.log(e)
                res.status(500);
            } finally {
                connection.end();
            }

        })
    } catch (e) {
        res.status(500);
    } finally {
        return;
    }

})


/**
 * @swagger
 *  /board/notice/:
 *      post:
 *          tags:
 *              - board
 *          description: 공지사항을 작성합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Notice'
 *          responses:
 *              "200":
 *                  description: 공지사항 리스트
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Notice'
 *          security:
 *              - JWT: []
 */
router.post('/notice', auth.auth, auth.verifyAdmin, async function(req, res) {
    
    let token = req.headers.authorization.split('Bearer ')[1];

    let value = await auth.verify(token)

    const param = [
        value.id,
        req.body.title,
        req.body.content,
        req.body.date
    ];

    try {
        mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

            try {
                let rows = await connection.query("INSERT INTO board_notice(user_id, title, content, date) VALUES (?, ?, ?, NOW())", param);

                res.send(rows)
            } catch(e) {
                console.log(e)
                res.status(500);
            } finally {
                connection.end();
            }

        })
    } catch (e) {
        res.status(500);
    } finally {
        return;
    }

});

/**
 * @swagger
 *  /board/notice/:
 *      put:
 *          tags:
 *              - board
 *          description: 공지사항을 수정합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Notice'
 *          responses:
 *              "200":
 *                  description: 공지사항 리스트
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Notice'
 *          security:
 *              - JWT: []
 */
 router.put('/notice', auth.auth, auth.verifyAdmin, async function(req, res) {
    let token = req.headers.authorization.split('Bearer ')[1];

    const param = [
        req.body.title,
        req.body.content,
        req.body.board_idx,
    ];

    try {
        mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

            try {
                let rows = await connection.query("UPDATE board_notice SET title = ?, content = ? WHERE board_idx = ?", param);

                res.send(rows)
            } catch(e) {
                console.log(e)
                res.status(500);
            } finally {
                connection.end();
            }

        })
    } catch (e) {
        res.status(500);
    } finally {
        return;
    }
});

/**
 * @swagger
 *  /board/notice/:
 *      delete:
 *          tags:
 *              - board
 *          description: 공지사항을 삭제합니다.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - board_idx
 *                          properties:
 *                               board_idx:
 *                                  type: string
 *          responses:
 *              "200":
 *                  description: 공지사항 리스트
 *                  content:
 *                      apllication/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Notice'
 *          security:
 *              - JWT: []
 */
 router.delete('/notice', auth.auth, auth.verifyAdmin, async function(req, res) {
    

    const param = [
        req.body.board_idx,
    ];

    try {
        mariadb.createConnection(dbconfig.mariaConf).then(async connection => {

            try {
                let rows = await connection.query("DELETE FROM board_notice WHERE board_idx = ?", param);

                res.send(rows)
            } catch(e) {
                console.log(e)
                res.status(500);
            } finally {
                connection.end();
            }

        })
    } catch (e) {
        res.status(500);
    } finally {
        return;
    }
})




module.exports = router;