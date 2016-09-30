// Menu Hover effect
$('ul>li>a').hover(function(){
 $('ul>li>a').not(this).toggleClass('toggle');
    });


$(document).ready(function() {

    if(window.location.href.indexOf('#gaModal') != -1) {
        $('#gaModal').modal('show');
    }

});