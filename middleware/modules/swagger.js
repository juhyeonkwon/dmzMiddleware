const swaggerUi = require('swagger-ui-express'); 
const swaggereJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition : {
        info : {
            title : 'Middleware API',
            version : '0.0.1',
            description : 'DXDATA의 middleware API입니다'
        },
        host : 'api.dxdata.co.kr:3333',
        basePath : '/',
    },
    apis: ['./routes/*.js', './swagger/*']
}

const specs = swaggereJsdoc(options)

module.exports = { swaggerUi, specs };