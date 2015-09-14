$(function() {
    // For silly homepage animation
    $(".cloud").draggable();

    $(".login-container").click( function() {
    	window.location.href = '/authorize';
    	return false;
    })
 });