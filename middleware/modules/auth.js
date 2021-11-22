const jwt = require('jsonwebtoken');
const config = require('../config/secret');

module.exports = {
    auth : function(req, res, next) {
        if(req.headers.authorization) {
            const token = req.headers.authorization.split('Bearer ')[1];
            console.log(token)

            jwt.verify(token, config.secretKey, function(err) {
                if(err) {
                    res.status(401).json({ error : 'Auth Error'});
                } else {
                    next();
                }
            });        
        } else {
            res.status(401).json({ error : 'Auth Error'});
        }
    },
    generate : function(id) {
        console.log(id);
        return jwt.sign({id : id}, config.secretKey, { expiresIn: '1h' });
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