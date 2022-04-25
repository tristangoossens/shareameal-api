let currID = 2;
let users = [{
        id: 1,
        firstName: "Tristan",
        lastName: "Goossens",
        street: "Oostplaat 11",
        city: "Bergen op Zoom",
        isActive: true,
        emailAddress: "tt.goossens@student.avans.nl",
        password: "test123",
        phoneNumber: "06 12425475"
    },
    {
        id: 2,
        firstName: "Piet",
        lastName: "Pieters",
        street: "Teststraat 11",
        city: "Almere",
        isActive: true,
        emailAddress: "p.pieters@student.avans.nl",
        password: "mooi123",
        phoneNumber: "06 12425475"
    }
];

/**
 * List users in database
 * 
 * @returns List of users
 */
const retrieveUsers = () => {
    return new Promise((resolve, _) => {
        resolve(users);
    })
}

/**
 * Retrieve a single user by its ID
 * 
 * @param id: The ID of the user we want to retrieve
 * @returns Object of the requested user
 */
const retrieveUserByID = (id) => {
    return new Promise((resolve, reject) => {
        const found = users.find(user => user.id == id);

        // Check if the user is found
        if (found) {
            resolve(found);
        }

        // User with id was not found
        reject(`User with id ${id} was not found in the database`);
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
        // Check if the given email is unique
        const found = users.find(user => user.emailAddress == body.emailAddress);
        if (!found) {
            currID += 1

            const newUser = {
                id: currID,
                ...body
            }

            users.push(newUser);
            resolve(newUser);
        }

        reject(`User with email address ${body.emailAddress} already exists in the database`);
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
        // Check whether the user exists in the database
        const found = users.find(user => user.id == userId);

        if (found) {
            // Check whether the given email exists in any other records
            const index = users.indexOf(found);
            const emailFound = users.find(user => user.emailAddress == body.emailAddress && user.id != userId);

            // Update if email is not found
            if (!emailFound) {
                const updatedUser = {
                    id: userId,
                    ...body
                }

                users[index] = updatedUser;
                resolve(updatedUser);
            }

            reject(`User with email address ${body.emailAddress} already exists in the database`);
        }

        reject(`User with id ${userId} was not found in the database`);
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
        const found = users.find(user => user.id == id);

        // Check if the user is found
        if (found) {
            users = users.filter(user => user.id !== found.id);
            resolve(found);
        } else {
            reject(`User with id ${id} was not found in the database`);
        }
    })
}

module.exports = { retrieveUsers, retrieveUserByID, insertUser, updateUser, deleteUser }