/**
 * Created by pariskshitdutt on 09/06/15.
 */
var mongoose = require('mongoose');
//var mockgoose=require('mockgoose');
var config = require('config');
var events = require('../events');
var log = require('tracer').colorConsole(config.get('log'));
var ObjectId = require('mongoose').Schema.Types.ObjectId;
var validate = require('mongoose-validator');
var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'Name should be between 3 and 50 characters'
    })
];
var emailValidator=[
    validate({
        validator: 'isEmail',
        message: "not a valid email"
    })
];
var phoneValidator = [
    validate({
        validator: 'isLength',
        arguments: [10, 10],
        message: 'phonenumber should be 10 digits'
    })
];
var db=mongoose.createConnection(config.get('mongo.location'),config.get('mongo.database'));

var Schema = mongoose.Schema;
mongoose.set('debug', config.get('mongo.debug'));
/**
 * user schema stores the user data the password is hashed
 * @type {Schema}
 */
var userSchema=new Schema({
    email:{type:String,validate:emailValidator},
    phonenumber:{type:String,validate:phoneValidator},
    password:{type:String},
    name:{type:String},
    fb_token:String,
    device:{service:String,reg_id:String,active:{type:Boolean,default:true}},
    //is_admin:{type:Boolean,default:false},
    //is_verified:{type:Boolean,default:false},
    created_time:{type:Date,default:Date.now},
    modified_time:{type:Date,default:Date.now}
});
var runSchema=new Schema({
    length:Number,
    points:Number,
    duration:Number,
    cause_id:{type:ObjectId, ref:'causes'},
    user_id:{type:ObjectId, ref:'users'},
    created_time:{type:Date,default:Date.now},
    modified_time:{type:Date,default:Date.now}
})
var pinschema=new Schema({
    phonenumber:{type:String},
    pin:Number,
    used:{type:Boolean,default:false},
    created_time:{type:Date,default:Date.now},
    modified_time:{type:Date,default:Date.now}
});

var causeSchema=new Schema({
    name:String,
    description:String,
    contact_number:Number,
    photo_url:String,
    is_deleted:{type:Boolean,default:false},
    created_time:{type:Date,default:Date.now},
    modified_time:{type:Date,default:Date.now}
});

db.on('error', function(err){
    log.info(err);
});
/**
 * once the connection is opened then the definitions of tables are exported and an event is raised
 * which is recieved in other files which read the definitions only when the event is received
 */
    var userdef=db.model('users',userSchema);
    var pindef=db.model('pins',pinschema);
    var causedef=db.model('causes',causeSchema);
    var rundef=db.model('runs',runSchema);

    exports.getpindef=pindef;
    exports.getuserdef= userdef;
    exports.getcausedef= causedef;
    exports.getrundef= rundef;
    events.emitter.emit("db_data");

