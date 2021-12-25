const express     = require('express');
const bodyParser  = require('body-parser');
const mongoose = require('mongoose');

const app = express();

mongoose.connect("mongodb+srv://sat1:sat123@cluster0.mt6xo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(process.cwd() + '/'));
//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/index.html');
});

const userSchema = new mongoose.Schema({
    'username': String,
    'password': String,
    'sign_up': Date,
    'sign_in': [Date]
});

const User = new mongoose.model('User_test', userSchema);

app.route('/sign_up')
  .post(function (req, res) {
    var data = req.body;
    User.create({
      'username': data.username,
      'password': data.password,
      'sign_up': new Date(),
      'sign_in': []
    }, (err,d)=>{
      // console.log(d);
      if (d) res.json(d);
      else if(err) console.log(err);
    });
});

app.route('/sign_in')
  .post(function (req, res) {
    var data = req.body;
    User.findOne({'username': data.username, 'password': data.password}, (err,d)=>{
      if (d){
        d.sign_in.push(new Date());
        d.markModified('sign_in');
        d.save((e,res)=>{
          if (res) console.log("Time updated");
          else if (err) console.log(err);
        })
        res.send(d.username);
      }else{
        res.send("User not found")
      }
    });
});

app.route('/all')
  .post(function (req, res) {
    User.find({}, (err,d)=>{
      if (d) {
        let ret = ["Username, password, Sign Up Date, Sign In Dates"];
        // console.log(d);
        for (var i in d){
          ret.push(d[i].username + "," + d[i].password + "," + d[i].sign_up.toLocaleDateString() + " " + d[i].sign_up.toLocaleTimeString() + "," + d[i].sign_in.map(e=>e.toLocaleDateString() + " " + e.toLocaleTimeString()).join(" & "));
        }res.send(ret);
      }
    })
});


const listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});

