jQuery(document).ready(function() {
	// Aside menu
	if(jQuery('#aside-menu').length > 0) {
		var staticToggler = jQuery('#gkMobileMenu');
	 
		staticToggler.click(function() {
	    	gkOpenAsideMenu();
		});
	 
		jQuery('#close-menu').click( function() {
	    	gkOpenAsideMenu();
		});
		
		jQuery('#aside-menu').find('a[href^="#"]').click(function() {
			jQuery('#close-menu').trigger('click');
		});
	
		// detect android browser
		var ua = navigator.userAgent.toLowerCase();
		var isAndroid = ua.indexOf("android") > -1 && !window.chrome;
		if(isAndroid) {
			jQuery('body').addClass('android-stock-browser');
		}
		// Android stock browser fix for the aside menu
		if(jQuery('body').hasClass('android-stock-browser') && jQuery('#aside-menu').length > 0) {
			jQuery('#gkMobileMenu').click( function() {
				window.scrollTo(0, 0);
			});
			// menu dimensions
			var asideMenu = jQuery('#aside-menu');
			var menuHeight = jQuery('#aside-menu').height();
			//
			jQuery(window).scroll( function(e) {
				if(asideMenu.hasClass('menu-open')) {
			    	// get the necessary values and positions
			    	var currentPosition = jQuery(window).scrollTop();
			    	var windowHeight = jQuery(window).height();
			
			    	// compare the values
			    	if(currentPosition > menuHeight - windowHeight) {
			        	jQuery('#close-menu').trigger('click');
			    	}
				}
			});
		}
		
		function gkOpenAsideMenu() {
			jQuery('#gkBg').toggleClass('menu-open');
			
			if(jQuery('#aside-menu').hasClass('menu-open')) {
				setTimeout(function() {
					jQuery('#aside-menu').removeClass('menu-open');
					jQuery('#gkBg').removeClass('menu-visible');
				}, 350);
			} else {
				jQuery('#aside-menu').addClass('menu-open');
				jQuery('#gkBg').addClass('menu-visible');
			}
			
			if(!jQuery('#close-menu').hasClass('menu-open')) {
				setTimeout(function() {
			    	jQuery('#close-menu').toggleClass('menu-open');
				}, 300);
			} else {
				jQuery('#close-menu').removeClass('menu-open');
			}
		}
	}
	
	// Classic menu
	if(jQuery('.gkMainMenu').length > 0) {
		// set the menu config only if it is visible
        if(jQuery(window).outerWidth() > jQuery(document.body).attr('data-tablet-width')) {
        	gk_hotel_classic_menu_init();
        }
        // evaluate the menu initialization on every window resize
        jQuery(window).resize(function() {
        	// it will be evaluated only if it wasn't evaluated earlier
        	if(jQuery(window).outerWidth() > jQuery(document.body).attr('data-tablet-width')) {
        		gk_hotel_classic_menu_init();
        	}
        });
        
        // Overlay menu
        jQuery('#gkMobileMenu').click(function(e) {
        	e.preventDefault();
        	
        	if(jQuery('#gk-menu-overlay').length === 0) {
        		var menu_wrap = jQuery('<div id="gk-menu-overlay">&nbsp;</div><div id="gk-menu-overlay-wrap"><span id="gk-menu-overlay-close">&times;</span></div>');
        		jQuery(document.body).append(menu_wrap);
        		jQuery('#gk-menu-overlay-wrap').append(jQuery('.gkMainMenu').clone());
        		
        		jQuery('#gk-menu-overlay-wrap').click(function(e) {
        			e.stopPropagation();
        		});
        		
        		jQuery('#gk-menu-overlay-close').click(function() {
        			jQuery('#gk-menu-overlay').removeClass('gk-active');
        			jQuery('#gk-menu-overlay-wrap').removeClass('gk-active');
        			
        			setTimeout(function() {
        				jQuery('#gk-menu-overlay').removeClass('gk-show');
        				jQuery('#gk-menu-overlay-wrap').removeClass('gk-show');	
        			}, 350);
        		});
        		
        		jQuery('#gk-menu-overlay').click(function() {
        			jQuery('#gk-menu-overlay-close').trigger('click');
        		});
        		
        		jQuery('#gk-menu-overlay-wrap').find('a[href^="#"]').click(function() {
        			jQuery('#gk-menu-overlay-close').trigger('click');
        		});
        	}
    		
    		jQuery('#gk-menu-overlay-wrap').css('top', jQuery(window).scrollTop());
    		jQuery('#gk-menu-overlay').addClass('gk-show');
    		jQuery('#gk-menu-overlay').css('height', jQuery('body').outerHeight() + jQuery('#gk-menu-overlay-wrap').outerHeight() + "px");
    		jQuery('#gk-menu-overlay-wrap').addClass('gk-show');
    		
    		setTimeout(function() {
    			jQuery('#gk-menu-overlay').addClass('gk-active');
    			jQuery('#gk-menu-overlay-wrap').addClass('gk-active');
    		}, 50);
        });
    }
    
    // Fixed menu
    if(jQuery('#gkHeaderNav').attr('data-fixed') === '1') {
    	var page_nav = jQuery('#gkHeaderNav');
    	var prev_scroll_value = 0;
    	page_nav.css('top', 0);	
    		
		function menu_scroll() {
			var new_scroll_value = jQuery(window).scrollTop() >= 0 ? jQuery(window).scrollTop() : 0;	
			var local_diff = new_scroll_value - prev_scroll_value;
			var current = parseInt(page_nav.css('top'));
			var h = 62;
			
			if(new_scroll_value >= 0) {
				//if(
					//!page_nav.hasClass('gk-fixed-nav')
				//) {
					//page_nav.addClass('gk-fixed-nav');
					//page_nav.css('top', '-62px');
					//current = -62;
				//}
			
				if(new_scroll_value >= prev_scroll_value) {
					page_nav.css('top', (current - local_diff >= -62 ? current - local_diff : -62) + "px");
				} else {
					page_nav.css('top', (current - local_diff <= 0 ? current - local_diff : 0) + "px");
				}
			} else {
				if(page_nav.hasClass('gk-fixed-nav')) {
					page_nav.removeClass('gk-fixed-nav');
					page_nav.css('top', 0);	
				}
			}
			
			prev_scroll_value = new_scroll_value;
		}
		
		jQuery(window).scroll(menu_scroll);
    }
}); 

