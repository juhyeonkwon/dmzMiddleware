/**
 * @swagger
 *  components:
 *      schemas:
 *          WeldingMeasure:
 *             type: object
 *             required:
 *                 - eqp_id
 *                 - date
 *                 - acquisition_rate
 *                 - welding_time
 *                 - avg_amp
 *                 - avg_volt
 *                 - avg_welding_volt
 *                 - avg_wirespeed
 *                 - sum_wire
 *                 - sum_inching_wire
 *                 - sum_total_wire
 *             properties:
 *                 eqp_id:
 *                      type: string
 *                 date:
 *                      type: string
 *                 acquisition_rate:
 *                      type: float
 *                 welding_time:
 *                      type: float
 *                 avg_amp:
 *                      type: float
 *                 avg_volt:
 *                      type: float
 *                 avg_welding_volt:
 *                      type: float
 *                 avg_wirespeed:
 *                      type: float
 *                 sum_wire:
 *                      type: float
 *                 sum_inching_wire:
 *                      type: float
 *                 sum_total_wire:
 *                      type: float
 *             example:
 *                 eqp_id: GBS031301(TBAR0001)
 *                 date: 2021-11-18
 *                 acquisition_rate: 99.7
 *                 welding_time: 60.5
 *                 avg_amp: 392.03
 *                 avg_volt: 32
 *                 avg_welding_volt: 32.03
 *                 avg_wirespeed: 32.27
 *                 sum_wire: 0.14
 *                 sum_inching_wire: 0
 *                 sum_total_wire: 0.14
 * 
 */