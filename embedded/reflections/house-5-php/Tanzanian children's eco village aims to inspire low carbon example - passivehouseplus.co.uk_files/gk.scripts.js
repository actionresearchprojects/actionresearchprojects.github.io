// IE checker
function gkIsIE() {
	var myNav = navigator.userAgent.toLowerCase();
	return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}
// jQuery Cookie plugin
jQuery.cookie = function (key, value, options) {
    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);
        if (value === null || value === undefined) {
            options.expires = -1;
        }
        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }
    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};
//
jQuery(document).ready(function() {	
	// smooth anchor scrolling
	if(!(jQuery('#gkMainbody').find('.subpage').length && jQuery('#gkMainbody').find('.subpage').hasClass('edit'))) {
		jQuery('a[href*="#"]').on('click', function (e) {
	        e.preventDefault();
	        if(this.hash !== '' && this.hash.indexOf('carousel') === -1) {
	            var target = jQuery(this.hash);
	            
	            if(this.hash !== '' && this.href.replace(this.hash, '') == window.location.href.replace(window.location.hash, '')) {    
	                if(target.length && this.hash !== '#') {
	                    jQuery('html, body').stop().animate({
	                        'scrollTop': target.offset().top
	                    }, 1000, 'swing', function () {
	                        if(this.hash !== '#') {
	                            window.location.hash = target.selector;
	                        }
	                    });
	                } else if(this.hash !== '' && this.href.replace(this.hash, '') !== '') {
	                	window.location.href = this.href;
	                }
	            } else if(this.hash !== '' && this.href.replace(this.hash, '') !== '') {
	            	window.location.href = this.href;
	            }
	        }
	    });
    }
    
    // Social icons
    jQuery('.item-social-icons').click(function() {
    	jQuery(this).toggleClass('open');
    	jQuery(this).parent().toggleClass('social-open');
    });
    
    // Footer popup menu
    jQuery('#gkFooterNavPopup .micon').click(function() {
    	jQuery(this).parent().toggleClass('open');
    });
    
    jQuery('#gkFooterNavPopup').find('.gk-footer-popup a').click(function() {
    	jQuery('#gkFooterNavPopup').removeClass('open');
    });
    
    jQuery('#gkFooterNavPopup').find('.gk-footer-popup').click(function() {
    	jQuery('#gkFooterNavPopup').removeClass('open');
    });
    
    // Search button
    jQuery('#gkSearch .micon').click(function() {
    	jQuery('#gkSearch .micon').parent().toggleClass('open');	
    });
    
	// K2 font-size switcher fix
	if(jQuery('#fontIncrease').length > 0 && jQuery('.itemIntroText').length > 0) {
		jQuery('#fontIncrease').click(function() {
			jQuery('.itemIntroText').attr('class', 'itemIntroText largerFontSize');
		});
		
		jQuery('#fontDecrease').click( function() {
			jQuery('.itemIntroText').attr('class', 'itemIntroText smallerFontSize');
		});
	}
	
	// login popup
	if(jQuery('#gkUser .micon').length && jQuery('#gk-login-submenu').length) {
		var submenu = jQuery('#gk-login-submenu');
		
		jQuery('#gkUser .micon').click(function() {			
			if(jQuery('#gkUser').hasClass('gk-open')) {
				jQuery('#gkUser').removeClass('gk-open');
				
				setTimeout(function() {
					submenu.css('display', 'none');	
				}, 350);
			} else {
				submenu.css('display', 'block');
				
				setTimeout(function() {
					jQuery('#gkUser').addClass('gk-open');
				}, 50);	
			}
		});
	}
	
	// Social icons
	if(jQuery('.gk-social-icons').length) {
		var social_icons = jQuery('.gk-social-icons');
		social_icons.click(function() {
			var item = jQuery(this);
			
			if(!item.attr('data-click-block') || item.attr('data-click-block') == '') {
				if(item.hasClass('clicked')) {
					item.removeClass('show');
					setTimeout(function() {
						item.removeClass('clicked');
						item.attr('data-click-block', '');
					}, 350);		
				} else {
					item.addClass('clicked');
					item.attr('data-click-block', 'true');
					
					setTimeout(function() {
						item.addClass('show');
					}, 50);
					
					setTimeout(function() {
						item.attr('data-click-block', '');
					}, 300);
				}
			}
		});
	}
	
	// Fix for the containers width
	if(jQuery('#gkBg').outerHeight() < jQuery(window).outerHeight()) {
		if(!jQuery(document.body).hasClass('error-page')) {
			jQuery('#gkBg').css('min-height', jQuery(window).outerHeight() + "px");
		}
	}
	
	jQuery(window).resize(function() {
		if(!jQuery(document.body).hasClass('error-page')) {
			if(jQuery('#gkBg').outerHeight() < jQuery(window).outerHeight()) {
				jQuery('#gkBg').css('min-height', jQuery(window).outerHeight() + "px");
			}
		}
	});
	
	// PhotoSwipe script
	var initPhotoSwipeFromDOM = function(gallerySelector) {
	    // parse slide data (url, title, size ...) from DOM elements 
	    // (children of gallerySelector)
	    var parseThumbnailElements = function(el) {
	        var thumbElements = jQuery(el).find('a'),
	            numNodes = thumbElements.length,
	            items = [],
	            figureEl,
	            linkEl,
	            size,
	            item;
	
	        thumbElements.each(function(i, link) {
	            link = jQuery(link);
	            size = link.attr('data-size').split('x');
	
	            // create slide object
	            item = {
	                src: link.attr('href'),
	                w: parseInt(size[0], 10),
	                h: parseInt(size[1], 10)
	            };
	
	            if(link.attr('data-title') || link.attr('data-desc')) {
	                item.title = '';
	                
	                if(link.attr('data-title')) {
	                	item.title += '<h3>' + link.attr('data-title') + '</h3>';
	                }
	                
	                if(link.attr('data-desc')) {
	                	item.title += '<span>' + link.attr('data-desc') + '</span>';
	                }
	            }
	
	            item.msrc = link.find('img').first().attr('src');
	            item.el = link; // save link to element for getThumbBoundsFn
	            // Detect the data-order attribute
	            if(
	            	jQuery(window).outerWidth() > jQuery(document.body).attr('data-mobile-width') &&
	            	link.attr('data-order')
	            ) {
	            	items[parseInt(link.attr('data-order'), 10) - 1] = item;
	            } else {
	            	items.push(item);
	            }
	        });
	
	        return items;
	    };
	
	    // find nearest parent element
	    var closest = function closest(el, fn) {
	        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
	    };
	
	    // triggers when user clicks on thumbnail
	    var onThumbnailsClick = function(e) {
	        e.preventDefault();	
	        // find root element of slide
	        var clickedListItem = closest(e.target, function(el) {
	            return (el.tagName && el.tagName.toUpperCase() === 'A');
	        });
	
	        if(!clickedListItem) {
	            return;
	        }
	
	        // find index of clicked item by looping through all child nodes
	        // alternatively, you may define index via data- attribute
	        var clickedGallery = jQuery(clickedListItem).parents('.gk-gallery'),
	            childNodes = clickedGallery.find('a'),
	            numChildNodes = childNodes.length,
	            nodeIndex = 0,
	            index;
	
	        for (var i = 0; i < numChildNodes; i++) {
	            if(childNodes[i] === clickedListItem) {
	                index = nodeIndex;
	                break;
	            }
	            nodeIndex++;
	        }

			if(
				jQuery(window).outerWidth() > jQuery(document.body).attr('data-mobile-width') &&
				clickedListItem.hasAttribute('data-order')
			) {
				index = parseInt(clickedListItem.getAttribute('data-order'), 10) - 1;
			}

	        if(index >= 0) {
	            // open PhotoSwipe if valid index found
	            openPhotoSwipe( index, clickedGallery );
	        }
	        return false;
	    };
	
	    // parse picture index and gallery index from URL (#&pid=1&gid=2)
	    var photoswipeParseHash = function() {
	        var hash = window.location.hash.substring(1),
	        params = {};
	
	        if(hash.length < 5) {
	            return params;
	        }
	
	        var vars = hash.split('&');
	        for (var i = 0; i < vars.length; i++) {
	            if(!vars[i]) {
	                continue;
	            }
	            var pair = vars[i].split('=');  
	            if(pair.length < 2) {
	                continue;
	            }           
	            params[pair[0]] = pair[1];
	        }
	
	        if(params.gid) {
	            params.gid = parseInt(params.gid, 10);
	        }
	
	        if(!params.hasOwnProperty('pid')) {
	            return params;
	        }
	        params.pid = parseInt(params.pid, 10);
	        return params;
	    };
	
	    var openPhotoSwipe = function(index, galleryElement, disableAnimation) {
	        var pswpElement = document.querySelectorAll('.pswp')[0],
	            gallery,
	            options,
	            items;
	
	        items = parseThumbnailElements(galleryElement);
	
	        // define options (if needed)
	        options = {
	            index: index,
	            showHideOpacity: true,
	            hideAnimationDuration: 0,
	            showAnimationDuration: 0,
	            
	
	            // define gallery index (for URL)
	            galleryUID: jQuery(galleryElement).attr('data-pswp-uid'),
	
	            getThumbBoundsFn: function(index) {
	                // See Options -> getThumbBoundsFn section of documentation for more info
	                var thumbnail = items[index].el.find('img').first(), // find thumbnail
	                    rect = {
	                    	"left": thumbnail.offset().left, 
	                    	"top": thumbnail.offset().top,
	                    	"width": thumbnail.outerWidth()
	                    }; 
	                return {x:rect.left, y:rect.top, w:rect.width};
	            }
	
	        };
	
	        if(disableAnimation) {
	            options.showAnimationDuration = 0;
	        }
	
	        // Pass data to PhotoSwipe and initialize it
	        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
	        gallery.init();
	    };
	
	    // loop through all gallery elements and bind events
	    var galleryElements = jQuery(gallerySelector);
	
	    for(var i = 0, l = galleryElements.length; i < l; i++) {
	        galleryElements[i].setAttribute('data-pswp-uid', i+1);
	        galleryElements[i].onclick = onThumbnailsClick;
	    }
	
	    // Parse URL and open gallery if it contains #&pid=3&gid=1
	    var hashData = photoswipeParseHash();
	    if(hashData.pid > 0 && hashData.gid > 0) {
	        openPhotoSwipe( hashData.pid - 1 ,  galleryElements[ hashData.gid - 1 ], true );
	    }
	};
	
	// execute above function if the gallery elements exists
	if(jQuery('.gk-gallery').length) {
		initPhotoSwipeFromDOM(jQuery('.gk-gallery'));
	}
	
	// Newsletter popup
	var newsletter_submit = jQuery('#gk-newsletter-submit');
	
	if(newsletter_submit.length) {
		newsletter_submit.click(function() {
			jQuery.cookie('gk-newsletter-popup', 1, { expires: 30, path: '/' });
		});
		
		jQuery('#gk-newsletter-popup-close').click(function(e) {
			e.preventDefault();
			
			jQuery.cookie('gk-newsletter-popup', 1, { expires: 30, path: '/' });
			jQuery('#gk-newsletter-popup').addClass('hidden-popup');
		});
	}
	
	// Social sharing popups
    var Config = {
        Link: ".icon-share-popup",
        Width: 500,
        Height: 500
    };
 
    // add handler links
    var slink = document.querySelectorAll(Config.Link);
    for (var a = 0; a < slink.length; a++) {
        slink[a].onclick = gkPopupHandler;
    }
 
    // create popup
    function gkPopupHandler(e) {
        e = (e ? e : window.event);
        var t = (e.target ? e.target : e.srcElement);
        // popup position
        var px = Math.floor(((screen.availWidth || 1024) - Config.Width) / 2),
            py = Math.floor(((screen.availHeight || 700) - Config.Height) / 2);
        // open popup
        var link_href = t.href ? t.href : t.parentNode.href;
        var popup = window.open(link_href, "social", 
            "width="+Config.Width+",height="+Config.Height+
            ",left="+px+",top="+py+
            ",location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1");
        if (popup) {
            popup.focus();
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
        }
 
        return !!popup;
	}
	
	// NSP Switch UI
	jQuery('.nsp-switch-ui').each(function(i, ui) {
		ui = jQuery(ui);
		
		var firstBtn = jQuery(ui.find('i')[0]);
		var secondBtn = jQuery(ui.find('i')[1]);
		var arts = ui.parent().find('.nspArt');
		
		var minHeight = jQuery(arts[0]).find('.gkArtContentWrap').outerHeight();
		
		function nspSwitchUIHelper(art, delay, finalOpacity) {
			setTimeout(function() {
				art.css('opacity', finalOpacity);
			}, delay);
		}
		
		firstBtn.click(function() {
			var cols = firstBtn.attr('data-cols');
			
			for(var j = 0; j < arts.length; j++) {
				var art = jQuery(arts[j]);
				nspSwitchUIHelper(art, 0, 0);
			}
			
			setTimeout(function() {
				for(var j = 0; j < arts.length; j++) {
					arts[j] = jQuery(arts[j]);
					arts[j].attr('class', 'nspArt nspCol' + cols);
					arts[j].find('.gkArtContentWrap').css('min-height', minHeight + "px");
					arts[j].css('clear', 'none');
				}
				
				setTimeout(function() {
					for(var j = 0; j < arts.length; j++) {
						var art = jQuery(arts[j]);
						nspSwitchUIHelper(art, 0, 1);
					}
				}, 300);
			}, 350);
		});
		
		secondBtn.click(function() {
			var cols = secondBtn.attr('data-cols');
			
			for(var j = 0; j < arts.length; j++) {
				var art = jQuery(arts[j]);
				nspSwitchUIHelper(art, 0, 0);
			}
			
			setTimeout(function() {
				for(var j = 0; j < arts.length; j++) {
					arts[j] = jQuery(arts[j]);
					arts[j].attr('class', 'nspArt nspHorizontal nspCol' + cols);
					arts[j].find('.nspImageWrapper').css('background-image', 'url(' + arts[j].find('.nspImageWrapper img').attr('src') + ')');
					arts[j].find('.gkArtContentWrap').css('min-height', arts[j].find('img').outerHeight() + "px");
					arts[j].css('clear', 'none');
				}
				
				setTimeout(function() {
					for(var j = 0; j < arts.length; j++) {
						var art = jQuery(arts[j]);
						nspSwitchUIHelper(art, 0, 1);
					}
				}, 300);
			}, 350);
		});
	});
});

