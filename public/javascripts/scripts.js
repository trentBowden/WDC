//google user data (hopefully will be updated when they sign in)
var gUsrData;

/*


        Generic functions

*/

function hideID(element) {
    document.getElementById(element).style.display = "none";
}

function showID(element) {
    document.getElementById(element).style.display = "block";
}

/*

            Navbar Items

*/


const nav = document.querySelector('#main');
let topOfNav = nav.offsetTop;

function fixNav() {
    if (window.scrollY >= topOfNav) {
        document.body.style.paddingTop = nav.offsetHeight + 'px';
        document.body.classList.add('fixed-nav');
    } else {
        document.body.classList.remove('fixed-nav');
        document.body.style.paddingTop = 0;
    }
}

window.addEventListener('scroll', fixNav);

/*

        Booking Modal Functions


*/

var modal = document.getElementById('myModal');
var room;

//This will help us pre-fill the date
Date.prototype.toDateInputValue = (function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});

function resetModal() {
    hideID("userInformationTaken");
    hideID("moreUserInformation");
    showID("dateInformation");
}

function openBookingModalSingle() {
    openBookingModal();
    room = "single";
}

function openBookingModalDouble() {
    openBookingModal("double");
    room = "double";
}

function openBookingModalFamily() {
    openBookingModal("family");
    room = "family";
}

function openBookingModal() {
    showID("myModal");
    document.getElementById("dateIn").value = new Date().toDateInputValue();
    document.getElementById("dateOut").value = new Date().toDateInputValue();
}

function closeBookingModal() {
    resetModal();
    hideID("myModal");
}

function getUserBookingData() {
    hideID("dateInformation");
    var dateIn = document.getElementById("dateIn").value;
    var dateOut = document.getElementById("dateOut").value;

    document.getElementById("datesPreConfirmation").innerText =
        `Great, booked from ${dateIn} to ${dateOut}`;
    showID("moreUserInformation");
}

function confirmBooking() {
    var email = document.getElementById("userBookingEmail");
    if (!(email.value) == "") {
        hideID("moreUserInformation");
        showID("userInformationTaken");
        let userBookingEmail = document.getElementById("userBookingEmail").value;
        document.getElementById("emailConfirmed").innerText =
            `Confirmation email sent to ${userBookingEmail}`;
        book();
    } else {
        alert("We'll need your email address to continue!");
    }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        closeBookingModal();
    }
};

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

function book() {
    //Data for this booking:
    var userEmail = document.getElementById("userBookingEmail").value;
    var roomBooked = room;
    var dateIn = document.getElementById("dateIn").value;
    var dateOut = document.getElementById("dateOut").value;

    //Check to see if logged in:
    if (gUsrData != null) {
        console.log("Sending your booking..");
        $.post("/newbooking.json",
            {
                userID: gUsrData.getBasicProfile().getId(),
                userEmail: userEmail,
                roomBooked: roomBooked,
                dateIn: dateIn,
                dateOut: dateOut
            }, function (data) {
                alert(data.bookingStatus);
            }, "json");
    } else {
        alert("Sorry, you don't seem to be logged in..");
    }
}

function sendReview(room, username, userID, reviewText, stars) {
    $.post("/reviews.json",
        {room, username, userID, reviewText, stars},
        function (data, status) {
            //alert(status);
        }, "json");

    alert("Thank you for your review");
}


/*

        Dashboard functions

 */

function deleteBookingByIndex(indexInput) {

    if (userLoggedIn()) {
        console.log("Sending to delete booking #" + indexInput);
        $.post("/deleteBooking/" + indexInput, {userID: gUsrData.getBasicProfile().getId()}, function (data) {
            console.log(data);
            console.log(`The ${indexInput}th item has been removed`);
            //refresh the page using AJAX
            console.log("Attempting to refresh the page contents using AJAX");
        });
    } else {
        console.log("Sorry, you're not logged in. Can't delete object");
    }
    displayCurrentBookings();
}

function changeBookingDate(indexInput) {
    //Getting the details
    var roomBookArray = localStorage.getObject('userDetails'); //TODO get from AJAX
    //Retrieving user requests
    var checkInDateChange = prompt("New CheckIn date (Y-M-D):\nExisting value shown below", roomBookArray[indexInput].dateIn);
    var checkOutDateChange = prompt("New CheckOut date (Y-M-D):\nExisting value shown below", roomBookArray[indexInput].dateOut);
    //Setting user requests
    roomBookArray[indexInput].dateIn = checkInDateChange;
    roomBookArray[indexInput].dateOut = checkOutDateChange;
    //Changing local storage
    localStorage.setObject('userDetails', roomBookArray);
    location.reload();
}

