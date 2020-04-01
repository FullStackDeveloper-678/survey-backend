var mongoose = require('mongoose');
const fastcsv = require("fast-csv");
var csv      = require('csv-express');
const fs = require("fs");

const Admin = mongoose.model('Admin');
const Data = require('../models/SurveyData')
const Score = require('../models/Score') 

const questions = ["You live in a home:",
                    "Your house is built with:",
                    "The floor of your home is:",
                    "The roof of your home is:",
                    "Your bathroom is:",
                    "Water they consume is:",
                    "Cooking uses:",
                    "Home has:",
                    "Vos or any of the people living in your house have any of these symptoms?",
                    "Any person living in your home suffers from a disability?",
                    "What the person is engaged with the main source of income from your home?",
                    "Are they all in IPS?",
                    "Due to the situation created by the corona virus. Your Business:",
                    "How your business will face this situation?",
                    "Do you expect IPS?",
                    "You think you can lose your job for the coronavirus?",
                    "Once you finish the quarantine. Will you still going to your workplace?",
                    "Do you expect IPS?",
                    "You think you can lose your job for the coronavirus?",
                    "Once you finish the quarantine. Will you still going to your workplace?",
                    "Are you:",
                    "Do they have there with all instruments necessary biosafety? (Gloves, dust mask, gown, etc.)",
                    "Is there any suspected case of coronavirus in your medical center?" ,
                    "How long have become unemployed?",
                    "You can produce their own food?"]
exports.signin = async (req, res) =>  {  
    console.log(req.body)
    Admin.findOne({ email: req.body.email }).then(user => {
            if (user) {
                console.log(user)
                if(user.password === req.body.password){
                    res.json({ success:true });
                }else{
                    res.json("You are not registered")
                }
                
            } else {
                res.status(200).json({success:false})
            }         
        })                       
      
};
exports.signup = async (req, res) =>  {  
    var admin = new Admin(req.body)
    admin.save();
      
};

exports.list = async (req, res) =>  {  
    Data.find().then(data => {
            if (data) {
                console.log(data)
                    return res.json({ success:true,data:data});                
            } else {
                res.status(200).json({success:false})
            }         
        })                       
      
};

exports.updateScore = async (req, res) =>  {  
    updateData = req.body;
    console.log(updateData)
    Score.find().then(data=>{
        var score = data[0]
        for(let i=0; i<updateData.length ; i++){
            score[`${updateData[i].key}`].map((row,index) => {
                if(row.field === updateData[i].field){
                    row.weight = updateData[i].weight
                }
            })
            
        }
        score.save().then((err)=>{
            res.json({success:true})
        })
        
    })
    // Data.find().then(data => {
    //         if (data) {
    //                 return res.json({ success:true,data:data});                
    //         } else {
    //             res.status(200).json({success:false})
    //         }         
    //     })                       
      
};
exports.getScore = async (req, res) =>  {  
    Score.find().then(data => {
            if (data) {
                var scores = data[0];

                // scores.liveInHome.map((row,index) =>{
                //     Object.assign(row,{question:questions[0]})
                //     console.log(row)
                // })
                // // console.log(scores)
                    return res.json({ success:true,data:scores});                
            } else {
                res.status(200).json({success:false})
            }         
        })                       
      
};
exports.getWeight = async (req, res) => {
    await Score.find(function(err, weight) {
        if(err) {
            console.log(err);
        } else {
            // console.log(weight);
            res.json({success: true, result: weight[0]});
        }
    })

};
exports.saveSurvey = async (req, res) => {
    let newSurvey = new Data(req.body);
    await newSurvey.save();
    res.json({success: true,  result:"Successfully saved!"});

};

exports.CSV = async (req, res) =>  {  
    var filename   = "products.csv";
    var dataArray;
    Data.find().lean().exec({}, function(err, data) {
        var asset = '';
        var all = '';
        var diseases = '';
        data.map((row,index) => {            
            for(let i = 0 ; i < row.asset.length ; i++){
                asset = asset + row.asset[i] +","
            }
            if(row.houseMembersList){
                for(let i = 0 ; i < row.houseMembersList.length ; i++){
                    var mem = row.houseMembersList[i].relation + "-" + row.houseMembersList[i].age
                    all = all + mem + ","
                }
            }

            if(row.diseaseMembersList){
                for( let i = 0 ; i < row. diseaseMembersList.length ; i++){
                    var disease = row. diseaseMembersList[i].relation + "-" + row. diseaseMembersList[i].age +"-"+ row. diseaseMembersList[i].disease 
                    diseases = diseases + disease + ","
                }
            }

            Object.assign(row,{assets:asset})
            Object.assign(row,{houseMembersLists:all})
            Object.assign(row,{diseaseMembersLists:diseases})
        })
        for(var i = 0; i < data.length; i++) {
            delete data[i]['asset'];
            delete data[i]['houseMembersList'];
            delete data[i]['diseaseMembersList'];
            delete data[i]['end'];
            delete data[i]['__v'];
            delete data[i]['_id']
        }
        if (err) res.send(err);        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader("Content-Disposition", 'attachment; filename='+filename);
        res.csv(data, true);
    });                   
      
};



