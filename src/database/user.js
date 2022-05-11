const db = require('../../config/db');

/**
 * List users in database
 * 
 * @returns List of users
 */
const retrieveUsers = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM `user`', (err, result) => {
            if (err) {
                reject(err.message);
            }

            resolve(result);
        })
    });
}

/**
 * Retrieve a single user by its ID
 * 
 * @param id: The ID of the user we want to retrieve
 * @returns Object of the requested user
 */
const retrieveUserByID = (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM `user` WHERE `id` = ?', [id], (err, result) => {
            if (err) {
                reject(err.message);
            }

            resolve(result[0]);
        })
    })
}

/**
 * Insert a new user to the database
 * 
 * @param body: Body of the user with a unique email address.
 * @returns Object of the inserted user
 */
const insertUser = (body) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO `user` SET ?', [body], (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(result);
        })
    })
}


/**
 * Update an existing user in the database
 * 
 * @param body: Body of the user with a unique email address.
 * @returns Object of the updated user
 */
const updateUser = (userId, body) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE `user` SET ? WHERE `id` = ?', [body, userId], (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(result);
        })
    })
}

/**
 * Delete an existing user from the database
 * 
 * @param id: ID of the user that will be deleted from the database.
 * @returns Object of the deleted user
 */
const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM `user` WHERE `id` = ?', [id], (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(result);
        })
    })
}

module.exports = { retrieveUsers, retrieveUserByID, insertUser, updateUser, deleteUser }