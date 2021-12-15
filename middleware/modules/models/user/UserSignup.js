/**
 * @swagger
 *  components:
 *      schemas:
 *          UserSignup:
 *             type: object
 *             required:
 *                 - id
 *                 - password
 *                 - department
 *                 - admin
 *             properties:
 *                 id:
 *                     type: string
 *                 password:
 *                     type: string
 *                 department:
 *                     type: string
 *                 admin:
 *                     type: number
 *                     enum: [0, 1]
 *             example:
 *                 id: test6
 *                 password: test
 *                 department: 디엑스데이터
 *                 admin : 0             
 * 
 */