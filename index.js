require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI,{useNewURLParser : true}, (err) => {
  if(err) console.log(err);
  else console.log("mongodb Connected");
});
app.use(cors());
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use('/public', express.static(`${process.cwd()}/public`));
var count = 1;
var Schema  = mongoose.Schema;
var URLSchema = new Schema({
  original_url: {type:String,required:true},
  short_url: {type:Number,required:true,unique:true}
});
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
var URLModel = mongoose.model('URL',URLSchema);
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:url' , function(req,res) {
  console.log(req.params.url);
  URLModel.findOne({"short_url" : req.params.url}, function(err,data) {
    if(err)
    {
      res.json({"error":"invalid url"});
    }
  res.redirect(data.original_url);
  });
});

app.route('/api/shorturl').post(function(req,res) {
  try { 
    url = new URL(req.body.url);
    if( url.protocol === "http:" || url.protocol === "https:" )
    {
      var newUrl = new URLModel({original_url : req.body.url , short_url : count});
      var urlSaved;
      newUrl.save();
      res.json({original_url:newUrl.original_url , short_url: newUrl.short_url});
      count++;
    }
    else
    {
      res.json({"error":"invalid url"});
    }
  } catch (error) {
    res.json({"error":"invalid url"});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
