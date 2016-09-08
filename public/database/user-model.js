var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
//define user schema
var userSchema = new Schema ({
    user: {type: String, required: true, unique: true},
    email: {type: String},
    github: {type: String},
    password: {type: String, required: true},
    team: {type: String}
});

//create pre hook to hash password
//using ES5 due to binding issue using arrow function
userSchema.pre('save', function(next) {
    //save this as variable for use in bcrypt function
    var userData = this;
    //generate salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        //hash the password
        bcrypt.hash(userData.password, salt, function(err, hash) {
            if (err) return console.error(err);
            //set password to hashed password
            userData.password = hash;
            next();
        })
    })
})

module.exports = mongoose.model('User', userSchema)