function displayAdminData() {
    if (userLoggedIn()) {

        //At first, clear everything
        var load = document.getElementById("loadAdminDataHere");
        load.innerHTML = ""; //clear before adding everything

        $.get("/reviews.json", function (data, status) {
            //TODO anyone can get into admin because if we restricted it then it could not be marked!
            //Getting the details, let's do this by AJAX call TODO
            var reviewData = data;
            console.log("Retrieved all reviews from server");

            console.log(reviewData);

            if (reviewData.length < 1) {

                document.getElementById("roomHeaderDisplay").innerText =
                    "Nobody has reviewed yet";

            } else {

                //Updating the page header
                document.getElementById("roomHeaderDisplay").innerText =
                    `Reviews(${reviewData.length})`;

                var load = document.getElementById("loadAdminDataHere");
                load.innerHTML = ""; //clear before adding everything

                //Iterate through JSON to output on screen
                for (var i = 0; i < reviewData.length; i++) {
                    (
                        function() {

                            var br = document.createElement("br");
                            var hr = document.createElement("hr");

                            /*      Creating an element for each review   */

                            //What type of room
                            var paraType = document.createElement("P");
                            var type = document.createTextNode(`Review #${i + 1} is for: ${reviewData[i].room} room.`);
                            //Who reviewed
                            var paraWhoReviewed = document.createElement("P");
                            var whoReviewed = document.createTextNode(`Reviewed by ${reviewData[i].userReviewing}`);
                            //Review Text
                            var paraRevText = document.createElement("P");
                            var revText = document.createTextNode(`"${reviewData[i].reviewText}"`);

                            //Placing sections into room element, appending to page
                            paraType.appendChild(type);
                            paraWhoReviewed.appendChild(whoReviewed);
                            paraRevText.appendChild(revText);

                            var load = document.getElementById("loadAdminDataHere");
                            load.appendChild(paraType);
                            load.appendChild(paraWhoReviewed);
                            load.appendChild(paraRevText);
                            load.appendChild(br);
                            load.appendChild(br);
                            //Divider between rooms, doesn't display on final room.
                            if ((i + 1) != reviewData.length) {
                                load.appendChild(hr);
                            }
                        }
                    )();
                }
            }
        });


        $.get("/allBookings.json", function (data, status) {
            //TODO anyone can get into admin because if we restricted it then it could not be marked!
            var allUsrBookingData = data;
            console.log("Retrieved all bookings from server");
            console.log(allUsrBookingData);
            var bookingsHeader = document.createElement("h1");
            var load = document.getElementById("loadAdminDataHere");


            if (allUsrBookingData.length < 1) {
                var nobodyBooked = document.createTextNode(`Nobody has booked yet`);
                bookingsHeader.appendChild(nobodyBooked);
                load.appendChild(bookingsHeader);

            } else {

                var bookingsHeaderTxt = document.createTextNode(`Bookings:`);
                bookingsHeader.appendChild(bookingsHeaderTxt);
                load.appendChild(bookingsHeader);

                //Iterate through JSON which shows first USERS / Their Bookings
                for (var i = 0; i < allUsrBookingData.length; i++) {
                    for (var j = 0; j < allUsrBookingData[i].length; j++) {

                    (
                        function() {

                            var br = document.createElement("br");
                            var hr = document.createElement("hr");

                            /*      Creating an element for each review   */

                            //What type of room
                            var paraType = document.createElement("P");
                            var type = document.createTextNode(`${allUsrBookingData[i][j].roomBooked} room.`);
                            //Who Booked
                            var paraWhoBooked = document.createElement("P");
                            var whoBooked = document.createTextNode(`Booked by ${allUsrBookingData[i][j].userEmail}`);
                            //Review Text
                            var paraDates = document.createElement("P");
                            var datesTxt = document.createTextNode(`${allUsrBookingData[i][j].dateIn} until ${allUsrBookingData[i][j].dateOut}`);

                            //Placing sections into room element, appending to page
                            paraType.appendChild(type);
                            paraWhoBooked.appendChild(whoBooked);
                            paraDates.appendChild(datesTxt);

                            var load = document.getElementById("loadAdminDataHere");
                            load.appendChild(paraType);
                            load.appendChild(paraWhoBooked);
                            load.appendChild(paraDates);
                            load.appendChild(br);
                            load.appendChild(br);
                            //Divider between rooms, doesn't display on final room.
                            // if ((i + 1) != allUsrBookingData.length) {
                            //     load.appendChild(hr);
                            // }
                        }
                    )();

                    }
                }
            }
        });
    } else {
        document.getElementById("roomHeaderDisplay").innerText =
            "Sorry, You need to log in to view this page!";
    }
}

