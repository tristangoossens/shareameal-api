const db = require('../../config/db');

/**
 * Retrieve a single user by its ID
 * 
 * @param email: The e-mail of the user we want to retrieve
 * @returns Object of the requested user
 */
const getUserInfo = (email) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err.message);

            conn.query('SELECT * FROM `user` WHERE `emailAdress` = ?', [email], (err, result) => {
                if (err) {
                    reject(err.message);
                }

                resolve(result[0]);
                conn.release();
            })
        });
    })
}

module.exports = { getUserInfo }