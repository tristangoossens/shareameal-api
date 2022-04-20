const express = require('express');
const router = express.Router();

// UC-301: Register a new meal
router.post('', (req, res) => {
    res.send({
        message: "Inserting meal"
    });
});

// UC-302: Retrieve a list of meals
router.get('', (req, res) => {
    res.send({
        message: "Getting meal list"
    });
});

// UC-303: Retrieve a meal by its id
router.get('/:id', (req, res) => {
    res.send({
        message: `Getting meal with id ${req.params.id}`
    });
});

// UC-304: Update a meal
router.put('/:id', (req, res) => {
    res.send({
        message: `Updating meal with id ${req.params.id}`
    });
});

// UC-305: Delete a meal
router.delete('/:id', (req, res) => {
    res.send({
        message: `Deleting meal with id ${req.params.id}`
    });
});

// UC-306: Participate in a meal
router.post('/:id/participate', (req, res) => {
    res.send({
        message: `Participate in meal with id ${req.params.id}`
    });
});

module.exports = router;