// class to hold card data
function CardData(name, rarity)
{
	this.name = name;
	this.rarity = rarity;
}

// holds an array of total cards in set
var total_cards_in_set = [];

var allcommons = false;
var allrares = false;
var allepics = false;
var all_legendaries = false;


//Global variable for volume control; default: 50%
var volume = 0.5;
//var json_card_set = "Goblins vs Gnomes.enUS.json";
//json_card_set = "Classic.enUS.json";
var image_prefix = "http:\/\/wow.zamimg.com\/images\/hearthstone\/cards\/enus\/medium\/";
var image_postfix = ".png";

//Tracks total time spent on the page
var totalSeconds = 0;
var timer;
window.onload = function() {
  timer = setInterval(function() { 
  	totalSeconds++;
  	//Updates stats panel every 5 seconds
  	if (totalSeconds % 5 == 0) {
  		tallyStats();
  	}
  }, 1000);
};

// Gets the number of rarities remaining in the set
function getNumRarity(rarity)
{
	var rarities = 0;
	for(var x=0; x<total_cards_in_set.length; x++)
	{
		if(total_cards_in_set[x].rarity == rarity)
		{
			rarities++;
		}
	}

	return rarities;
}
//Parses totalSeconds into a readable format
function getTime() {
	var hours = parseInt(totalSeconds / 3600) % 24,
		minutes = parseInt(totalSeconds / 60) % 60,
		seconds = totalSeconds % 60,
		result = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
	return result;
}

//When invoked, shakes the pack (technically, its wrapper) for .75s
var shakeLoop = null;
var shakePack = function(method) {
	shakeSound();
	$('#pack_wrap').trigger('startRumble');
	setTimeout(function() {
		$('#pack_wrap').trigger('stopRumble');
	}, 750);
};

//When invoked, plays the pack shaking noise
var shakeSound = function() {
	var pack_shake = new Audio();
	pack_shake.src = allAudio['pack_shake'];
	pack_shake.volume = volume;
	pack_shake.play();
};

//Function for getting a random number between 'min' and 'max'
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