// Newsletter display
jQuery(window).load(function() {
	var newsletter = jQuery('#gk-newsletter-popup');
	
	if(newsletter.length) {
		switch (newsletter.attr('data-display')) {
		  	case 'direct':
				setTimeout(function() {
					newsletter.removeClass('hidden-popup');
				}, 1000);
				break;
			case 'after_time':
				setTimeout(function() {
					newsletter.removeClass('hidden-popup');
				}, newsletter.attr('data-time') * 1000);
				break;
			case 'after_scroll': 
				var win = jQuery(window);
				var destination = newsletter.attr('data-scroll');
				
				var newsletter_scroll = function() {
					if(win.scrollTop() >= destination) {
						newsletter.removeClass('hidden-popup');
						jQuery(window).off('scroll', newsletter_scroll);
					}
				};
				
				jQuery(window).on('scroll', newsletter_scroll);
				break;
		}
	}
});

// Reviews
jQuery(window).load(function() {
	jQuery('.gk-review-sum-value').each(function(i, sum) {		
		if(
			!jQuery(sum).parent().hasClass('gk-content-title') &&
			!jQuery(sum).parent().hasClass('gk-review-sum')
		) {
			var circle = new ProgressBar.Circle(sum, {
			    color: '#07c958',
			    strokeWidth: 4,
			    trailWidth: 4,
			    duration: 1500,
			    easing: 'easeInOut'
			});
			
			circle.animate(jQuery(sum).attr('data-final'));
		}
	});
});

