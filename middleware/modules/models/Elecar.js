/**
 * @swagger
 *  components:
 *      schemas:
 *          Elecar:
 *             type: object
 *             required:
 *                 - eqp_id
 *                 - current_gps_lat
 *                 - current_gps_lon
 *                 - department:
 *                 - last_timestamp
 *             properties:
 *                 eqp_id:
 *                     type: string
 *                 cur_gps_lat:
 *                     type: float
 *                 cur_gps_lon:
 *                     type: float
 *                 department:
 *                     type: string
 *                 last_timestamp:
 *                     type : string
 *             example:
 *                 eqp_id: N-347
 *                 cur_gps_lat: 34.868243
 *                 cur_gps_lon: 128.700256
 *                 department: 디엑스데이타람쥐
 *                 last_timestamp: 2021-11-17 12:00:00
 * 
 */