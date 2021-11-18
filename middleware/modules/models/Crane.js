/**
 * @swagger
 *  components:
 *      schemas:
 *          Crane:
 *             type: object
 *             required:
 *                 - crane_id
 *                 - cur_gps_lat
 *                 - cur_gps_lon
 *                 - department:
 *                 - last_timestamp
 *                 - rental_end
 *                 - rental_start
 *             properties:
 *                 crane_id:
 *                     type: string
 *                 cur_gps_lat:
 *                     type: float
 *                 cur_gps_lon:
 *                     type: float
 *                 department:
 *                     type: string
 *                 last_timestamp:
 *                     type : string
 *                 rental_end:
 *                     type : string
 *                 rental_start:
 *                     type : string
 *             example:
 *                 crane_id: crane_1
 *                 cur_gps_lat: 34.868243
 *                 cur_gps_lon: 128.700256
 *                 department: 디엑스데이다람쥐
 *                 last_timestamp: 2021-11-17 12:00:00
 *                 rental_end: 2021-11-17 12:00:00
 *                 rental_start: 2021-11-17 12:00:00
 * 
 */