function gk_hotel_classic_menu_init() {
	if(!jQuery('.gkMainMenu').attr('data-loaded')) {
		jQuery('.gkMainMenu').attr('data-loaded', true);
		// fix for the iOS devices     
	    jQuery('.gkMainMenu ul li span').each(function(i, el) {
	        jQuery(el).attr('onmouseover', '');
	    });
	
	    jQuery('.gkMainMenu ul li a').each(function(i, el) {
	        el = jQuery(el);
	        el.attr('onmouseover', '');
	        
	        if(el.parent().hasClass('haschild') && jQuery('body').attr('data-tablet') !== undefined) {
	            el.click(function(e) {
	                if(el.attr("dblclick") === undefined) {
	                    e.preventDefault();
	                    e.stopPropagation();
	                    el.attr("dblclick", new Date().getTime());
	                } else {
	                    if(el.parent().find('div.childcontent').eq(0).css('overflow') === 'visible') {
	                        window.location = el.attr('href');
	                    }
	                    var now = new Date().getTime();
	                    if(now - el.attr("dblclick", 0) < 500) {
	                        window.location = el.attr('href');
	                    } else {
	                       e.preventDefault();
	                       e.stopPropagation();
	                       el.attr("dblclick", new Date().getTime());
	                    }
	                }
	            });
	        }
	    });
	
	    var base = jQuery('.gkMainMenu');
	
	    base.find('.childcontent-inner').each(function(i, submenu) {
	        var cols = jQuery(submenu).children('.gkcol');
	        
	        if(cols.length > 1) {
	            var max = jQuery(cols[0]).outerHeight();
	            
	            for(i = 0; i < cols.length; i++) {
	                max = jQuery(cols[i]).outerHeight() > max ? jQuery(cols[i]).outerHeight() : max;
	            }
	            
	            cols.css('height', max + "px");
	        }
	    });
	    
	    base.find('li.haschild').each(function(i, el){   
	        el = jQuery(el);  
	        if(el.children('.childcontent').length > 0) {
	            var content = el.children('.childcontent').first();
	            var prevh = content.outerHeight();
	            var prevw = content.outerWidth();
	            var duration = base.attr('data-duration');
	            var heightAnim = base.attr('data-height') == '1';
	            var widthAnim = base.attr('data-width') == '1';
	            var opacityAnim = base.attr('data-opacity') == '1'; 
	            
	            if(!opacityAnim && !widthAnim && !heightAnim) {
	            	duration = 0;
	            }
	            
	            // hide the menu till opened
	            if(content.parent().parent().hasClass('level0')) {
	                content.css('margin-left', "-9999px");
	            }
	
	            var fxStart = { 
	                'height' : heightAnim ? 0 : prevh, 
	                'width' : widthAnim ? 0 : prevw, 
	                'opacity' : opacityAnim ? 0 : 1 
	            };
	            var fxEnd = { 
	                'height' : prevh, 
	                'width' : prevw, 
	                'opacity' : 1 
	            };  
	            
	            
	            content.css(fxStart);
	            content.css({'left' : 'auto', 'overflow' : 'hidden' });
	            //                      
	            el.mouseenter(function() {                    
	                var content = el.children('.childcontent').first();
	                var basicMargin = (el.parent().hasClass('level0')) ? -1 * ((prevw / 2) - (el.outerWidth() / 2)) : 0;
	                content.css('display', 'block');
	            
	                var pos = content.offset();
	                var winWidth = jQuery(window).outerWidth();
	                var winScroll = jQuery(window).scrollLeft();
	                
	                // calculations
	                var posStart = pos.left;
	                var posEnd = pos.left + prevw;
	                var diff;
					
					content.addClass('active');
					
	                if(el.parent().hasClass('level0')) {
	                    content.css('margin-left', basicMargin + "px");
	                    pos = content.offset();
	                    posStart = pos.left;
	                    posEnd = pos.left + prevw;
	                    
	                    if(posStart < 0) {
	                        content.css('margin-left', parseInt(content.css('margin-left')) + (-1 * posStart) + 10);
	                    }
	                    
	                    if(posEnd > winWidth + winScroll) {
	                        diff = (winWidth + winScroll) - posEnd;
	                        content.css('margin-left', parseInt(content.css('margin-left')) + diff - 24);
	                    }
	                } else {
	                    diff = (winWidth + winScroll) - posEnd;
	                    
	                    if(posEnd > winWidth + winScroll) {
	                        content.css('margin-left', diff - 150 + "px");
	                    }
	                }
	                //
	                content.stop().animate(
	                    fxEnd, 
	                    {
		                    "duration": duration, 
		                    "queue": false,
		                    "complete": function() { 
					                        if(content.outerHeight() === 0){ 
					                            content.css('overflow', 'hidden'); 
					                        } else {
					                            content.css('overflow', 'visible');
					                        }
					                    }
	                    }
	                );
	            });
	            
	        	el.mouseleave(function(){
	                content.css({
	                    'overflow': 'hidden'
	                });
	                //
	                content.stop().animate(
	                    fxStart, 
	                    {
	                        "duration": duration, 
	                        "queue": false,
	                        "complete": function() { 
					                        if(content.outerHeight() === 0){ 
					                            content.css('overflow', 'hidden'); 
					                        } else if(
					                            content.outerHeight(true) - prevh < 30 && 
					                            content.outerHeight(true) - prevh >= 0
					                        ) {
					                            content.css('overflow', 'visible');
					                        }
					                        content.removeClass('active');
					                        content.css('display', 'none');
					                    }
					    }
	                );
	            });
	        }
	    });  
    }  
}