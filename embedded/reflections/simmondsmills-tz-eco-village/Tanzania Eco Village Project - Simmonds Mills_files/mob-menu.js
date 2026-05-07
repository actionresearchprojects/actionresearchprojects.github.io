jQuery(document).ready(function($) {
	
	jQuery(document).on("click", "#primarymenuhandle" ,function() {	
			jQuery("#mainmenucontainer ul").toggleClass("active");	
			jQuery(".secondarymenu ul").toggleClass("active");	
			jQuery("#primarymenuhandle").toggleClass("activemobilemenu");	
	});
	
	var currentsize='unknown';
	checkwindow();
	var timer;
	jQuery(window).resize(function() {
   	 	clearTimeout(timer);
    	timer = setTimeout(checkwindow, 100);
    });
	
	
});


function checkwindow(){

	var breakpoint = 890; 
	var wi = jQuery(window).width();
	currentsize='unknown';
	if (wi <= breakpoint && currentsize!='small'){
			//console.log(' Screen width is currently: ' + wi + 'px, a  smaller screen');
			//bindmenus();
			var currentsize='small';
			// move the secondary menu into a group with the main menu
			
			current_secondary_menu= jQuery('.secondarymenu');
			var clonedmenu = current_secondary_menu.clone();
		    jQuery('#mainmenucontainer').after(clonedmenu);
			current_secondary_menu.remove();
			
			
		}else if (wi > breakpoint && currentsize!='large'){
		//console.log('Screen width is currently: ' + wi + 'px. show all for bigger screens.');
			
			current_secondary_menu= jQuery('.secondarymenu');
			var clonedmenu = current_secondary_menu.clone();
			jQuery('#inner-header').before(clonedmenu);
			current_secondary_menu.remove();/**/

			var currentsize='large';
		}
		return currentsize;
}