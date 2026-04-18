/****** do the masonry layout ************/

jQuery(document).ready(function($){

		jQuery('.grid_section.masonrymode').imagesLoaded( function() {
				$('.grid_section.masonrymode').masonry({ itemSelector: '.grid_section.masonrymode .ph_griditem', transitionDuration: 0});
			});
	
		var $grid =  $('.gallery').masonry({ itemSelector: '.gallery-item'});

		$grid.imagesLoaded().progress( function() {
			 $grid.masonry('layout');
		});
  	});



jQuery( document ).ready(function($) {
	
	if (jQuery(".grid_section").length){ 

		var thisobj;
		
	$( ".p-grid-lister" ).each(function( index ) {
		$( this ).data( "currentterm", 'all-terms' );
		$( this ).data( "pagination", 1);
		 submit_ajax_info.call(this);
		
		});

	}
	
});

function currentarea(){

}

function getcurrentterm(){
	currentterm = jQuery( this ).data( "currentterm");
	console.log('>>>the widget in the getcurrentterm() : '+ jQuery(this).attr('id') +' get current term = '+currentterm);
	return currentterm;
}

function getcurrentsearch(){
	searchstring ='';// default
	thisobjid='#'+jQuery(this).attr('id');
	 if (jQuery(thisobjid+" .searchword").val().length >1){ 
		searchstring = jQuery(thisobjid+" .searchword").val();
		}
	return searchstring;	
}


/******************* FILTER CLICK AND ENTER ACTIONS *********************/

jQuery(document).on("click", ".section_masonry_filterbar .filterword" ,function() {	// clicked the colourful filter words.

 	thisobj = jQuery(this).parents('.p-grid-lister');
	thisobjid='#'+jQuery(thisobj).attr('id');
	
    var innovterm = this.id;

	if(this.id=='all-terms'){
		console.log('they want everything');
	}
	jQuery(thisobjid).data( "currentterm", innovterm);
	
	console.log ('I just set the current term for '+ thisobjid +' to '+	jQuery(thisobjid).data( "currentterm"));
	submit_ajax_info.call(thisobj);	
});


jQuery(document).on("focus", ".searchword" ,function() {  // dim the placeholder text in the search box
	jQuery(".searchword").attr("placeholder", "");
});



// PAGINATION "MORE "---------------------------------------------------------------

jQuery(document).on("click", ".section_masonry_filterbar #loadmoreinnovations" ,function() {	
if(typeof document.pagination =='undefined'){
	document.pagination=1;}
	document.pagination+=1;
	submit_ajax_info();	
});

function more_check(theseresults,totalresults){
	if (getcurrentsearch()){searchwords = " with the search terms '"+getcurrentsearch()+"'";}else{searchwords='';}
	if( document.currentterm !="all-terms"){searchwords += ' with the filter of '+document.currentterm}
	if ( theseresults !=totalresults){count = theseresults +" of "+totalresults }else{count =' all innovations ';}
	
	jQuery("#innovation_searchinfo").html("Showing  " +count+' ' + searchwords);
	if (theseresults == totalresults){
		jQuery("#loadmoreinnovations").hide();
			//console.log("button should hide");
		}else{
			jQuery("#loadmoreinnovations").show();
		
		}
	}


/************************ SEARCH, buttons and keys *********************************************************/

jQuery(document).on("click", ".section_masonry_filterbar a.searchbutton" ,function() {
	
			var searchword = jQuery(".searchword").val();
			var innovarea = currentarea();
			submit_ajax_info(innovarea, document.currentterm , searchword );
			
});

jQuery(document).on("click", ".searchcancel" ,function() {
	thisobj = jQuery(this).parents('.p-grid-lister');
	thiswidgetid = '#'+jQuery(thisobj).attr('id');

	jQuery(thiswidgetid+" .searchword").val('');
	
	checkvalidsearch(thiswidgetid);
	submit_ajax_info.call(thisobj);
	
	});


jQuery(document).on("keydown", ".searchword",function(e){
 if (e.keyCode == 13 && !e.shiftKey) {
    e.preventDefault();
	thisobj = jQuery(this).parents('.p-grid-lister');
	thiswidgetid =  '#'+jQuery(thisobj).attr('id');
	
	checkvalidsearch(thiswidgetid);
	currentterm = jQuery( thiswidgetid).data( "currentterm");
	console.log('search says widget name  = '+ jQuery(thisobj).attr('id'));
	console.log('search says widget terms = '+ currentterm);
	submit_ajax_info.call(thisobj);
	
  }
});



function checkvalidsearch(thiswidgetid){
	
	if (jQuery(thiswidgetid+" .searchword").val().length <2){ 
		jQuery(thiswidgetid+" .searchword").attr("placeholder", "TYPE A KEYWORD HERE");
		// hide the cancel button
		jQuery(thiswidgetid+" .searchcancel").removeClass('active');
	}else{
		//show the cancel button
		jQuery(thiswidgetid+" .searchcancel").addClass('active');
		}
}


