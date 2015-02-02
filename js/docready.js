$(document).ready(function() {

	//Enables sparkle effects; temporarily disabled due to performance issues (switch to canvas?)
	//$('body').sparkle();

	//If the user's browser isn't Chrome or Firefox, show an alert
	$.browser.chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
	if ($.browser.chrome || $.browser.mozilla) {
		$('#alert').hide();
	}

	//The OK button to dismiss the browser alert
	$('#OK').click(function() {
		$('#alert').fadeOut(1500);
	});

	//Change the cursor to the Hearthstone versions
	$(document).mousedown(function(e) {
		if ($(e.target).is('#pack')) {
			$('#wrapper').css('cursor', 'url("img/grab.png"), auto');
		} else { //This doesn't work in Chrome/WebKit, changes only occur on mouse movement
			$('#wrapper').css('cursor', 'url("img/click.png"), auto');
		}
	}).mouseup(function() {
		$('#wrapper').css('cursor', 'url("img/cursor.png"), auto');
	});

	//Make the pack shakeable (technically, its wrapper)
	$('#pack_wrap').jrumble();

	//Begin passively shaking the pack every 10 seconds (looped)
	var startShake = setTimeout(function() {
		shake();
		shakeLoop = setInterval('shakePack()', 10000);
	}, 10000);

	//Menu manipulation
	$(document).click(function(e) {

		//When clicking the friend menu button...
		if ($(e.target).is('#friend_button')) {

			//If the friend list is visible, hide it; otherwise, show it
			if ($('#friend_list').is(':visible')) {
				$('#friend_list').hide();
			} else {
				$('#friend_list').show();
			}
			var menu_open = new Audio();
			menu_open.src = allAudio['menu_open'];
			menu_open.volume = volume;
			menu_open.play();

			//When clicking the shop menu button...
		} else if ($(e.target).is('#shop_button')) {

			//Hide the stats panel, show the shop, blur the background, and play a noise
			$('#stats_panel').hide();
			$('#donation').fadeIn(500);
			$('#bg_blur').fadeIn(500);
			var shop_open = new Audio();

			//Ternary to determine if the browser can play .ogg files; falls back to .mp3
			shop_open.src = allAudio['shop_open'];
			shop_open.volume = volume;
			shop_open.play();

			//When clicking the stats menu button...
		} else if ($(e.target).is('#stats_button')) {

			//If the stats panel is visible, hide it; otherwise, show it
			if ($('#stats_panel').is(':visible')) {
				$('#stats_panel').hide();
			} else {
				$('#stats_panel').show();
			}
			var menu_open = new Audio();
			menu_open.src = allAudio['menu_open'];
			menu_open.volume = volume;
			menu_open.play();

		} else {

			//If the donation popup is visible and the user clicks outside of it...
			if ($('#donation').is(':visible') && !$(e.target).is('#donation')) {

				//Hide it and deblur the background
				$('#donation').hide();
				$('#bg_blur').fadeOut(500);
				var shop_close = new Audio();
				shop_close.src = allAudio['shop_close'];
				shop_close.volume = volume;
				shop_close.play();

			}

			//If the stats panel is visible and the background isn't blurry...
			if ($('#stats_panel').is(':visible') && !$('#bg_blur').is(":visible")) {

				//And the user isn't clicking anywhere inside the stats panel or on packs...
				if (!$(e.target).is('#stats_panel') && !$(e.target).is('#damn_lies') && !$(e.target).is('#pack')) {

					//Hide it
					$('#stats_panel').hide();

				}
			}

			//Hide the friend list any time the user clicks outside it
			if (!$(e.target).is('#friend_list')) {
				$('#friend_list').hide();
			}

		}
	});

	//Various other interactive elements
	$('#friend_button').mouseenter(function() {
		var menu_button_hover = new Audio();
		menu_button_hover.src = allAudio['menu_button_hover'];
		menu_button_hover.volume = volume;
		menu_button_hover.play();
	});

	$('#mancer').mouseenter(function() {
		$('#mancer_tooltip').show();
	}).mouseleave(function() {
		$('#mancer_tooltip').hide();
	});

	$('#shop_button').mouseenter(function() {
		var shop_button_hover = new Audio();
		shop_button_hover.src = allAudio['shop_button_hover'];
		shop_button_hover.volume = volume;
		shop_button_hover.play();
	});


	//Next code audit, set vars like this for all frequented elements
	var slider = $('#slider'),
		tooltip = $('.tooltip');

	//Create the volume slider
	slider.slider({
		range: "min",
		min: 0,
		max: 100,
		value: 50,

		//Show tooltip when user begins sliding
		start: function(event,ui) {
		    tooltip.fadeIn('fast');
		},

		//When the slider is sliding
		slide: function(event, ui) {
			var value  = slider.slider('value'),
				speaker = $('.speaker');

			//Set the global volume
			volume = ui.value / 100;

			//Adjust the tooltip's value (and its display) accordingly
			tooltip.css('left', value).text(ui.value + '%');  

			//Swap the background position of the speaker icon's sprite
			if (value <= 5) {
				speaker.css('background-position', '0 0');
			} 
			else if (value <= 25) {
				speaker.css('background-position', '0 -40px');
			} 
			else if (value <= 75) {
				speaker.css('background-position', '0 -80px');
			} 
			else {
				speaker.css('background-position', '0 -120px');
			};
		},

		//Fade out the tooltip
		stop: function(event,ui) {
		    tooltip.fadeOut('fast');
		},

	});

	$('#back_button').mouseenter(function() {
		var menu_button_hover = new Audio();
		menu_button_hover.src = allAudio['menu_button_hover'];
		menu_button_hover.volume = volume;
		menu_button_hover.play();
	});

	$('#gold').mouseenter(function() {
		$('#gold_tooltip').show();
	}).mouseleave(function() {
		$('#gold_tooltip').hide();
	});

	$('#stats_button').mouseenter(function() {
		var menu_button_hover = new Audio();
		menu_button_hover.src = allAudio['menu_button_hover'];
		menu_button_hover.volume = volume;
		menu_button_hover.play();
		$('#stats_tooltip').show();
	}).mouseleave(function() {
		$('#stats_tooltip').hide();
	});

	//Make the pack draggable
	$('#pack').draggable({
		containment: "#wrapper",
		scroll: false,
		revert: true,
		start: function() {
			if (!packDropped) {

				$('#pack').data('draggable', true)

				//Clear the initial timer for passive shaking
				clearTimeout(startShake);

				//When dragging begins, change pack perspective
				$(this).css('transform', 'scale(1.05) perspective(300px) rotateY(10deg)');

				//Prevents the pack from being dragged behind other hover elements
				$('#pack_wrap').css('z-index', '6');

				//Fade out non-glowing BG to reveal glowing one beneath
				$('#bg').stop(true).fadeOut(1000);
			}
		},
		stop: function() {
			if (!packDropped) {

				//When dragging ceases, return the pack to its original size and location
				$(this).css({
					'left': '200px',
					'top': '247px',
					'transform': 'perspective(0) rotateY(0) scale(1)'
				});

				//Places other hoverable elements back on top
				$('#pack_wrap').css('z-index', '2');

				//Display infinity symbol over the pack again <- Deprecated?
				//$('#infi').css('z-index', '3');

				//Plays the pack 'release' sound
				var pack_release = new Audio();
				pack_release.src = allAudio['pack_release'];
				pack_release.volume = volume;
				pack_release.play();

				//Fades in the non-glowing background
				$('#bg').stop(true).fadeIn(500);

				//Enables pack shaking again
				clearInterval(shakeLoop);
				shakeLoop = setInterval('shakePack()', 10000);

			}
		}
	});

	$('#pack').mousedown(function() {
		if (!packDropped) {

			//Play pack grab noise
			var pack_grab = new Audio();
			pack_grab.src = allAudio['pack_grab'];
			pack_grab.volume = volume;
			pack_grab.play();

			//Make pack slightly larger to denote it's grabbed
			$(this).css('transform', 'scale(1.05)');

			//Drop infinity symbol behind the pack <- Deprecated?
			//$('#infi').css('z-index', '1');

			//Disable pack shaking
			$('#pack_wrap').trigger('stopRumble');
			clearTimeout(startShake);
			clearInterval(shakeLoop);

		}
	}).mouseup(function() {

		//If the pack's position is its original location, play the pack release sound
		var spot = $(this).position();
		if (Math.round(spot.left) == 192 && Math.round(spot.top) == 241) {
			var pack_release = new Audio();
			pack_release.src = allAudio['pack_release'];
			pack_release.volume = volume;
			pack_release.play();
		}

		//Return the pack to its original size and perspective
		$(this).css('transform', 'perspective(0) rotateY(0) scale(1)');

		//Place infinity symbol back over the packs <- Deprecated?
		//$('#infi').css('z-index', '3');

		//Enable pack shaking
		clearInterval(shakeLoop);
		shakeLoop = setInterval('shakePack()', 10000);

	});

	//Makes the hole droppable for elements
	$('#pack_hole').droppable({
		tolerance: "touch", // Makes the hole much more inviting, mmm...
		drop: function(e, ui) {
			packDrop();
		}
	});

	//Keybinding function so pressing 'spacebar' sends a pack to the hole
	$(window).keydown(function(e) {

		//If the site is loaded and the user isn't already opening a pack...
		if (siteLoaded && !packDropped) {

			//And the space key is pressed...
			if ((e.keyCode || e.which) == 32) {

				//Disable pack dragging so as to prevent the pack from being dragged out of the hole
				//$("#pack").draggable("option", "disabled", true);
				$("#pack").draggable("disable");

				//Fade out non-glowing BG to reveal glowing one beneath
				$('#bg').stop(true).fadeOut(1000);

				//Trigger the 'pack-is-in-its-hole' function
				packDrop();

			}
		}
	});

	//Prevents user's Spacebar from scrolling down the page if the window height is too small
	window.onkeydown = function(e) { 
	  return !(e.keyCode == 32);
	};	

	//Gets the video ID element
	var burst = document.getElementById('pack_burst');

	//Flag for checking whether a pack has been dropped in its hole (i.e. being opened), then the function to do it
	var packDropped = false;
	function packDrop() {

		//If a pack isn't being opened...
		if (!packDropped) {

			//Set a flag that we're opening one now
			packDropped = true;

			//Disable pack shaking
			clearTimeout(startShake);
			clearInterval(shakeLoop);

			//Move the pack to the hole
			$('#pack').css({
				'left': '707px',
				'top': '260px',
				'transform': 'perspective(0) rotateY(0)'
			});

			$('#pack_burst').css('z-index', '5');
			burst.volume = volume / 2;
			burst.play();

			//Fade out the pack...
			$('#pack').fadeOut(0, function() {

				//And return it to its original position on the stack, still hidden
				$(this).css({
					'left': '200px',
					'top': '247px',
					'transform': 'perspective(0) rotateY(0)'
				});

				//Blur the background
				$('#bg_blur').fadeIn(0);
				$('.container').fadeIn(0, function() {
					$('.card').fadeIn(0);
				});
				$('#pack_burst').delay(3250).fadeOut(1000);
		
			});

			//Returns hover elements to their proper level for interaction, possibly deprecated
			$('#pack_wrap').css('z-index', '2');

		}
	};

	//Done button
	var done = false;
	$('#done').mousedown(function() {

		//Flag for ensuring it can only be clicked once
		if (!done) {
			done = true;

			//Play the fade out noise
			var done_fade = new Audio();
			done_fade.src = allAudio['done_fade'];
			done_fade.volume = volume;
			done_fade.play();

			//Fade out the button, even if it's in the middle of fading in
			$('#done').stop(true, true).fadeOut(1000);

			/* White, hot, gooey fade... (gross)
	            $('<div class="done_fade"><div>').appendTo('.card');
	            $('.done_fade').fadeIn(1750);
            */

        	//Fade out the cards
			$('.card').fadeOut(1000, function() {
				$(this).css('transform', 'scale(1)');
				$('div.card_back', this).css({
					'transform': 'perspective(1000px) rotateY(0deg)'
					//'-webkit-filter': 'drop-shadow(0 0 0 white)'
				});
				$('div.card_front', this).css({
					'transform': 'perspective(1000px) rotateY(180deg)'
					//'-webkit-filter': 'drop-shadow(0 0 3px white)'
				});
			});

			//Fade out the blur layer, make packs draggable again, fade the pack in, clear variables, and start over
			$('#bg').show(function() {
				burst.pause();
				burst.currentTime = 0;
				$('#pack_burst').css('z-index', '0').show();
				$('#bg_blur').fadeOut(1000);
				$('#pack').draggable("enable").fadeIn(1000, function() {
					buildCardArrays();
					packDropped = false;
					clearInterval(shakeLoop);
					shakeLoop = setInterval('shakePack()', 10000);
				});
			});
		}

		//Unset the flag preventing additional clicks
		setTimeout(function() {
			done = false;
		}, 1000);
	});

	//Initiate the whole she-bang
	buildCardArrays();

});