/* Generic functions */

function hideID(element) {
    document.getElementById(element).style.display = "none";
}
function showID(element) {
    document.getElementById(element).style.display = "block";
}

/*  Navbar Items */

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

/* Booking Modal Functions */
var modal = document.getElementById('myModal');

//This will help us pre-fill the date
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function openBookingModal() {
    showID("myModal");
    document.getElementById("dateIn").value = new Date().toDateInputValue();
    document.getElementById("dateOut").value = new Date().toDateInputValue();
}

function closeBookingModal() {
    hideID("myModal");
}

function getUserBookingData() {
    hideID("dateInformation")
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
    } else {
        alert("We'll need your email address to continue!");
    }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        hideID("myModal");
    }
}

function book(room) {
    if (typeof(Storage) === "undefined") {
        alert("Sorry! No web storage available in your browser!");
    } else {

        //Data for this booking:
        var userEmail = document.getElementById("userBookingEmail").value;
        var roomBooked = room;
        var dateIn = document.getElementById("dateIn").value;
        var dateOut = document.getElementById("dateOut").value;

        //If the user has not booked with us before this session
        if (!sessionStorage.getItem("bookedBefore") != "yes") {
            sessionStorage.setItem("bookedBefore", "yes");

            var userDetails = [
                {email : userEmail, room: roomBooked ,in:dateIn, out:dateOut}
            ];

            $window.sessionStorage.user = JSON.stringify(userDetails);

            //Console log for testing
            console.log("User has NOT booked before, current details:");
            console.log(userDetails);

        } else {
            //The user HAS booked before, retrieve old data
            var userDetails = JSON.parse($window.sessionStorage.userDetails);
            userDetails.push({email : userEmail, room: roomBooked ,in:dateIn, out:dateOut});

            //Console log for testing
            console.log("User HAS booked before, current details:");
            console.log(userDetails);
        }
    }
}