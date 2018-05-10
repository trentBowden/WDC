var express = require('express');
var session = require('express-session');
const {google} = require('googleapis');
var router = express.Router();

var CLIENT_ID = "477510919126-8hhoh84l9i0ia1udcjmrgqskf2j3u5rl.apps.googleusercontent.com";
var {OAuth2Client} = require('google-auth-library');
var client = new OAuth2Client(CLIENT_ID);
var gticket;


//configuring google API
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    "h41y-Xl_FbwqO4WH46P8CFem",
    "/dashboard.html"
);
google.options({ auth: oauth2Client });

var users = [{
  username: "trent",
    password: "bowden",
    google: "102386789855691027409"
}];
var sessions = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* Client has sent us login data */
router.post("/user.json", function(req, res) {
    console.log("Hey that's a request");
    var user = null;
    console.log(JSON.stringify(req.body));

    //If not an empty post
    if ((req.body.username !== undefined) && (req.body.password !==undefined)) {
      console.log("Non empty Usr + pass received");
      //iterate through users to find this one
      for (var i = 0; i < users.length; i++) {
        if ((users[i].username === req.body.username) && (users[i].password === req.body.password)) {
            //setting the sessions breaks our program, TODO fix so login can work both ways
            console.log("Request matches records for: " + users[i].username);
          // sessions[req.session.id] = req.body.username;
          // console.log("Set the session to "+ sessions[req.session.id]);
          user = req.body.username;
        }
      }
      console.log("responding with json of username: " + user);
      res.json({username: user});

      //But! if they log in with google
    }    else if (req.body.userID !== undefined) {
      console.log("google token recieved!");
      // async function verify() {
      //   const ticket = await client.verifyIdToken({
      //       idToken: req.body.idtoken,
      //       audience: CLIENT_ID
      //   });
      //   const payload = ticket.getPayload();
      //   const userid = payload['sub'];
      //   var email = payload['email'];
        var userid = req.body.userID;
        //I was getting a "wrong audience error", couldn't verify :(
        console.log("for loop through users (length: " +users.length+")");
          for (var i = 0; i<users.length; i++) {
              console.log("comparing " + users[i].google + " and " + userid);
            if (users[i].google === userid) {
                console.log("They are the same");
                // sessions[req.session.id] = users[i].username;
                // console.log("sessions set");
                // console.log(sessions);
                user = users[i].username;
                console.log("This matches our data for user: " + user);
            }
          }
          console.log("sending back json with username: " + user);
          res.json({username:user});
      // }
      // verify().catch(console.error);
    } else if (sessions[req.session.id] !== undefined) {
      console.log("valid session");
      user = sessions[req.session.id];
      res.json({username: user});
    }
});


module.exports = router;
