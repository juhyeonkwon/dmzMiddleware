/**
 * @swagger
 *  components:
 *      schemas:
 *          Welding:
 *             type: object
 *             required:
 *                 - eqp_id
 *                 - use_yn
 *                 - department
 *             properties:
 *                 eqp_id:
 *                      type: string
 *                 use_yn:
 *                      type: string
 *                 department:
 *                      type: string
 *             example:
 *                 eqp_id: GBS031301(TBAR0001)
 *                 use_yn: 1
 *                 department: 디엑스데이타람쥐
 * 
 */

/**
 * @swagger
 *  components:
 *      schemas:
 *          WeldingRent:
 *             type: object
 *             required:
 *                 - eqp_id
 *                 - use_yn
 *                 - start_time
 *                 - end_time
 *                 - type
 *             properties:
 *                 eqp_id:
 *                      type: string
 *                 use_yn:
 *                      type: string

 *                 start_time:
 *                      type: string
 *                 end_time:
 *                      type: string
 *                 type:
 *                      type: string
 *             example:
 *                 eqp_id: GBS031301(TBAR0001)
 *                 use_yn: 1
 *                 start_time: 2021-12-17 13:00:00
 *                 end_time: 2021-12-17 14:00:00
 *                 type: gbs03
 */


/**
 * @swagger
 *  components:
 *      schemas:
 *          WeldingReturn:
 *             type: object
 *             required:
 *                 - eqp_id
 *                 - type
 *             properties:
 *                 eqp_id:
 *                      type: string
 *                 type:
 *                      type: string
 *             example:
 *                 eqp_id: GBS031301(TBAR0001)
 *                 type: tbar
 */

/**
 * @swagger
 *  components:
 *      schemas:
 *          WeldingReserv:
 *             type: object
 *             required:
 *                 - eqp_id
 *                 - date
 *                 - start_time
 *                 - end_time
 *                 - department
 *                 - type
 *             properties:
 *                 eqp_id:
 *                     type: string
 *                 date:
 *                     type: string
 *                 start_time:
 *                     type: string
 *                 end_time:
 *                     type: string
 *                 department:
 *                     type: string
 *             example:
 *                 eqp_id: TBAR0001 
 *                 date: 2021-12-17
 *                 start_time: 12:00
 *                 end_time : 13:00
 *                 department: 디엑스데이타
 *                 type: tbar
 */
