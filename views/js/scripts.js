// Menu Hover effect
$('ul>li>a').hover(function(){
 $('ul>li>a').not(this).toggleClass('toggle');
    });


$(document).ready(function() {

    if(window.location.href.indexOf('ga_setup=true#') != -1) {
        $('#gaModal').modal('show');
    }

    if(window.location.href.indexOf('fb_setup=true#') != -1) {
        $('#faModal').modal('show');
    }

    if(window.location.href.indexOf('tw_setup=true#') != -1) {
        $('#twModal').modal('show');
    }

});