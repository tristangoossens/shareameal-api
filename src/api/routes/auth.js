const express = require('express');
const router = express.Router();

// UC-101: Login with credentials
router.post('/login', (req, res) => {
    res.send({
        message: "Logging in"
    });
});

module.exports = router;