function displayCurrentBookings() {

    console.log("-------------Display Current Bookings--------------");

    if (userLoggedIn()) {

        //At first, clear everything
        var load = document.getElementById("loadRoomsHere");
        load.innerHTML = ""; //clear before adding everything

        $.post("bookings.json", {userID: gUsrData.getBasicProfile().getId()}, function (data) {

            //Getting the details, let's do this by AJAX call TODO
            var roomBookArray = data;

            console.log("Local storage values:");
            console.log(roomBookArray);

            if (roomBookArray.length < 1) {

                document.getElementById("roomHeaderDisplay").innerText =
                    "Sorry, you have no bookings yet.";

            } else {

                //Updating the page header
                document.getElementById("roomHeaderDisplay").innerText =
                    `Rooms(${roomBookArray.length})`;

                var load = document.getElementById("loadRoomsHere");
                load.innerHTML = ""; //clear before adding everything


                //Iterate through JSON to output on screen
                for (i = 0; i < roomBookArray.length; i++) {


                    (

                        function() {

                            var br = document.createElement("br");
                            var hr = document.createElement("hr");

                            /*      Creating an element for each room   */

                            //Image for room
                            var roomImg = document.createElement("IMG");
                            if (roomBookArray[i].roomBooked == "family") {
                                roomImg.setAttribute("src", "images/room-1.png");
                            } else if (roomBookArray[i].roomBooked == "double") {
                                roomImg.setAttribute("src", "images/room-2.png");
                            } else if (roomBookArray[i].roomBooked == "single") {
                                roomImg.setAttribute("src", "images/room-3.png");
                            }

                            roomImg.setAttribute("width", "304");
                            roomImg.setAttribute("height", "228");
                            roomImg.setAttribute("alt", "Room reservation image");

                            //What type of room
                            var paraType = document.createElement("P");
                            var type = document.createTextNode(`Room #${i + 1} is a ${roomBookArray[i].roomBooked} room.`);
                            //What dates
                            var paraDates = document.createElement("P");
                            var dates = document.createTextNode(`${roomBookArray[i].dateIn} - ${roomBookArray[i].dateOut}`);
                            //Who confirmed
                            var paraConfirmed = document.createElement("P");
                            var confirmed = document.createTextNode(`Confirmation email sent to ${roomBookArray[i].userEmail}`);

                            //Placing sections into room element, appending to page
                            paraType.appendChild(type);
                            paraDates.appendChild(dates);
                            paraConfirmed.appendChild(confirmed);

                            var load = document.getElementById("loadRoomsHere");
                            load.appendChild(roomImg);
                            load.appendChild(paraType);
                            load.appendChild(paraDates);
                            load.appendChild(paraConfirmed);
                            load.appendChild(br);

                            /*
                                    Options to modify the booking,
                                    -based on the ith position in the array
                             */
                            var thisbooking = i;

                            //Delete
                            var deleteBooking = document.createElement("BUTTON");
                            var deleteBookingText = document.createTextNode("Cancel booking");
                            deleteBooking.appendChild(deleteBookingText);
                            console.log("deleteBookingButton made for " + thisbooking);
                            deleteBooking.onclick = function () {
                                deleteBookingByIndex(thisbooking);
                            };
                            load.appendChild(deleteBooking);

                            //Change Date
                            var modifyBookingDate = document.createElement("BUTTON");
                            var modifyBookingDateText = document.createTextNode("Modify Dates");
                            modifyBookingDate.appendChild(modifyBookingDateText);
                            modifyBookingDate.onclick = function () {
                                changeBookingDate(thisbooking)
                            };

                            load.appendChild(modifyBookingDate);
                            load.appendChild(br);
                            load.appendChild(br);



                            //SendRandomBooking
                            var revText = document.createElement("TEXTAREA");
                            var revTextPlaceholder = document.createTextNode(
                                "Please type your review for the " + roomBookArray[i].roomBooked + " room");
                            revText.appendChild(revTextPlaceholder);
                            var revTextID = "reviewTextBox"+i;
                            revText.id = revTextID;
                            load.appendChild(revText);

                            var sendReviewButton = document.createElement("BUTTON");
                            var sendReviewBtnTxt = document.createTextNode("Send Review");
                            sendReviewButton.appendChild(sendReviewBtnTxt);

                            var currentRoom = roomBookArray[i].roomBooked;

                            sendReviewButton.onclick = function() {
                                sendReview(
                                    currentRoom,
                                    null,
                                    gUsrData.getBasicProfile().getId(),
                                    document.getElementById(revTextID).value,
                                    1);
                            };
                            load.appendChild(sendReviewButton);

                            load.appendChild(br);

                            //Divider between rooms, doesn't display on final room.
                            if ((i + 1) != roomBookArray.length) {
                                load.appendChild(hr);
                            }

                        }
                    )();
                }
            }
        });
    } else {
        document.getElementById("roomHeaderDisplay").innerText =
            "Sorry, You need to log in to view this page!";
    }

}