//Function for randomizing the order of items in an array
function shuffle(o) {
	for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

//Function to roll for card quality in a pack; guarantees at least one roll above 75 (rare's threshold)
function getCardDistribution() {

	//Initialize rolls array and set a flag for 'special' (rare or better) cards
	var rolls = [],
		special;

	//Loop to get 5 random integers between 1 and 100
	for (var i = 0; i < 5; i++) {
		rolls[i] = getRandomInt(1, 100);
		if (rolls[i] > 74) {
			special = true;
		}

		// Kludge to guarantee a rare that is also outside the range of epic or legendary
		if (i == 4 && !special) {
			rolls[i] += 100;
		}
	}

	//Randomizes the roll order so the fifth card isn't usually the best
	return shuffle(rolls);
};

//Initialize the card arrays
var common = [],
	rare = [],
	epic = [],
	legendary = [];

// Initialize the name of the card in they arrays
var common_name = [],
	rare_name = [],
	epic_name = [],
	legendary_name = [];

function buildCardArrays() {

	//Get five new card rolls
	var rolls = getCardDistribution();

	//If the card arrays aren't already filled...
	if (!common.length) {

		//Do an AJAX call to fill them					
		$.ajax({
			url: json_card_set,
			dataType: 'text',
			success: function(data) {
				var json = $.parseJSON(data);
				$.each(json, function(i, cards) {

					//Ensure only expert cards from packs are added to each array
					if (cards.collectible == true) {
						if (cards.rarity == 'Common') {
							common.push(image_prefix + cards.id + image_postfix);
							common_name.push(cards.name);

							for(var x=0; x<2; x++)
							{
								total_cards_in_set.push(new CardData(cards.name, cards.rarity));
							}

							//alert(image_prefix + cards.id);
						}
						else if (cards.rarity == 'Rare') {
							rare.push(image_prefix + cards.id + image_postfix);
							rare_name.push(cards.name);

							for(var x=0; x<2; x++)
							{
								total_cards_in_set.push(new CardData(cards.name, cards.rarity));
							}							
						}
						else if (cards.rarity == 'Epic') {
							epic.push(image_prefix + cards.id + image_postfix);
							epic_name.push(cards.name);

							for(var x=0; x<2; x++)
							{
								total_cards_in_set.push(new CardData(cards.name, cards.rarity));
							}							
						}
						else if (cards.rarity == 'Legendary') {
							legendary.push(image_prefix + cards.id + image_postfix);
							legendary_name.push(cards.name);
							total_cards_in_set.push(new CardData(cards.name, cards.rarity));
						}
					}

				});

				//Pass all this data to getCards which will determine quality and build the image URLs
				getCards(rolls, common, rare, epic, legendary)
			}
		});

		//Otherwise, just proceed to getCards with the new rolls
	} else {
		getCards(rolls, common, rare, epic, legendary)
	}
};

//Function to do a string replacement on a portion of the image URL to show a golden card instead
String.prototype.goldenUpgrade = function(find, replace) {
	var replaceString = this;
	for (var i = 0; i < find.length; i++) {
		replaceString = replaceString.replace(find[i], replace[i]);
	}
	return replaceString;
};

//Function to determine the cards themselves and whether they are gold
function getCards(rolls, common, rare, epic, legendary) {
	var normal = ['/medium/', '.png'],
		golden = ['/animated/', '_premium.gif'],
		quality = [],
		cards = [];

	//Loop through all five card rolls
	for (i = 0; i < rolls.length; i++) {
		var tempCard;

		//If the card's roll is in the range of 1-74 (74% chance), it's a common
		if (rolls[i] < 75) {

			//Get the appropriate image URL from the common array
			var common_index = Math.floor(Math.random() * common.length);
			tempCard =  common[common_index];
			//tempCard = common[Math.floor(Math.random() * common.length)];
			for(var x=0; x<total_cards_in_set.length; x++)
			{
				if(total_cards_in_set[x].name == common_name[common_index])
				{
					total_cards_in_set.splice(x,1);
					break;
				}
			}
			//Do a roll to determine if the common is golden (supposedly 1/50 cards, 1/10 packs, or 2% overall)
			//If you get 3.7 commons per pack, and 10 packs is 37 commons, then 1 out of 37 should be golden (i.e. ~2.7% of commons are golden)
			if (getRandomInt(1, 37) == 37) {
				quality[i] = 'golden_common',
				cards[i] = tempCard.goldenUpgrade(normal, golden);
			} else {
				quality[i] = 'common';
				cards[i] = tempCard;
			}
		}

		//If the card's roll is in the range of 75-95 (21% chance), it's a rare
		//If the card's roll is greater than 100, it's also a rare due to the guarantee
		if ((rolls[i] > 74 && rolls[i] < 96) || rolls[i] > 100) {
			var rare_index = Math.floor(Math.random() * rare.length);
			tempCard = rare[rare_index];
			//tempCard = rare[Math.floor(Math.random() * rare.length)];

			for(var x=0; x<total_cards_in_set.length; x++)
			{
				if(total_cards_in_set[x].name == rare_name[rare_index])
				{
					total_cards_in_set.splice(x,1);
					break;
				}
			}
			//Do a roll to determine if the rare is golden (supposedly 1/100 cards, 1/20 packs, or 1% overall)
			//If you get roughly 1.1 rares per pack, and 20 packs is 22 rares, then 1 out of 22 should be golden (i.e. ~4.55% of rares are golden)
			//But then there's the 'rare guarantee,'' which skews this, so I'm arbitrarily lowering chances by ~25%... sigh...
			if (getRandomInt(1, 28) == 28) {
				quality[i] = 'golden_rare',
				cards[i] = tempCard.goldenUpgrade(normal, golden);
			} else {
				quality[i] = 'rare';
				cards[i] = tempCard;
			}
		}

		//If the card's roll is in the range of 96-99 (4% chance), it's an epic
		if (rolls[i] > 95 && rolls[i] < 100) {
			var epic_index = Math.floor(Math.random() * epic.length);
			tempCard = epic[epic_index];
			//tempCard = epic[Math.floor(Math.random() * epic.length)];

			for(var x=0; x<total_cards_in_set.length; x++)
			{
				if(total_cards_in_set[x].name == epic_name[epic_index])
				{
					total_cards_in_set.splice(x,1);
					break;
				}
			}			

			//Do a roll to determine if the epic is golden (supposedly 1/400 cards, 1/80 packs, or 0.25% overall)
			//If you get roughly 0.2 epics per pack, and 80 packs is 16 epics, then 1/16 should be golden (i.e. ~6.25% of epics are golden)
			if (getRandomInt(1, 16) == 16) {
				quality[i] = 'golden_epic',
				cards[i] = tempCard.goldenUpgrade(normal, golden);
			} else {
				quality[i] = 'epic';
				cards[i] = tempCard;
			}
		}

		//If the card's roll is a perfect 100 (1% chance), it's a legendary
		if (rolls[i] == 100) {
			var legendary_index = Math.floor(Math.random() * legendary.length);
			tempCard = legendary[legendary_index];
			//tempCard = legendary[Math.floor(Math.random() * legendary.length)];

			for(var x=0; x<total_cards_in_set.length; x++)
			{
				if(total_cards_in_set[x].name == legendary_name[legendary_index])
				{
					total_cards_in_set.splice(x,1);
					break;
				}
			}				

			//Do a roll to determine if the legendary is golden (supposedly 1/2000 cards, 1/400 packs, or 0.05% overall)
			//If you get roughly 0.05 legendaries per pack, and 400 packs is 20 legendaries, then 1/20 should be golden (i.e. ~5% of legendaries are golden)
			if (getRandomInt(1, 20) == 20) {
				quality[i] = 'golden_legendary',
				cards[i] = tempCard.goldenUpgrade(normal, golden);
			} else {
				quality[i] = 'legendary';
				cards[i] = tempCard;
			}
		}
	};


	//Send these results to the drawCards function, which will place the respective cards on the DOM
	drawCards(quality, cards);
};

function drawCards(quality, cards) {

	/* Debug: display the cards
		for (i = 0; i < cards.length; i++) {
			$('<img>').attr('src', cards[i]).appendTo('body').css({'position': 'relative', 'z-index': '99'});
		}
	*/

	//For each element with the 'card' class, replace its front-facing image with one of the new URLs
	$('.card').each(function(i) {
		$('div.card_front img', this).attr('src', cards[i]);
	});

	//Now for the fun stuff...
	cardInteraction(quality);

	if(getNumRarity("Common") == 0 && allcommons == false)
	{
		alert("You have collected all Commons");
		allcommons = true;
	}

	if(getNumRarity("Rare") == 0 && allrares == false)
	{
		alert("You have collected all Rares");
		allrares = true;
	}

	if(getNumRarity("Epic") == 0 && allepics == false)
	{
		alert("You have collected all Epics");
		allepics = true;
	}

	if(getNumRarity("Legendary") == 0 && all_legendaries == false)
	{
		alert("You have collected all Legendaries");
		all_legendaries = true;
	}		

};

function cardInteraction(quality) {

	//This variable will count the number of cards that have been clicked/shown each pack
	var cards_shown = 0;

	//For each card...
	$('.card').each(function(i) {

		//Start by clearing this card's flags
		this.turned = false, this.clicked = false;

		//Get this particular card's rarity
		var card_rarity;
		if (quality[i].indexOf('common') != -1)
			card_rarity = 'common';
		if (quality[i].indexOf('rare') != -1)
			card_rarity = 'rare';
		if (quality[i].indexOf('epic') != -1)
			card_rarity = 'epic';
		if (quality[i].indexOf('legendary') != -1)
			card_rarity = 'legendary';

		//When a card is hovered over...
		$(this).unbind('mouseenter').mouseenter(function() {

				//And it hasn't been turned over yet...
				if (!this.turned) {

					//Play the card mouseover sound
					this.card_hover = new Audio();
					this.card_hover.src = allAudio['card_hover'];
					this.card_hover.volume = volume;
					this.card_hover.play();

					//Then determine its rarity and set the background glow to the appropriate color
					var card_color;
					if (card_rarity == 'rare')
						card_color = '#0066ff';
					if (card_rarity == 'epic')
						card_color = '#cc33ff';
					if (card_rarity == 'legendary')
						card_color = '#ff8000';

					//Make it pretty, bitches (slightly enlarge the card and give it a hover glow)
					$(this).css({
						'transform': 'scale(1.15) rotate(0.0001deg)',
						'-webkit-transform': 'scale(1.15) rotate(0.0001deg)',
						'transition': 'transform 300ms',
						'-webkit-transition': '-webkit-transform 300ms'
					});
					$('.card_glow', this).css({
						'box-shadow': '0 0 75px ' + card_color,
						'transition': 'box-shadow 1000ms',
						'-webkit-transition': 'box-shadow 1000ms'
					});

				}

		})

		//When the user stops hovering over a card...
		.unbind('mouseleave').mouseleave(function() {
			if (!this.turned) {

				//Return it to its original size, and turn off the glow
				$(this).css({
					'transform': 'scale(1)',
					'-webkit-transform': 'scale(1)',
					'transition': 'transform 500ms',
					'-webkit-transition': '-webkit-transform 500ms'
				});
				$('.card_glow', this).css({
					'box-shadow': 'none',
					'transition': 'box-shadow 600ms',
					'-webkit-transition': 'box-shadow 600ms'
				});

				//Play a sound which denotes the user stopped hovering
				this.card_unhover = new Audio();
				this.card_unhover.src = allAudio['card_unhover'];
				this.card_unhover.volume = volume / 6;
				this.card_unhover.play();

			}
		})

		//When a card is clicked...
		.unbind('mousedown').mousedown(function(e) {

			/* Some initial particle effect tests...
			    emitter1.emit();
			    var stopEmit1 = setTimeout(function() {
			        emitter1.stopEmit();
			    }, 1000);
			*/

			//Set some flags for the element to prevent subsequent clicks and sound plays
			this.turned = true, this.clicked;
			if (this.turned && !this.clicked) {

				//Flag that the element has been clicked, and increment cards_shown
				this.clicked = true, cards_shown++;

				//Send the card's quality to be tallied for the stats panel
				tallyStats(quality[i]);

				//If all five cards have been revealed...
				if (cards_shown > 4) {
					//Then after a brief delay, show the 'Done' button and play its reveal sound
					setTimeout(function() {
						var done_reveal = new Audio();
						done_reveal.src = allAudio['done_reveal'];
						done_reveal.volume = volume;
						setTimeout(function() {
							$('#done').stop(true).fadeIn(750);
							done_reveal.play();
						}, 500);
					}, 500);
				}

				//Play the appropriate card turn effect for the card's rarity
				var turn_rarity = new Audio();
				turn_rarity.src = allAudio['card_turn_over_'+card_rarity]
				turn_rarity.volume = volume / 8; //These are so damn loud
				setTimeout(function() {
					turn_rarity.play();
				}, 200);

				//Play the appropriate announcer quote for the card's rarity
				var announcer = new Audio();
				if (quality[i] != 'common') {
					announcer.src = allAudio['announcer_'+quality[i]];
					announcer.volume = volume / 4; //These are loud too
					announcer.play();
				}

				//Determine which side of the card the user clicked on
				var cardX = e.pageX - $(this).offset().left;
				if (cardX < 116) {
					//Have it turn from the left
					var backDir = '-180deg',
						frontDir = '0deg';
				} else {
					//Have it turn from the right
					var backDir	= '180deg',
						frontDir = '360deg';
				}

				//Turn the card around
				$('div.card_back', this).css({
					'transform': 'perspective(1000px) rotateY('+backDir+')',
					'-webkit-transform': 'perspective(1000px) rotateY('+backDir+')',
					//'-webkit-filter': 'drop-shadow(0 0 3px white)',
					'transition': 'transform 800ms ease-in-out 300ms',
					'-webkit-transition': '-webkit-transform 800ms ease-in-out 300ms'
					//'-webkit-transition': '-webkit-filter 1667ms 333ms'
				});
				$('div.card_front', this).css({
					'transform': 'perspective(1000px) rotateY('+frontDir+')',
					'-webkit-transform': 'perspective(1000px) rotateY('+frontDir+')',
					//'-webkit-filter': 'drop-shadow(0 0 0 white)',
					'transition': 'transform 800ms ease-in-out 300ms',
					'-webkit-transition': '-webkit-transform 800ms ease-in-out 300ms'
					//'-webkit-transition': '-webkit-filter 333ms 1667ms'
				});
				$('.card_glow', this).css({
					'box-shadow': 'none',
					'transition': 'box-shadow 600ms',
					'-webkit-transition': 'box-shadow 600ms'
				});

			}

		});

	});

};

//Create an object which will store the rarity count of each card
var card_totals = {
	common: 0,
	golden_common: 0,
	rare: 0,
	golden_rare: 0,
	epic: 0,
	golden_epic: 0,
	legendary: 0,
	golden_legendary: 0,
	total_cards: 0,
	total_packs: 0,
	total_dust: 0,
	total_money: 0,
	cards_left: 0
};

//Make the first letter of each word in a string uppercase
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//This whole function is ugly, just ugly
var totalDust = 0,
	totalMoney = 0,
	lastPack = 0;	
function tallyStats(quality) {

	if (quality) {

		//Increment the specific card rarity, total cards, packs, and dust accumulated
		card_totals[quality]++;
		card_totals['total_cards']++;
		card_totals['total_packs'] = Math.ceil(card_totals['total_cards'] / 5);
		card_totals['cards_left'] = total_cards_in_set.length;

		if(total_cards_in_set.length == 0)
		{
			alert("You have collected the whole set")
		}

		if (quality == 'common')
			totalDust += 5;
		if (quality == 'golden_common')
			totalDust += 50;
		if (quality == 'rare')
			totalDust += 20;
		if (quality == 'golden_rare')
			totalDust += 100;
		if (quality == 'epic')
			totalDust += 100;
		if (quality == 'golden_epic')
			totalDust += 400;
		if (quality == 'legendary')
			totalDust += 400;
		if (quality == 'golden_legendary')
			totalDust += 1600;
		card_totals['total_dust'] = totalDust;

		if (card_totals['total_packs'] > lastPack) {
			if (card_totals['total_packs'] < 7)
				totalMoney += 1.495;
			if (card_totals['total_packs'] == 7)
				totalMoney = 9.99;
			if (card_totals['total_packs'] > 7 && card_totals['total_packs'] < 15)
				totalMoney += 1.427;
			if (card_totals['total_packs'] == 15)
				totalMoney = 19.99;
			if (card_totals['total_packs'] > 15 && card_totals['total_packs'] < 40)
				totalMoney += 1.333;
			if (card_totals['total_packs'] == 40)
				totalMoney = 49.99;
			if (card_totals['total_packs'] > 40)
				totalMoney += 1.250;
			card_totals['total_money'] = '$' + totalMoney.toFixed(2);
			lastPack++;
		}

	} else {
		//card_totals['time_spent'] = getTime();
	}

	//Build the HTML to be appended to the stats panel
	var html = '';
	for (var key in card_totals) {
		if (card_totals.hasOwnProperty(key)) {
			var label = toTitleCase(key.replace('golden', 'gold').replace('_', ' '));
			var total = card_totals[key];
			if (total > 0)
				var percent = ' (' + (parseInt(card_totals[key]) / parseInt(card_totals['total_cards']) * 100).toFixed(2) + '%)';
			else
				var percent = ' (0%)';
			html += label + ': <span class="right">' + total + ((key == 'total_cards' || key == 'total_packs' || key == 'total_dust' || key == 'total_money' || key == 'cards_left') ? '' : percent) + '</span><br/>';
		}
	}

	//Send the HTML to the DOM
	$('#damn_lies').html(html);

};