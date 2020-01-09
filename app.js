const express = require('express'),
      bodyParser= require('body-parser'),
      multer = require('multer'),
      mongodb=require('mongodb'),
      mongoose=require('mongoose'),
      fs=require('fs-extra');
const app=express(),

      storage = multer.diskStorage({
     
      filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
      }
}),
AWS=require('aws-sdk'),
 config = new AWS.Config({
    accessKeyId: 'YOUR accessKeyId',
    secretAccessKey: 'YOUR secretAccessKey',
    region: 'us-east-2'
    
  }),
 rekognition = new AWS.Rekognition(config);
const upload = multer({ storage: storage });

mongoose.connect('mongodb://localhost:27017/fileUploads',{
   useNewUrlParser: true,
   useFindAndModify: false,
   useCreateIndex: true,
   useUnifiedTopology: true 
});

const imageSchema=new mongoose.Schema({
    contentType: String,
    data:  Buffer
});
const content = mongoose.model('contents', imageSchema);
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.render('index');
});

app.post('/upload/photo', upload.single('myImage'), (req, res) => {
 const img = fs.readFileSync(req.file.path);
 const encode_image = img.toString('base64'),
 data=  new Buffer(encode_image, 'base64');
var params = {
    Image: { /* required */
      Bytes: data
    },
    MinConfidence: 50
  };
  rekognition.detectModerationLabels(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {    console.log(data);  
      console.log(data.ModerationLabels[0].Con); //log all the detected labels do the operations accoringly and store it in the database
      res.redirect('/');
    }         // successful response
  });
});
app.get('/photo/:id', (req, res) => {
    const photo_id = req.params.id;
    content.findById(photo_id,(err, found)=>{
        if (err){
            console.log(err);
            res.redirect('/');
        }
          console.log(found.Buffer);
        //res.contentType('image/jpeg');
       // res.send(found.image.buffer);
    });
});
app.listen(3000, (req, res) => console.log('Server started on port 3000'));