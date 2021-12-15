/**
 * @swagger
 *  components:
 *      schemas:
 *          UserModify:
 *             type: object
 *             required:
 *                 - idx
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
 *             example:
 *                 idx: 1
 *                 password: 
 *                 department: 디엑스데이터
 *                 admin : 0             
 * 
 */

/**
 * @swagger
 *  components:
 *      schemas:
 *          UserModifyAuth:
 *             type: object
 *             required:
 *                 - idx
 *                 - admin
 *             properties:
 *                 idx:
 *                     type: number
 *                 admin:
 *                     type: number
 *             example:
 *                 idx: 1
 *                 admin : 0             
 * 
 */