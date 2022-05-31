const db = require('../../database/meal');

const retrieveMeals = (req, res) => {
    const { offset, limit } = req.query;

    db.retrieveMeals(parseInt(offset || 0), parseInt(limit || 100)).then((meals) => {
        res.status(200).send({
            result: meals
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

const retrieveMealByID = (req, res) => {
    db.retrieveMealByID(req.params.id).then((meal) => {
        meal.isActive = !!parseInt(meal.isActive);
        meal.isVega = !!parseInt(meal.isVega);
        meal.isVegan = !!parseInt(meal.isVegan);
        meal.isToTakeHome = !!parseInt(meal.isToTakeHome);

        res.status(200).send({
            result: meal
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

const insertMeal = (req, res) => {
    let { dateTime, allergenes } = req.body;
    dateTime = new Date(dateTime).toISOString().slice(0, 19).replace('T', ' ');
    req.body.dateTime = dateTime;
    req.body.allergenes = allergenes.toString();
    req.body.cookId = req.userID;

    db.insertMeal(req.body).then((meal) => {
        req.body.allergenes = req.body.allergenes.split(',')

        res.status(201).send({
            result: {
                id: meal.insertId,
                ...req.body
            }
        });
    }).catch((err) => {
        console.log({
            message: err
        })

        res.status(500).send({
            message: err
        });
    })
}

const updateMeal = (req, res) => {
    let { dateTime, allergenes } = req.body;

    if (dateTime) {
        dateTime = new Date(dateTime).toISOString().slice(0, 19).replace('T', ' ');
        req.body.dateTime = dateTime;
    }

    if (allergenes) {
        req.body.allergenes = allergenes.toString();
    }

    db.updateMeal(req.params.id, req.body).then((_) => {
        if (allergenes) {
            req.body.allergenes = req.body.allergenes.split(',')
        }

        res.status(200).send({
            result: {
                id: req.params.id,
                ...req.body
            }
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

const deleteMeal = (req, res) => {
    db.deleteMeal(req.params.id).then((_) => {
        res.status(200).send({
            message: `Meal with id '${req.params.id}' has been deleted`
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

const participateInMeal = (req, res) => {
    db.participateInMeal(req.params.id, req.userID).then((participation) => {
        res.status(200).send({
            result: {
                mealId: req.params.id,
                userId: req.userID
            }
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

const removeParticipation = (req, res) => {
    db.revokeMealParticipation(req.params.id, req.userID).then((_) => {
        res.status(200).send({
            message: `Participation for meal with id '${req.params.id}' has been revoked`
        });
    }).catch((err) => {
        res.status(500).send({
            message: err
        });
    })
}

module.exports = {
    retrieveMeals,
    retrieveMealByID,
    insertMeal,
    updateMeal,
    deleteMeal,
    participateInMeal,
    removeParticipation
}