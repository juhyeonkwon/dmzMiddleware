/**
 * @swagger
 *  components:
 *      schemas:
 *          Notice:
 *             type: object
 *             required:
 *                 - title
 *                 - content
 *                 - date
 *             properties:
 *                 title:
 *                      type: string
 *                 content:
 *                      type: string
 *                 date:
 *                      type: string
 *             example:
 *                 title: 제목 다람쥐
 *                 content: 내용이다람쥐
 *                 date: 2022-01-07 15:00:00
 * 
 */

/**
 * @swagger
 *  components:
 *      schemas:
 *          NoticeLogin:
 *             type: object
 *             required:
 *                 - title
 *                 - date
 *                 - user_id
 *             properties:
 *                 title:
 *                      type: string
 *                 date:
 *                      type: string
 *                 user_id:
 *                      type: string
 * 
 */