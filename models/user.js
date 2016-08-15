var crypto = require('crypto-js');
var moment = require('moment');
var async = require('async');

var mongoose = require('../middleware/mongoose');
var config = require('../conf/settings.json');

var schema = new mongoose.Schema({
    created: Date,
    updated: Date,
    name: String,
    birthday: Date,
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash: {
        type: String,
        required: true
    },
    sessions: [new mongoose.Schema({
        ip: String,
        token: String, 
        device: String,
        os: String,
        browser: String
    })],
    icon: {
        type: String,
        default: './images/default-icon.png'
    },
    todo: [new mongoose.Schema({
        time: Date,
        title: String,
        status: {
            type:  Boolean,
            default: false
        } 
    })]
});

schema.virtual('password').set(function(value) {
    this.hash = crypto.SHA512(value).toString();
});

schema.pre('save', function(next) {
    if (this.isNew) {
        this.created = moment().format();
    }
    this.updated = moment().format();
    next();
});

schema.methods.auth = function(password, ip, userInfo, callback) {
    var self = this;
    async.waterfall([
        function(callback) {
            var session = self.sessions.filter(function(session) {
                var device = userInfo.isMobile ? 'Mobile' : 'PC';
                if (session.browser === userInfo.browser 
                    && session.os === userInfo.os
                    && session.device === device) return true;
                return false;
            }).pop();
            if (!!session) self.sessions.id(session._id).remove();
            callback(null);
        },
        function(callback) {
            if (crypto.SHA512(password).toString() === self.hash) {
                var session = {
                    ip: ip,
                    token: crypto.lib.WordArray.random(256 / 8).toString(),
                    os: userInfo.os,
                    browser: userInfo.browser,
                    device: userInfo.isMobile ? 'Mobile' : 'PC'
                };

                self.sessions.unshift(session);
                self.save(function(err) {
                    if (err) return callback(err);
                    callback(null, session);
                });
            } else {
                var err = new Error('Forbidden');
                err.status = 403;
                callback(err);
            }
        }
    ], callback);
};

module.exports = mongoose.model('user', schema);