const canUserModify = (req, res, next) => {
    const { userID } = req;
    const { id } = req.params;

    if (userID && id && userID == id) {
        next();
    } else {
        res.status(403).send({
            message: 'You can only modify your own user'
        })
    }
}

module.exports = {
    canUserModify
}