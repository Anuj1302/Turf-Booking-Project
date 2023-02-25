require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require('express-session');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app  = express()
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/trickShotDB");

const Registeration = new mongoose.Schema({
  email:String,
  password:String,
  name:String,
  city:String,
  googleId:String
});


const bookingSchema = new mongoose.Schema({
  turfName:String,
  location:String,  
  check_in_date:String,
  timeSlot:String,
  members:String
});

Registeration.plugin(passportLocalMongoose); //hashing and salting of password
Registeration.plugin(findOrCreate);

const Registers = mongoose.model("Register",Registeration);
const Booking = mongoose.model("Booking",bookingSchema);


passport.use(Registers.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Registers.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/turf_booking"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    Registers.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


// Registeration
app.get("/",function(req,res){
    res.sendFile(__dirname+"/Registeration.html");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/turf_booking",
  passport.authenticate('google', { failureRedirect: "/SignIn.html" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/dicee.html");
  });


app.post("/",function(req,res){

  // const register = new Registers({
  //   name:req.body.name,
  //   city:req.body.city
  // });


    Registers.register({username: req.body.username, name:req.body.name,city:req.body.city}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/dicee.html");
      });
    }
  });
});


// SignIn
app.get("/SignIn.html",function(req,res){
    res.sendFile(__dirname+"/SignIn.html");
});

app.post("/SignIn.html", function(req, res){

  const user = new Registers({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/dicee.html");
      });
    }
  });
});




app.get("/dicee.html",function(req,res){
    res.sendFile(__dirname+"/dicee.html");
})

app.get("/explore.html",function(req,res){
    res.sendFile(__dirname+"/explore.html");
})


app.listen(3000,function(){
    console.log("Server is running on port 3000");
})

var item1 = {
    _id:1,
    name:"St. Mary's High School, 4 Bungalows, Near Versova Telephone Exchange,Andheri West",
    location:"Mumbai",
    map_url:"https://goo.gl/maps/uiHg68cVjXM2",
    image_icon:"https://www.sporloc.com/image/cache/catalog/911158FINALLOGO-286x180.jpg"
}

var item2 = {
     _id:2,
    name:"Rajasthani Sammelan Education Trust, SV Road, Malad West, Mumbai 400064",
    location:"Mumbai",
    map_url:"https://maps.app.goo.gl/5rFCzCkY3JTL3LT68",
    image_icon:"https://www.sporloc.com/image/cache/catalog/632721lOGO30-286x180.jpg"
}

var item3 = {
     _id:3,
    name:"FS Turf, Churchgate - by SPORLOC",
    location:"Mumbai",
    map_url:"https://goo.gl/maps/VJqHp2xzv7tKDRjd7",
    image_icon:"https://www.sporloc.com/image/cache/catalog/754285FinalLogo20-286x180.jpg"
}

var item4 = {
     _id:4,
    name:"Trickshot, Mulund - by SPORLOC",
    location:"Mumbai",
    map_url:"https://goo.gl/maps/axTihBSDg5mrPBwTA",
    image_icon:"https://www.sporloc.com/image/cache/catalog/714786FINALLOGO-286x180.jpg"
}

var item5 = {
     _id:5,
    name:"Play The Turf, Malad - by SPORLOC",
    location:"Mumbai",
    map_url:"https://goo.gl/maps/eD8sQWppNkSQMfDt9",
    image_icon:"https://www.sporloc.com/image/cache/catalog/805106LOGO30-286x180.jpg"
}

var item6 = {
     _id:6,
    name:"UMRB Turf, Azad Nagar - by SPORLOC",
    location:"Mumbai",
    map_url:"https://goo.gl/maps/t3D9j6AwDAgVFd6A7",
    image_icon:"https://www.sporloc.com/image/cache/catalog/506061Logo20-286x180.jpg"
}

var turfs =  [item1,item2,item3,item4,item5,item6];
var id = 0;
app.get("/booking.ejs",function(req,res){
    // console.log(turfs[0].image_icon);
    if(req.isAuthenticated()){
    res.render('booking', {turfImage:turfs});
    }else{
      res.redirect("/SignIn.html");
    }
})
app.post("/booking.ejs",function(req,res){
    id = Number(req.body.turf);
    console.log(id);
    //  turfs.forEach(function(turf){
    //     if(id===turf._id){
    //     var array = turf;
    //     }
        //   res.render('booking1',{oneturf:array});
          res.redirect("/booking1");
    // })
})

// app.get("/booking1",function(req,res){
//     res.render('/booking1',{oneturf:turf});
// })
var bool = false;
  app.get("/booking1",function(req,res){
    turfs.forEach(function(turf){
         if(id===turf._id){
        var array = turf;
        bool = true;
        if(bool){
            // console.log(turf.image_icon);
            res.render('booking1',{oneturf:array});
        }
    }
    });
})

app.get("/book_now.ejs",function(req,res){
    turfs.forEach(function(turf){
        if(id===turf._id){
        var array = turf;
           res.render('book_now',{oneturf:array});
        }
    });
});

app.post("/book_now",function(req,res){
    var turfName = req.body.turfname;
    var location = req.body.location;
    var check_in_date = req.body.check_in_date;
    var check_out_date = req.body.check_out_date;
    var timeSlot = req.body.timeslot;
    var members = req.body.members;
    var email = req.body.email;
    var phone = req.body.phone;

     const b2 = new Booking({
    turfName:turfName,
    location:location,
    check_in_date:check_in_date,
    timeSlot:timeSlot,
    members:members
})
b2.save();

 res.redirect("/successful.html");
})

// app.get("/book_now.ejs",function(req,res){
//     res.render('book_now',{oneturf:array});
// });

app.get("/successful.html",function(req,res){
    res.sendFile(__dirname+"/successful.html");
})