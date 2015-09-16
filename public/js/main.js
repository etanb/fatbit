$(function() {
	if( $(location).attr('pathname') === "/" ){
		// For silly homepage animation
		$(".cloud").draggable();

		$(".login-container").click( function() {
			window.location.href = '/authorize';
			return false;
		})
	} else if ( $(location).attr('pathname') === "/greetings" ) {
		// For silly card flipping animation
		$('.card').click(function(){
		  $(this).toggleClass('flipped');
		});
		// For random healthy image for card
		var healthyArray = ["/public/img/apple.svg", "/public/img/banana.svg", "/public/img/carrot.svg"],
			fattyArray = ["/public/img/donut.svg", "/public/img/cupcake.svg", "/public/img/burger.svg"],
			healthImg = healthyArray[Math.floor(Math.random() * healthyArray.length)],
			fatImg = fattyArray[Math.floor(Math.random() * fattyArray.length)];
		$("#healthyURL").attr('src', healthImg);
		$("#fatURL").attr('src', fatImg);
	}
 });

