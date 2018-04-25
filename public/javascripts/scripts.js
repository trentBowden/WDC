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
    if (typeof(Storage) === "undefined") {
        alert("Sorry! No web storage available in your browser!");
    } else {

        //Data for this booking:
        var userEmail = document.getElementById("userBookingEmail").value;
        var roomBooked = room;
        var dateIn = document.getElementById("dateIn").value;
        var dateOut = document.getElementById("dateOut").value;

        //If the user has booked with us before this session
        if (sessionStorage.getItem("bookedBefore") == "yes") {

            //The user HAS booked before, retrieve old data
            var userData = localStorage.getObject('userDetails');
            console.log(userData);

            //Pushing new data to the array, setting it to system
            userData.push({userEmail, roomBooked, dateIn, dateOut});
            localStorage.setObject('userDetails', userData);

            console.log("User HAS booked before, updated details:");
            console.log(localStorage.getObject('userDetails'));
        } else {

            console.log("User has NOT booked before, new details");
            sessionStorage.setItem("bookedBefore", "yes");

            /*     ES6 Property value shorthand array creation     */
            var userDetails = [{userEmail, roomBooked, dateIn, dateOut}];

            /*     Convert JSON, store      */
            localStorage.setObject('userDetails', userDetails);

            console.log("here is what went into system storage:");
            console.log(localStorage.getObject('userDetails'));
        }
    }
}


/*

        Dashboard functions

 */

function deleteBookingByIndex(indexInput) {
    //Getting the details
    var roomBookArray = localStorage.getObject('userDetails');
    if (indexInput > -1) {
        roomBookArray.splice(indexInput, 1);
    }
    console.log(roomBookArray);
    localStorage.setObject('userDetails', roomBookArray);
    console.log(`The ${indexInput}th item has been removed`);
    location.reload();
}

function changeBookingDate(indexInput) {
    //Getting the details
    var roomBookArray = localStorage.getObject('userDetails');
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

function displayCurrentBookings() {

    console.log("cool");

    if (typeof(Storage) === "undefined") {
        alert("Sorry! No web storage available in your browser!");
    } else {
        //If the user has not booked with us before this session
        if (sessionStorage.getItem("bookedBefore") == "yes") {

            //Getting the details
            var roomBookArray = localStorage.getObject('userDetails');

            console.log("Local storage values:");
            console.log(roomBookArray);

            //Updating the page header
            document.getElementById("roomHeaderDisplay").innerText =
                `Rooms(${roomBookArray.length})`;

            //Iterate through JSON to output on screen
            for (i = 0; i < roomBookArray.length; i++) {

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
                deleteBooking.onclick = function () {
                    deleteBookingByIndex(thisbooking)
                };
                load.appendChild(deleteBooking);

                //Change Date
                var modifyBookingDate = document.createElement("BUTTON");
                var modifyBookingDateText = document.createTextNode("Modify Dates");
                modifyBookingDate.appendChild(modifyBookingDateText);
                modifyBookingDate.onclick = function () {changeBookingDate(thisbooking)};

                load.appendChild(modifyBookingDate);
                load.appendChild(br);
                load.appendChild(br);

                //Divider between rooms, doesn't display on final room.
                if ((i + 1) != roomBookArray.length) {
                    load.appendChild(hr);
                }}} else {
            document.getElementById("roomHeaderDisplay").innerText =
                "Sorry, You have not booked any rooms with us.";
        }
    }
}


/*
    Map Scripts
 */

var map;
var adelaide = {lat: -34.9210, lng: 138.6062};
var hotel1 = {lat:-34.925696, lng:138.599658};
var hotel2 = {lat:-34.930341, lng:138.612103};
var hotel3 = {lat:-34.932874, lng:138.600259};

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
    var contentStringH1 = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h3 id="firstHeading" class="firstHeading">Town Hall</h3>'+
        '<div id="bodyContent">'+
        '<p><b>Town Hall</b>, Is one of the finest places to stay in Adelaide.</p>' +
        '<p>4 Rooms Available, book now to ensure your stay</p>'+
        '</div>'+
        '</div>';

    var infowindowH1 = new google.maps.InfoWindow({
        content: contentStringH1
    });

    markerH1.addListener('click', function() {
        infowindowH1.open(map, markerH1);
    });


    var markerH2 = new google.maps.Marker({
        position: hotel2,
        map: map,
        title: 'Hotel 2!',
        icon: companyLogo
    });

    var contentStringH2 = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h3 id="firstHeading" class="firstHeading">Hutt St</h3>'+
        '<div id="bodyContent">'+
        '<p><b>A fan of the races?</b>This is your best accomodation for East end activities</p>' +
        '<p>9 Rooms Available, book now to ensure your stay for the Adelaide 500!</p>'+
        '</div>'+
        '</div>';

    var infowindowH2 = new google.maps.InfoWindow({
        content: contentStringH2
    });

    markerH2.addListener('click', function() {
        infowindowH2.open(map, markerH2);
    });

    var markerH3 = new google.maps.Marker({
        position: hotel3,
        map: map,
        title: 'Hotel 3!',
        icon: companyLogo
    });

    var contentStringH3 = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h3 id="firstHeading" class="firstHeading">Market Galore</h3>'+
        '<div id="bodyContent">'+
        '<p><b>Ready to hit the markets?</b>Close to Gilles st markets, and central markets!</p>' +
        '<p>2 Rooms Available, book now to ensure your stay!</p>'+
        '</div>'+
        '</div>';

    var infowindowH3 = new google.maps.InfoWindow({
        content: contentStringH3
    });

    markerH3.addListener('click', function() {
        infowindowH3.open(map, markerH3);
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
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