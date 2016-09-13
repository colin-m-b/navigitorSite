var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// mongoose.connect('mongodb://ec2-54-152-1-18.compute-1.amazonaws.com');
var MONGO_URI = 'mongodb://navigitor:browncouch123@ds019826.mlab.com:19826/navigitor'
// var MONGO_URI = 'mongodb://localhost/test'
// var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
//                 replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.createConnection(MONGO_URI);
mongoose.connection.on('connected', function() {console.log('event connected on mLab')})
mongoose.connection.on('error', function(e) {console.log('CONNECTION ERROR FROM EVENT: ' + e)})

var eventSchema = new mongoose.Schema({
  user: {type: String, required: true},
  SHA: String,
  parent: [String],
  eventType: String,
  message: String,
  time: Number,
  diff: String,
  diff_stats: {
    diff_adds: Number,
    diff_subs: Number
  }
});

//initialize EventController as empty object
var EventController = {}

//create post method for EventController
EventController.saveEvent = function(arg) {
  var gitData = JSON.parse([arg.data]);
  console.log('author from db' + gitData.user)
    //create Event model using room property passed from argument as the collection name
    var Event = mongoose.model(arg.room, eventSchema);
    //create new instance of event
    var eventToAdd = new Event({
    user: gitData.user,
    SHA: gitData.SHA,
    parent: gitData.parent,
    eventType: gitData.eventType,
    message: gitData.message,
    time: parseInt(gitData.time),
    diff: gitData.diff,
    diffStats: {
      diffAdds: gitData.diffstats.adds,
      diffSubs: gitData.diffstats.subs
    }
    });
      //save event to collection or create new collection
      eventToAdd.save(function(err){
        if(err) console.log('error saving in DB: ' + err)
      });
}

//fetch collection/repo
EventController.getRepo = (arg, callback) => {

    //define which collection we're looking for

    var coll = mongoose.model(arg.room + 's', eventSchema)

    //return all docs in collection 
    coll.find(function(err, events) {
        if (err) return console.error(err)
        callback(events);
    })
}

EventController.getByTime = (arg, callback) => {
  console.log('time: ' + arg.body.time + 'type: ' + typeof arg.body.time)
    var timeFromUser = Math.floor(arg.body.time / 1000)
    var coll = mongoose.model(arg.body.room + 's', eventSchema)
    coll.find({time: {$gt: timeFromUser}}, 'user', (err, data) => {
        if (err) console.log('getByTime error: ', err)
        else {
          console.log('get by time firing with: ', data);
          callback(data)
        }
    })
}

module.exports = EventController;