// Slideshow
jQuery(document).ready(function() {
	jQuery('.gk-slideshow').each(function(i, slideshow) {
		slideshow = jQuery(slideshow);
		var interval = parseInt(slideshow.attr('data-interval'), 10);
		var autoanimation = interval === 0;
		var current = 0;
		var prev = slideshow.find('.gk-slideshow-prev');
		var next = slideshow.find('.gk-slideshow-next');
		var counter = slideshow.find('.gk-slideshow-counter');
		var title = slideshow.find('.gk-slideshow-title');
		var slides = slideshow.find('.gk-slideshow-img');
		
		prev.click(function(e) {
			e.preventDefault();
			current = (current === 0) ? slides.length - 1 : current - 1;			
			slides.removeClass('gk-active');
			slides[current].addClass('gk-active');
			title.text(jQuery(slides[current]).attr('data-title'));
			counter.text((current + 1) + ' / ' + counter.attr('data-max'));
		});
		
		next.click(function(e) {
			e.preventDefault();
			current = (current === slides.length - 1) ? 0 : current + 1;			
			slides.removeClass('gk-active');
			slides[current].addClass('gk-active');
			title.text(jQuery(slides[current]).attr('data-title'));
			counter.text((current + 1) + ' / ' + counter.attr('data-max'));
		});
		
		if(interval > 0) {
			gkSlideshowAutoAnim(interval, next);
		}
	});
	
	function gkSlideshowAutoAnim(interval, next) {
		setTimeout(function() {
			next.trigger('click');
			gkSlideshowAutoAnim(interval, next);
		}, interval);
	}
});

// Page preloader
var ignore_onbeforeunload = false;
var preloader_state = true;

jQuery(document).ready(function() {
	if(jQuery(document.body).hasClass('preloader-disabled')) {
 		preloader_state = false;
 	}

	jQuery('a').on('click',function(){
		if(jQuery(this).attr('href').substr(0,7) === 'mailto:') {
	    	ignore_onbeforeunload = true;
	    } else {
	    	ignore_onbeforeunload = false;
	    }
	});
});

jQuery(window).load(function() {
	if(preloader_state && jQuery('#gk-page-preloader').length > 0) {
		var preloader = jQuery('#gk-page-preloader');
		setTimeout(function() {
			preloader.addClass('gk-to-hide');
			
			setTimeout(function() {
				preloader.addClass('gk-hidden');
			}, 500);
		}, 500);
	}
});

jQuery(window).on('beforeunload', function() {
	if(preloader_state && !ignore_onbeforeunload && jQuery('#gk-page-preloader').length > 0) {
		var preloader = jQuery('#gk-page-preloader');
		preloader.removeClass('gk-hidden');
		
		setTimeout(function() {
			preloader.removeClass('gk-to-hide');
		}, 25);
	}
});
