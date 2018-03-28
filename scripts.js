/*
Menu Code
1. Responsive menu
-Alters the class from hamburger icon click.
2. Sticky Scroll Check
-Called on scroll, sticks navbar to top of page.
 */

function responsiveMenu() {
    var x = document.getElementById("topNav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

window.onscroll = function() {stickyScrollCheck()};
var navbar = document.getElementById("topNav");
var sticky = navbar.offsetTop;
function stickyScrollCheck() {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky")
    } else {
        navbar.classList.remove("sticky");
    }
}