var express = require('express');
var router = express.Router();
var params = require('parameters-middleware');
var config= require('config');
var jwt = require('jwt-simple');
var ObjectId = require('mongoose').Types.ObjectId;
var moment= require('moment');
var async= require('async');
var multer=require('multer');
var db=require('../db/DbSchema');
var events = require('../events');
var log = require('tracer').colorConsole(config.get('log'));
var apn=require('../notificationSenders/apnsender');
var gcm=require('../notificationSenders/gcmsender');
var runLogic=require('../logic/run');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({storage:storage})

router.post('/protected/run',params({body:['duration','run_length','cause_id','points']},{message : config.get('error.badrequest')}),
    function(req,res){
        log.info(req.body);
        runLogic.postRun(req)
            .then(function(info){
                res.json(info);
            })
            .catch(function(err){
                res.status(err.status).json(err.message);
            })
    });
router.get('/protected/runs',function(req,res){
    runLogic.getRun(req)
        .then(function(response){
            res.json(response);
        })
        .catch(function(err){
            res.status(err.status).json(err.message);
        })
})
router.get('/protected/causes',
    function(req,res){
        runLogic.getCauses(req)
            .then(function(response){
                res.json(response);
            })
            .catch(function(err){
                res.status(err.status).json(err.message);
            })
    });
router.post('/cause',upload.single('avatar'),
    params({body:['name','description','pass']},{message : config.get('error.badrequest')}),
    function(req,res){
        if(req.body.pass=="running_app@123") {
            runLogic.postCause(req)
                .then(function (response) {
                    res.json(response);
                })
                .catch(function (err) {
                    res.status(err.status).json(err.message);
                })
        }else{
            res.status(401).json(config.get('unauthorized'));
        }
    });



module.exports = router;
