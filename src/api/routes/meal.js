const express = require('express');
const router = express.Router();

// Middlewares
const exists = require('../../middleware/doesRecordExist');
const validateJWT = require('../../middleware/validateJWT');
const requestBody = require('../../middleware/validateRequestBody')
const modifyMiddleware = require('../../middleware/canUserModify');

// Controller
const controller = require('../controller/meal.controller')

// UC-301: Register a new meal
router.post('', [validateJWT.validateToken, requestBody.mealBody], controller.insertMeal);

// UC-302: Retrieve a list of meals
router.get('', controller.retrieveMeals);

// UC-303: Retrieve a meal by its id
router.get('/:id', [exists.doesMealWithIdExist], controller.retrieveMealByID);

// UC-304: Update a meal
router.put('/:id', [validateJWT.validateToken, exists.doesMealWithIdExist, requestBody.mealBody], controller.updateMeal);

// UC-305: Delete a meal
router.delete('/:id', [validateJWT.validateToken, exists.doesMealWithIdExist, modifyMiddleware.canUserModifyMeal], controller.deleteMeal);

// UC-401: Participate in a meal
router.post('/:id/participate', [validateJWT.validateToken, exists.doesMealWithIdExist], controller.participateInMeal);

// UC-402: Revoke participation in a meal
router.put('/:id/participate', [validateJWT.validateToken, exists.doesMealWithIdExist], controller.removeParticipation);

module.exports = router;