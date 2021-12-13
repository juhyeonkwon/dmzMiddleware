/**
 * @swagger
 *  components:
 *      schemas:
 *          ElecarMeasure:
 *             type: object
 *             required:
 *                 - eqp_id
 *                 - current_gps_lat
 *                 - current_gps_lon
 *                 - department
 *                 - last_timestamp
 *             properties:
 *                 eqp_id:
 *                     type: string
 *                 gps_lon:
 *                     type: float
 *                 gps_lat:
 *                     type: float
 *                 eqp_spec_code:
 *                     type: string
 *                 department:
 *                     type: string
 *                 req_no:
 *                     type: string
 *                 use_date:
 *                     type: string
 *                 last_timestamp:
 *                     type : string
 *             example:
 *                 eqp_id: N-347 
 *                 gps_lon: 128.704069
 *                 gps_lat: 34.876778
 *                 eqp_spec_code : 38M
 *                 department: 디엑스데이타람쥐
 *                 req_no: "20200526034"
 *                 use_date: "20200601"
 *                 use_timestamp: "20200601_235959"
 */
