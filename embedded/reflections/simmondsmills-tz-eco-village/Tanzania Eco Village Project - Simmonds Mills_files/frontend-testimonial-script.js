jQuery(document).ready(function($) {

if( $('.testimonialbox').length ) {
	 console.log('testimonials exists');
	 document.testimonialArray = new Array();
	 // slideshow mode deactivated right now
	 // it will be set from the widget. via localised vars.
	 
		/*if(typeof (document.timer)=='undefined'){
			document.timer = setInterval( function() { 
				gettestimonial('slideshow');
				document.slideshowrunning=true; 
			}, 1000);
		}*/
		
		
	// slideshow mode deactivated for now --------------------------------
	/*
		$('.testimonialwidget').on("click",function(){
				console.log('slide click');
				gettestimonial('noslideshow');
		});*/
		
		
	}

});

function gettestimonial(mode){
	//console.log('get one');
	if (typeof offset == 'undefined' ){
			offset=4; 
			var numposts =1;
			}else{
				 var numposts =1;
			 }
			
		var data = {
		'action': 'get_pher_testimonialpost',
		'offset':offset,
		'numposts':numposts,

	};

	jQuery.post(ajax_testimonial_object.ajaxurl, data ,function(response){
			offset+=1;
			var obj = jQuery.parseJSON(response);
			if(obj.endmarker ==false){
				// its not the end yet

				movethis = jQuery( ".testimonialwidget .testimonialbox:first" );
				elWidth = jQuery(movethis).width()*-1;

				jQuery( movethis ).css( {'margin-left' : elWidth} ).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 	
				
				    jQuery( movethis ).detach();
					document.testimonialtotal= obj.total;
					document.testimonialArray.push(movethis);
					jQuery('.testimonialwidget .section-inner' ).last().append(obj.html); 
				 });
				
			

				}else{
					// its the end so start recycling content
				 	clearInterval(document.timer);
					
					if(mode=='slideshow'){
						document.timer = setInterval( function() { 
							testimonialrecycle();	
							document.slideshowrunning=true; 
						}, 1000);
					}else{
						testimonialrecycle();	
						}
					
				}
			
		})
		  .fail(function() {
  		})
		  .always(function() {
		});
	
}

function testimonialrecycle(){
	//console.log('recycling, for bandwidth reasons');
	//movethis = jQuery( ".testimonialwidget .testimonialbox:first" ).detach();
	
	movethis = jQuery( ".testimonialwidget .testimonialbox:first" );
	elWidth = jQuery(movethis).width()*-1;
	
	jQuery( movethis ).css( "margin-left", elWidth ).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
		var reycycledElement = document.testimonialArray[0];
		jQuery( reycycledElement ).css( "margin-left", 0)
		
		jQuery( movethis ).detach();
		document.testimonialArray.shift();// kill the 0'th item
		document.testimonialArray.push(movethis);// pop it back on the end.
		jQuery('.testimonialwidget .section-inner' ).last().append(reycycledElement); // get new added el from the array instead
		
	 });
	 
	
	
	
}

