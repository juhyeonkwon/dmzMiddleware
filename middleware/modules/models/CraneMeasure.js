/**
 * @swagger
 *  components:
 *      schemas:
 *          CraneMeasure:
 *             type: object
 *             required:
 *                 - use_timestamp
 *                 - crane_id
 *                 - gps_lon
 *                 - gps_lat
 *                 - department:
 *             properties:
 *                 use_timestamp:
 *                     type : string
 *                 crane_id:
 *                     type: string
 *                 gps_lat:
 *                     type: float
 *                 gps_lon:
 *                     type: float
 *                 department:
 *                     type: string
 *             example:
 *                 use_timestamp: 2021-11-17 12:00:00
 *                 crane_id: crane_1
 *                 gps_lat: 128.223434
 *                 gps_lon: 36.664646
 *                 department: 디엑스데이다람쥐
 * 
 */