/**
 * Created by pariskshitdutt on 08/03/16.
 */
var q= require('q');
var config= require('config');
var jwt = require('jwt-simple');
var ObjectId = require('mongoose').Types.ObjectId;
var moment= require('moment');
var multer=require('multer')
var async= require('async');
var db=require('../db/DbSchema');
var events = require('../events');
var log = require('tracer').colorConsole(config.get('log'));
var apn=require('../notificationSenders/apnsender');
var gcm=require('../notificationSenders/gcmsender');
var crypto=require('../authentication/crypto');
var bcrypt = require('bcrypt');
var runTable=db.getrundef;
var causeTable=db.getcausedef;

var runs={
    postRun:function(req){
        var def= q.defer();
        causeTable.findOne({_id:new ObjectId(req.body.cause_id)},"_id",function(err,cause){
            if(!err&&cause){
                var run=new runTable({
                    length:req.body.run_length,
                    points:req.body.points,
                    duration:req.body.duration,
                    cause_id:new ObjectId(req.body.cause_id),
                    user_id:new ObjectId(req.user._id)
                });
                run.save(function(err,run,info){
                    if(err){
                        def.reject({status: 500, message: config.get('error.dberror')});
                    }else{
                        def.resolve(run);
                    }
                });
            }else{
                def.reject({status: 400, message: config.get('error.badrequest')});
            }
        });
        return def.promise;
    },
    getRun:function(req){
        var def= q.defer();
        log.info(req.user._id);
        runTable.find({user_id:new ObjectId(req.user._id)},"length points duration cause_id").populate("cause_id","name description")
            .exec(function(err,rows){
                log.info(rows);
                if(err){
                    def.reject({status: 500, message: config.get('error.dberror')});
                }else{
                    def.resolve(rows);
                }
            });
        return def.promise;
    },
    getCauses:function(req){
        var def= q.defer();
        causeTable.find({is_deleted:false},"name description photo_url contact_number",function(err,rows){
            if(err){
                def.reject({status: 500, message: config.get('error.dberror')});
            }else{
                def.resolve(rows);
            }
        })
        return def.promise;
    },
    postCause:function(req){
        var def= q.defer();
        delete req.body.pass;
        req.body.photo_url="/uploads/"+req.file.originalname;
        var cause=new causeTable(req.body);
        cause.save(function(err,row,info){
            if(err){
                def.reject({status: 500, message: config.get('error.dberror')});
            }else{
                def.resolve(row);
            }
        });
        return def.promise;
    }
};
module.exports=runs;