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
function initMap() {
    var hotel = {lat: -34.9210, lng: 138.6062};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 20,
        center: hotel
    });
    var marker = new google.maps.Marker({
        position: hotel,
        map: map
    });
}

function showHotel(x) {
    var hotel1 = new google.maps.LatLng(-34.925696, 138.599658);
    var hotel2 = new google.maps.LatLng(-34.930341, 138.612103);
    var hotel3 = new google.maps.LatLng(-34.932874, 138.600259);

    switch (x) {
        case 1:
            map.panTo(hotel1);
            map.setZoom(10);
            break;
        case 2:
            map.panTo(hotel2);
            map.setZoom(10);
            break;
        case 3:
            map.panTo(hotel3);
            map.setZoom(10);
            break;
        default:
            console.log("ShowHotel function called with incorrect value");
            break;
    }
}