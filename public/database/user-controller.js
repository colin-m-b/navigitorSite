var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user-model.js')
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var MONGO_URI = 'mongodb://navigitor:browncouch123@ds019826.mlab.com:19826/navigitor'
// var MONGO_URI = 'mongodb://localhost/navigitor'
mongoose.connect(MONGO_URI);
mongoose.connection.on('connected', function() {console.log('user connected on mLab')})
mongoose.connection.on('error', function(e) {console.log('CONNECTION ERROR FROM USER: ' + e)})

//initialize UserController as empty object
var UserController = {};

//create method to add user to collection
UserController.add = function(req, res, next) {
    //initialize new instance of user
    var NewUser = new User({
        user: req.body.username,
        email: req.body.email,
        password: req.body.password,
        team: req.body.team,
        github: req.body.github
    });
    //save NewUser to collection
    NewUser.save(function(err, req) {
        if (err) {
            console.error('err: ', err)
            // res.send('error!!!!')
        }
    });
}

//create method to verify user
UserController.verify = function (req, callback)  {
    console.log('verify firing', req.body)
    //make sure needed info is included
    var verUser;
    if(!(req.body.name) || !(req.body.password)) {
        veruser = false;
        console.log('verUser: ', verUser)
        return verUser;
    }
    //find user in collection
    User.findOne({'user': req.body.name}, 'password github', function(err, person) {
        console.log('finding firing')
        //if user not found
        if (!(person)) {
            verUser = false;
            console.log('no person found')
            callback(verUser)
        }
        else {
            //get password from req
            var userPwd = req.body.password;
            //get password from user found in collection
            var hashedPwd = person.password;
            //verify passwords match
            bcrypt.compare(userPwd, hashedPwd, function(err, result) {
                if (result) {
                    verUser = true;
                    if (person.github) callback({'github': person.github})
                    else (callback(verUser))
                } else {
                    console.log('invalid password');
                    verUser = false;
                    callback(verUser)
                }
            });
        }
    });
}

module.exports = UserController
