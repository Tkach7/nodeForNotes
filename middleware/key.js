'use strict';

const async = require('async');
const crypto = require('crypto-js');
const redis = require("redis");

let cache = redis.createClient();

// Handle Redis connection fail
cache.on("error", function(err) {
    console.log("Error " + err);
});

module.exports = {
    get: function(promise, callback) {
        async.waterfall([
            function(callback) {
                cache.get(promise, callback);
            },
            function(key, callback) {
                if (key) return callback(null, key);

                key = crypto.lib.WordArray.random(256 / 8).toString();

                cache.set(promise, key, function(err) {
                    if (err) callback(err);
                    callback(null, key);
                });
            }
        ], callback);
    }
}