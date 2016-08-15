var async = require('async');
var express = require('express');

var router = express.Router();

// Get users
router.get('/self', function(req, res, next) {
    res.json(req.user);
});

// Get users
router.get('/', function(req, res, next) {
    req.db.user
        .find()
        .select('-hash -sessions')
        .exec(function(err, users) {
            res.json(users);
        });
});

// Get user
// router.get('/:email', function(req, res, next) {
//     req.db.user
//         .findOne({ email: req.params.email })
//         .select('-hash -sessions')
//         .exec(function(err, users) {
//             res.json(users);
//         })
// });

// Patch user
router.patch('/:email', function(req, res, next) {
    console.log(req.body);
    if (!req.body) {
        return res.sendStatus(400);
    }
    req.db.user.findOneAndUpdate({"email": req.body.email}, req.body)
    .exec(function(err, users) {
        if (err) return res.sendStatus(400);
        res.json(users);
    });
});

// Put user
router.put('/todo', function(req, res, next) { 
    if (!req.body) {
        return res.sendStatus(400);
    }
    console.log(req.params);
    req.db.user.findOne({ _id: req.user })
    .exec((err, user) => {
        user.todo.push(req.body);
        user.save((err) => {
            res.json(req.body);
        });
    });
});

// Delete user
router.delete('/:id', function(req, res, next) {
    res.sendStatus(200);
});

module.exports = router;