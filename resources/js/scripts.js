
$("#ex12c").slider({ id: "slider12c", min: 0, max: 200, range: true, value: [20, 150] });

// On redirect from OAUTH, show modals
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