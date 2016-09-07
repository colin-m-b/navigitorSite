const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var MONGO_URI = 'mongodb://navigitor:browncouch123@ds019826.mlab.com:19826/navigitor'
// var MONGO_URI = 'mongodb://localhost/test'
mongoose.connect(MONGO_URI);
// mongoose.connection.on('connected', function() {console.log('event connected on mLab')})
// mongoose.connection.on('error', function(e) {console.log('CONNECTION ERROR FROM EVENT: ' + e)})

var eventSchema = new mongoose.Schema({
  user: {type: String, required: true},
  SHA: String,
  parent: [String],
  eventType: String,
  message: String,
  time: Number
});

//initialize EventController as empty object
var EventController = {}

//create post method for EventController
EventController.saveEvent = function(arg) {
  var gitData = JSON.parse([arg.data]);
  console.log('author from db' + gitData.author)
    //create Event model using room property passed from argument as the collection name
    var Event = mongoose.model(arg.room, eventSchema)
      var eventToAdd = new Event({
      user: gitData.author,
      SHA: gitData.SHA,
      parent: gitData.parent,
      eventType: gitData.event,
      message: gitData.message,
      time: parseInt(gitData.time)
      });
        console.log('newevent: ', eventToAdd)
        //save event to collection or create new collection
        eventToAdd.save(function(err){
          if(err) console.log('error saving in DB: ' + err)
        })
  //  };
}

//fetch collection/repo
EventController.getRepo = (arg, callback) => {
    //define which collection we're looking for

    var coll = mongoose.model(arg.room + 's', eventSchema)
    //console.log(coll)
    //return all docs in collection
    coll.find((err, events) => {
        if (err) return console.error(err)
        callback(events);
    })
}

EventController.getByTime = (arg, callback) => {
    var time = Math.floor(arg.time / 1000)

    var coll = mongoose.model(arg.room + 's', eventSchema)
    coll.find({time: {$gt: time}}, 'user data time', (err, data) => {
        if (err) console.log('getByTime error: ', err)
        callback(data)
    })
}

module.exports = EventController;