jQuery(document).on("click", ".loadmore" ,function() {
	thisobj = jQuery(this).parents('.p-grid-lister');
	thiswidgetid = '#'+jQuery(thisobj).attr('id');
	console.log('get '+ shortcodevars.posts_per_page+' more for  = '+ jQuery(thisobj).attr('id'));
	currentpage = jQuery( thiswidgetid).data( "pagination");
	currentpage +=1;
	jQuery( thiswidgetid).data( "pagination",currentpage)

	submit_ajax_info.call(thisobj,null,null,null,true);
	
});
/**----------------------------**/


function killtheold(killlist){
	
	jQuery.each(killlist, function( index, value ) {
		jQuery("#tile_"+ value).addClass('shrink').on( 'webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend', function(){
   			jQuery( this ).remove(); 		
		});	
		
	});// end each
	//console.log( document.showing );
}



function spawnanim_on(spawnarray){
	jQuery.each(spawnarray, function( index, value ) {
			jQuery("#tile_"+ value ).addClass('zoom').on( 'webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend', function(){
			jQuery("#tile_"+ value).removeClass('zoom')

		});
	
	});// end each
	//console.log( document.showing );
}
 
 
/*********** THE ACTUAL AJAX SUBMISSION AND RETURN **************/

function submit_ajax_info(innovarea, innovterm, searchstring, moreresults){	

	thisthis = this;
	thiswidgetid=jQuery(this).attr('id');

	
	var	postsperpage = shortcodevars.posts_per_page; // get this from the shortcode.
		
	 // takes the currently visible items and passes them to the handler
	if (typeof this.showing!=null){innovshowing=document.showing;}else{innovshowing='';}

	pagination = jQuery('#'+thiswidgetid).data( "pagination");
	var innovarea = currentarea();
	if (jQuery(' .response_area').hasClass('listmode')){displaymode='listmode';	}else{	displaymode='masonrymode';	}

	if(typeof innovterm==null || !innovterm){
		var innovterm =   getcurrentterm.call(this); 
		console.log('returned call of innovterm ---- '+innovterm);
		 }
		 
	if(!searchstring || typeof(searchstring) == 'undefined'){var searchstring= getcurrentsearch.call(this);}
	
	console.log('searchstring : '+ searchstring +', term '+innovterm);
	var data = {
		'action': 'get_innovations',

		'posttype':shortcodevars.posttype,
		'innovterm': innovterm , 
		'searchstring': searchstring,   
		'innovshowing':innovshowing,
		'getpage':pagination,
		'postsperpage':postsperpage,
		'displaymode':displaymode,
	};

	jQuery.post(ajax_masonry_object.ajaxurl, data ,function(response){
				var obj = jQuery.parseJSON( response );
				if (obj.html.length>1){
			
				
			// listmode stuff -- append the html to the response area 
				jQuery( '.message' ).remove(); // if there was previously an error type message, kill it
				
				if(typeof (moreresults)=='undefined'){
					
					}
				jQuery('#'+thiswidgetid+' .grid_section').empty(); // if we are not next paging then kill existing tiles
				html = jQuery.parseHTML( obj.html )
				jQuery('#'+thiswidgetid+' .grid_section.listmode').prepend(html);
				
				// masonrymode stuff 	-----------
				jQuery('#'+thiswidgetid+' .grid_section.masonrymode').masonry( 'remove', '.ph_griditem' );
				jQuery('#'+thiswidgetid+' .grid_section.masonrymode').prepend(html).masonry();
				jQuery('#'+thiswidgetid+' .grid_section.masonrymode').masonry( 'reloadItems' );
			
				jQuery('#'+thiswidgetid+' .grid_section').imagesLoaded( function() {
				jQuery('#'+thiswidgetid+' .grid_section.masonrymode').masonry( 'layout' );
				
				jQuery('#'+thiswidgetid).currentterms = innovterm;
				// update terms
				remainder = obj.totalresults - pagination * postsperpage;
				if(remainder <= postsperpage){ jQuery('#'+thiswidgetid +' .loadmore').text('LOAD '+remainder+' MORE');}
				if(remainder <=0){jQuery('#'+thiswidgetid +' .loadmore').addClass('deactivated'); }

			});

				  spawnanim_on(obj.spawn);

				}else{
					noresults = '<div class="message"><h2>No results';
					if (jQuery(".searchword").val().length >2){noresults +=' for "'+jQuery(".searchword").val()+'"';}
					if (innovterm.length>1){noresults +=' in '+ innovterm;}
					noresults +='</h2></div>';
					 jQuery('#'+thiswidgetid+' .response_area').html(noresults);
					}

			jQuery('#'+thiswidgetid+'  #filterwords span').removeClass('active');
			
			if(typeof innovterm !=null){jQuery('#'+thiswidgetid+'  #filterwords #'+innovterm).addClass('active');}

		})
		  .fail(function() {
			console.log('theres an error in the ajax, go take a look whats happening')
  		})
		  .always(function() {
			jQuery("#loadmoreinnovations").removeClass( "response_area_loading" );
			
			console.log('double check of term set '+ jQuery('#'+thiswidgetid));
		});

}
