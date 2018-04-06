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

//This will help us pre-fill the date
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function resetModal() {
    hideID("userInformationTaken");
    hideID("moreUserInformation");
    showID("dateInformation");
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
        book("familyRoom");
    } else {
        alert("We'll need your email address to continue!");
    }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        closeBookingModal();
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
         if (sessionStorage.getItem("bookedBefore") == "yes") {
            //The user HAS booked before, retrieve old data
            var deets = sessionStorage.getItem("userDetails");
            console.log(deets);
            var userDetails = JSON.parse(deets);

            // var userDetails = JSON.parse(sessionStorage.userDetails);
            userDetails.push({userEmail, roomBooked, dateIn, dateOut});
            // userDetails.push({email : `${userEmail}`, room: `${roomBooked}` ,in: `${dateIn}`, out:`${dateOut}`});
            sessionStorage.setItem("userDetails", userDetails);

            console.log("User HAS booked before, updated details:");
            console.log(userDetails);
        } else {
             console.log("User has NOT booked before, new details");
             sessionStorage.setItem("bookedBefore", "yes");
             //ES6 Property value shorthand! (if var is same name, don't write twice.
             var userDetails = [{userEmail, roomBooked, dateIn, dateOut}];
             var deets = JSON.stringify(userDetails);
             sessionStorage.setItem("userDetails", deets);


             console.log(userDetails);
         }
    }
}
// var userEmail = {'email':'blah'};
// sessionStorage.setItem('user', JSON.stringify(user));
// var obj = JSON.parse(sessionStorage.user);

