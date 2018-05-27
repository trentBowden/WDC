var hotelDBName = "hotelDB";

var express = require('express');
var session = require('express-session');
var mysql = require('mysql');
const {google} = require('googleapis');
var router = express.Router();

var CLIENT_ID = "477510919126-8hhoh84l9i0ia1udcjmrgqskf2j3u5rl.apps.googleusercontent.com";
var {OAuth2Client} = require('google-auth-library');
var client = new OAuth2Client(CLIENT_ID);
var gticket;

//Premade data
let reviews = [
    {
        room: "Double",
        userReviewing: "Trent",
        reviewText: "This was great I loved it",
        stars: 5

    },
    {
        room: "Family",
        userReviewing: "Cindy",
        reviewText: "This was great we loved it",
        stars: 4

    },

];
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

}, {
    username: "Cindy",
    password: "Ruan",
    google: "123456789098765432",
    phone: "1234567890",
    fullname: "Cindy Ruan",
    bookings: [
        {
            roomBooked: "Double",
            userEmail: "cindy@cindy.com",
            dateIn: "someDate",
            dateOut: "someDate_Out",
            guests: 8
        },
        {
            roomBooked: "Family",
            userEmail: "Cindy@cindy.com",
            dateIn: "someDate",
            dateOut: "someDate_Out",
            guests: 1
        }],

}];
var sessions = [];

//configuring google API
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, "h41y-Xl_FbwqO4WH46P8CFem", "/dashboard.html");
google.options({auth: oauth2Client});

//GET
router.get('/reviews.json', function (req, res) {
    //TODO make sure they are logged in as admin, this sends all reviews and they are public though
    res.json(reviews);

});
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.get('/allBookings.json', function (req, res) {
    //For the admin page to retrieve all the booking data
    //to store all the booking data
    var allBookings = [];
    console.log("Created an allbookings variable");
    //Iterating through users to scrape their booking data
    for (var i = 0; i < users.length; i++) {
        console.log("About to push stuff for user #" + i);
        allBookings.push(users[i].bookings);
    }
    console.log("Bookings length is " + allBookings.length + " and is compiled from " + users.length + " users.");
    res.json(allBookings);

});

//POST
router.post("/reviews.json", function (req, res) {
    //This is for when users SEND us a review
    console.log(req.body);
    var currentUserName = "Anonymous";

    if ((req.body.username !== undefined) || (req.body.userID !== undefined)) {
        for (var i = 0; i < users.length; i++) {
            if ((users[i].username === req.body.username) || (users[i].google === req.body.userID)) {
                currentUserName = users[i].username;
                console.log("Found you in our system, " + currentUserName);
            }
        }
        var userReview = {
            room: req.body.room,
            userReviewing: currentUserName,
            reviewText: req.body.reviewText,
            stars: req.body.stars
        };
        console.log("Reviews array after pushing this:");
        reviews.push(userReview);
        console.log(reviews);
        console.log("Pushed the review from " + currentUserName + " Saying: " + req.body.reviewText);
        res.sendStatus(200);
    } else {
        res.sendStatus(403);
    }

});
router.post("/newUser.json", function (req, res) {
    //Add a new user from Google

    var newUser = true;

    for (var i = 0; i < users.length; i++) {
        if ((users[i].google == req.body.userID)) {
            newUser = false;
            res.sendStatus(200);
        }
    }

    if (newUser) {
        //If we have gotten this far, this is a google user we have not seen before
        var newUser = {
            username: "googleUser",
            password: "admin",
            google: req.body.userID,
            phone: "-",
            fullname: "Google User",
            bookings: []
        };
        users.push(newUser);
        console.log("User not found before, added google info to database");
        console.log(users);
        res.sendStatus(200);

    }

});
router.post("/bookings.json", function (req, res) {
    /*
    Using a combination of GET/POST methods and AJAX, modify your website and server to implement the calls needed to handle the content/information identified in your list from Part 3.
What this is: content/info to deal with

1. This is for when a logged in user would like to see their bookings.
They must send a POST request, containing either their username or google ID
TODO update with google verification when that eventually works

 */

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
router.post("/deleteBooking/:bookingID", function (req, res) {

    var userID = confirmUser(req);
    if (userID != -1) {
        var bookingToDelete = req.params.bookingID;
        var nonNegative = (bookingToDelete > -1);
        var withinBounds = (bookingToDelete <= users[userID].bookings.length); //TODO users.bookings.length-1 would make sense
        if (nonNegative && withinBounds) {
            users[userID].bookings.splice(bookingToDelete, 1);
            console.log("Booking " + bookingToDelete + " Deleted Successfully");
            res.sendStatus(200);
        }
    }
});
router.post("/user.json", function (req, res) {
    /* Client has sent us login data */
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
//TODO make the following
router.post("/createDBTables.json", function (req, res) {

    var con = mysql.createConnection({
        host: "localhost",
        user: "yourusername",
        password: "yourpassword"
    });

    con.connect(function (err) {
        if (err) {
            throw err;
        }
        console.log("Connected!");

        let sql = "CREATE DATABASE "+hotelDBName;
        con.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            console.log("Result from creating database " + hotelDBName + ": " + result);
        });
    });


    res.sendStatus(200);
});
router.post("/dropDBTables.json", function (req, res) {
    res.sendStatus(200);
});
router.post("/userTable.json", function (req, res) {
    res.sendStatus(200);
});
router.post("/bookingTable.json", function (req, res) {
    res.sendStatus(200);
});
router.post("/roomTable.json", function (req, res) {
    res.sendStatus(200);
});


//FUNCTIONS
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

module.exports = router;
