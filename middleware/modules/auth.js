const jwt = require('jsonwebtoken');
const config = require('../config/secret');
const maria = require('mariadb');
const dbconfig = require('../dbconfig');

let pool = maria.createPool(dbconfig.mariaConf2)

module.exports = {
    auth : function(req, res, next) {
        if(req.headers.authorization) {
            const token = req.headers.authorization.split('Bearer ')[1];

            jwt.verify(token, config.secretKey, async function(err, decoded) {
                if(err) {
                    res.status(401).json({ error : 'Auth Error'});
                } else {           
                    //DB에 저장되어있는 토큰값이랑 일치한지 확인합니다람쥐!!         
                    await pool.getConnection().then(async connection => {
                        let row;
                        try {
                            row = await connection.query('SELECT token from users where user_id = ?', decoded.id);
                        } catch(e) {
                            res.status(401).json({ error : 'Auth Error'});
                        }
                        if(row[0].token === token) {
                            next();
                        } else {
                            res.status(401).json({ error : 'Auth Error'});
                        }
                    })
                }
            });        
        } else {
            res.status(401).json({ error : 'Auth Error'});
        }
    },
    generate : function(id) {
        console.log(id);
        return jwt.sign({id : id}, config.secretKey, { expiresIn: '3 days' });
    },
    verify : function(token) {
        return jwt.verify(token, config.secretKey, function(err, decoded) {
            if(err) {
                return err;
            } else {
                return decoded
            }
        });
    }
}