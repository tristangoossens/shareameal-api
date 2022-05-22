const db = require('../../config/db');

/**
 * List meals in database
 * @param offset: Amount of records to skip (default 0)
 * @param limit: Amount of records retrieve (default 100)
 * @returns List of meals
 */
const retrieveMeals = (offset, limit) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err.message);

            conn.query('SELECT * FROM `meal` LIMIT ?, ?', [offset, limit], (err, result) => {
                if (err) {
                    reject(err.message);
                }

                resolve(result);
                conn.release();
            })
        })
    });
}

/**
 * Retrieve a meal from the database by its ID
 * @param id: ID of the meal you want to retrieve
 * @returns Meal that matches the given id
 */
const retrieveMealByID = (id) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err.message);

            conn.query('SELECT * FROM `meal` WHERE `id` = ?', [id], (err, result) => {
                if (err) {
                    reject(err.message);
                }

                resolve(result[0]);
                conn.release();
            })
        })
    });
}

/**
 * Insert a meal into the database
 * @param body: body containing all required fields
 * @returns Insert confirmation with inserted id
 */
const insertMeal = (body) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err.message);

            conn.query('INSERT INTO `meal` SET ?', [body], (err, result) => {
                if (err) {
                    reject(err.message);
                }

                resolve(result);
                conn.release();
            })
        })
    });
}

/**
 * Update a meal with given id
 * @param body: body containing all required fields
 * @param id: id of the meal that is updated
 * @returns Update confirmation with affected rows
 */
const updateMeal = (id, body) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err.message);

            conn.query('UPDATE `meal` SET ? WHERE `id` = ?', [body, id], (err, result) => {
                if (err) {
                    console.log(err.message)
                    reject(err);
                }

                resolve(result);
                conn.release();
            })
        });
    })
}


/**
 * Delete an existing meal from the database
 * 
 * @param id: ID of the meal that will be deleted from the database.
 * @returns Object of the deleted meal
 */
const deleteMeal = (id) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err.message);

            conn.query('DELETE FROM `meal` WHERE `id` = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                }

                resolve(result);
                conn.release();
            })
        });

    })
}


module.exports = {
    retrieveMeals,
    retrieveMealByID,
    insertMeal,
    updateMeal,
    deleteMeal
}