/**
 * @swagger
 *  components:
 *      schemas:
 *          CraneMeasure:
 *             type: object
 *             required:
 *                 - timestamp
 *                 - crane_id
 *                 - gps_lon
 *                 - gps_lat
 *                 - department
 *                 - data1
 *                 - data2
 *                 - data3
 *             properties:
 *                 timestamp:
 *                     type : string
 *                 crane_id:
 *                     type: string
 *                 gps_lat:
 *                     type: float
 *                 gps_lon:
 *                     type: float
 *                 department:
 *                     type: string
 *                 data1:
 *                     type: string
 *                 data2:
 *                     type: string
 *                 data3:
 *                     type: string
 *             example:
 *                 timestamp: 2021-11-17 12:00:00
 *                 crane_id: crane_1
 *                 gps_lat: 34.868243
 *                 gps_lon: 128.700256
 *                 department: DXDATA
 *                 data1: string
 *                 data2: string
 *                 data3: string
 */