/*
    Map Scripts
 */

var map;
var adelaide = {lat: -34.9210, lng: 138.6062};
var hotel1 = {lat: -34.925696, lng: 138.599658};
var hotel2 = {lat: -34.930341, lng: 138.612103};
var hotel3 = {lat: -34.932874, lng: 138.600259};

function initMap() {


}

function initAutocomplete() {
    var companyLogo = 'images/hotel.png';
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: adelaide
    });
    /*
        How to work these markers, what they need:
        1. Marker
        2. Content string for when marker is clicked
        3. Setting up the info window
        4. Adding the listener
     */
    var markerH1 = new google.maps.Marker({
        position: hotel1,
        map: map,
        title: 'Hotel 1!',
        icon: companyLogo
    });
    var contentStringH1 = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h3 id="firstHeading" class="firstHeading">Town Hall</h3>' +
        '<div id="bodyContent">' +
        '<p><b>Town Hall</b>, Is one of the finest places to stay in Adelaide.</p>' +
        '<p>4 Rooms Available, book now to ensure your stay</p>' +
        '</div>' +
        '</div>';

    var infowindowH1 = new google.maps.InfoWindow({
        content: contentStringH1
    });

    markerH1.addListener('click', function () {
        infowindowH1.open(map, markerH1);
    });


    var markerH2 = new google.maps.Marker({
        position: hotel2,
        map: map,
        title: 'Hotel 2!',
        icon: companyLogo
    });

    var contentStringH2 = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h3 id="firstHeading" class="firstHeading">Hutt St</h3>' +
        '<div id="bodyContent">' +
        '<p><b>A fan of the races?</b>This is your best accomodation for East end activities</p>' +
        '<p>9 Rooms Available, book now to ensure your stay for the Adelaide 500!</p>' +
        '</div>' +
        '</div>';

    var infowindowH2 = new google.maps.InfoWindow({
        content: contentStringH2
    });

    markerH2.addListener('click', function () {
        infowindowH2.open(map, markerH2);
    });

    var markerH3 = new google.maps.Marker({
        position: hotel3,
        map: map,
        title: 'Hotel 3!',
        icon: companyLogo
    });

    var contentStringH3 = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h3 id="firstHeading" class="firstHeading">Market Galore</h3>' +
        '<div id="bodyContent">' +
        '<p><b>Ready to hit the markets?</b>Close to Gilles st markets, and central markets!</p>' +
        '<p>2 Rooms Available, book now to ensure your stay!</p>' +
        '</div>' +
        '</div>';

    var infowindowH3 = new google.maps.InfoWindow({
        content: contentStringH3
    });

    markerH3.addListener('click', function () {
        infowindowH3.open(map, markerH3);
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

/* Login stuff */

document.getElementById("signOutButton").style.display = "none";


function onSignIn(googleUser) {
    gUsrData = googleUser;
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    //Change the image on top + display "sign out" button
    document.getElementById("signOutButton").style.display = "block";
    document.getElementById("logoTop").src = profile.getImageUrl();
    document.getElementById("loginUP").style.display = "none";

    //ID token to pass to the back end
    var id_token = googleUser.getAuthResponse().id_token;
    // console.log("ID Token: " + id_token);

    getUserInfo({userID: profile.getId()});
    if (pageTitle === "dashboard") {
        displayCurrentBookings();
    }
    if (pageTitle === "admin") {
        displayAdminData();
    }
    //This will add them as a new user if they aren't already
    $.post("newUser.json", {userID: gUsrData.getBasicProfile().getId()});


}

function showOnPage(x) {
    document.getElementById("pageLog").innerText = x;
}

function loginWithUP() {
    var toSend = {
        username: document.getElementById('usernameInput').value,
        password: document.getElementById('passwordInput').value
    };
    console.log(toSend);
    getUserInfo(toSend);

}

function getUserInfo(params) {

    $.post("user.json", params, function (data) {
        if (data.username != null) {
            console.log("Welcome back, " + data.username);
        } else {
            console.log("You're now signed in through Google.");
        }

    }, "json");


}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
    document.getElementById("signOutButton").style.display = "none";
    document.getElementById("logoTop").src = "images/logo.png";
    document.getElementById("loginUP").style.display = "block";
}

function userLoggedIn() {
    var auth2 = gapi.auth2.getAuthInstance();
    console.log("about to check sign in");
    if (auth2.isSignedIn.get()) {
        return true;
    } else {
        return false;
    }
}


