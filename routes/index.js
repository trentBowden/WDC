var express = require('express');
var session = require('express-session');
const {google} = require('googleapis');
var router = express.Router();

var CLIENT_ID = "477510919126-8hhoh84l9i0ia1udcjmrgqskf2j3u5rl.apps.googleusercontent.com";
var {OAuth2Client} = require('google-auth-library');
var client = new OAuth2Client(CLIENT_ID);
var gticket;

//Use variables to store content provided by the client

//configuring google API
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    "h41y-Xl_FbwqO4WH46P8CFem",
    "/dashboard.html"
);
google.options({auth: oauth2Client});

let users = [{
    username: "trent",
    password: "bowden",
    google: "102386789855691027409",
    phone: "0412345678",
    fullname: "Trent Bowden",
    bookings: [
        {
            roomBooked: "family",
            userEmail: "trent@trent.com",
            dateIn: "someDate",
            dateOut: "someDate_Out",
            guests: 7
        },
        {
            roomBooked: "double",
            userEmail: "trent@trent.com",
            dateIn: "someDate",
            dateOut: "someDate_Out",
            guests: 7
        }],

}];
var sessions = [];

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


/*
    Using a combination of GET/POST methods and AJAX, modify your website and server to implement the calls needed to handle the content/information identified in your list from Part 3.
What this is: content/info to deal with

1. This is for when a logged in user would like to see their bookings.
They must send a POST request, containing either their username or google ID
TODO update with google verification when that eventually works

 */
router.post("/bookings.json", function (req, res) {

    // console.log("bookings request recieved, looping through users to find " + req.body.username + " or " + req.body.userID);

    if ((req.body.username !== undefined) || (req.body.userID !== undefined)) {
        for (var i = 0; i < users.length; i++) {
            if ((users[i].username === req.body.username) || (users[i].google === req.body.userID)) {
                res.json(users[i].bookings);
            }
        }
    } else {
        res.status(403);
    }

});


function confirmUser(req) {
    if ((req.body.username !== undefined) || (req.body.userID !== undefined)) {
        console.log("checking for username " + req.body.username + " or userID " + req.body.userID);
        for (var i = 0; i < users.length; i++) {
            if ((users[i].username === req.body.username) || (users[i].google === req.body.userID)) {
                //User confirmed, let's add their booking.
                console.log("confirmed! found you as user# " + i + ", " + users[i].username);
                return i;
            }
        }
        return -1;
    }
}


router.post("/newbooking.json", function (req, res) {
    var userID = confirmUser(req);
    if (userID != -1) {
        users[userID].bookings.push({
            roomBooked: req.body.roomBooked,
            userEmail: req.body.userEmail,
            date_in: req.body.dateIn,
            dateOut: req.body.dateOut,
            guests: 1
        });
        res.json({bookingStatus: "success! booked from " + req.body.dateIn + " to " + req.body.dateOut});
    }
});


//TODO this is changing how we delete bookings
router.post("/deleteBooking/:bookingID", function (req, res) {

    var userID = confirmUser(req);
    if (userID != -1) {
        var bookingToDelete = req.params.bookingID;
        var nonNegative = (bookingToDelete > -1);
        var withinBounds = (bookingToDelete <= users[userID].bookings.length); //TODO users.bookings.length-1 would make sense
        if (nonNegative && withinBounds) {
            users[userID].bookings.splice(bookingToDelete, 1);
            console.log("Booking "+ bookingToDelete +" Deleted Successfully");
            res.sendStatus(200);
        }
    }
});


/* Client has sent us login data */
router.post("/user.json", function (req, res) {
    console.log("Hey that's a request");
    var user = null;
    console.log(JSON.stringify(req.body));

    //If not an empty post
    if ((req.body.username !== undefined) && (req.body.password !== undefined)) {
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
    } else if (req.body.userID !== undefined) {
        console.log("google token recieved!");
        //TODO async function to verify the google token and get ID
        var userid = req.body.userID;
        //I was getting a "wrong audience error", couldn't verify :(
        for (var i = 0; i < users.length; i++) {
            if (users[i].google === userid) {
                user = users[i].username;
            }
        }
        res.json({username: user});
    } else if (sessions[req.session.id] !== undefined) {
        console.log("valid session");
        user = sessions[req.session.id];
        res.json({username: user});
    }
});


module.exports = router;
