jQuery(document).on("click", ".gallery-icon a" ,function(e) {
	
	if(jQuery('body.fee-on').length>0){	return null} // cancel if editing in FEE
	
	    e.preventDefault();
		do_lightbox_gal.call(this);
});

jQuery(document).on("click", "a.lightbox-img" ,function(e) {
	if(jQuery('body.fee-on').length>0){	return null} // cancel if editing in FEE
		
	    e.preventDefault();
		do_lightbox.call(this);
});

function do_lightbox(action){	
	jQuery('#container').addClass('blur');
	
		if (jQuery('#lightbox').length > 0) {		
		}else{
			jQuery( ".gallery br" ).remove();
				var image_href = jQuery(this).attr("href");
				var lightbox = 
				'<div id="lightbox" class="pher_lightbox">' +
				'<div class="close_this">Close <span>X</span></div>' +
				'<div class="lightbox_content">' + //insert clicked link's href into img src
				'<img src="' + image_href +'" />' +
				'</div>' +	
				'</div>';
				jQuery('body').append(lightbox);
	}

}



function do_lightbox_gal(action){	
	jQuery('#container').addClass('blur');
	
	jQuery(document).bind( "keydown", function(e){
      // alert(e.which);

	   if (e.which == 39)getnext(e);
	   if (e.which == 37)getprev(e);
    });
	
		var next = jQuery('.gallery').data( "next");//retrieve
		var prev = jQuery('.gallery').data( "prev");//retrieve
		
	console.log('what nex '+next);
	if (jQuery('#lightbox').length > 0) {  // litebox is already active and we are navigating existing images
			if(action =='next'){
				var image_href = jQuery(next).attr('href');
				var lightbox = '<img src="' + image_href +'" />';
				jQuery('#lightbox .lightbox_content').html(lightbox);
				grandfather = jQuery(next).parent().parent();	
				
			}
			
			if(action =='prev'){
				var image_href = jQuery(prev).attr('href');
				var lightbox = '<img src="' + image_href +'" />';
				jQuery('#lightbox .lightbox_content').html(lightbox);
				grandfather = jQuery(prev).parent().parent();	
		
			}

		}else{
				// first run, so better check the states.
				jQuery( ".gallery br" ).remove();
				var image_href = jQuery(this).attr("href");
				var lightbox = 
				'<div id="lightbox" class="pher_lightbox">' +
				'<div class="close_this">Close <span>X</span></div>' +
				'<div class="arrow next_arrow">></div>'+
				'<div class="arrow prev_arrow"><</div>'+
				'<div class="lightbox_content">' + //insert clicked link's href into img src
				'<img src="' + image_href +'" />' +
				'</div>' +	
				'</div>';
				jQuery('body').append(lightbox);
				grandfather = jQuery(this).parent().parent();	// grandfather is from This, because there's no previous state

			}


	prevhref = jQuery(grandfather).prev().find('a').attr('href');// these come from the previous persisted cycle
	nexthref = jQuery(grandfather).next().find('a').attr('href');
	if(typeof nexthref =='undefined') {jQuery("#lightbox .next_arrow").addClass('deactivated'); }else{ jQuery("#lightbox .next_arrow").removeClass('deactivated'); }
	if(typeof prevhref =='undefined') {jQuery("#lightbox .prev_arrow").addClass('deactivated'); }else{ jQuery("#lightbox .prev_arrow").removeClass('deactivated'); }

	next = grandfather.next().find('a');//persist
	prev = grandfather.prev().find('a');// persist
	
	jQuery('.gallery').data( "next", next );//set
	jQuery('.gallery').data( "prev", prev );//set
	
}

jQuery(document).on("click", ".close_this" ,function(e) {
		jQuery('#lightbox').remove();
		jQuery('#container').removeClass('blur');
		
		jQuery(document).unbind( "keydown" );
	});

jQuery(document).on("click", "#lightbox" ,function(e) {
	jQuery('#lightbox').remove();
	jQuery('#container').removeClass('blur');
	jQuery(document).unbind( "keydown" );
	 e.stopPropagation();
});
	
jQuery(document).on("click", "#lightbox .next_arrow" ,function(e) {
	e.stopPropagation();
	if(jQuery(this).hasClass('deactivated')){return}
	do_lightbox_gal('next');
});

jQuery(document).on("click", "#lightbox img" ,function(e) {
	e.stopPropagation();
	if(jQuery('#lightbox .next_arrow').html()==undefined){return null}
	if(jQuery('#lightbox .next_arrow').hasClass('deactivated')){return}
	do_lightbox_gal('next');
});

jQuery(document).on("click", "#lightbox .prev_arrow" ,function(e) {
	e.stopPropagation();
	if(jQuery(this).hasClass('deactivated')){return}
	do_lightbox_gal('prev');
});

function getnext(e){
	if(jQuery('#lightbox .next_arrow').hasClass('deactivated')){return}
	do_lightbox_gal('next');
}

function getprev(e){
	if(jQuery(this).hasClass('deactivated')){return}
	do_lightbox_gal('prev');
}