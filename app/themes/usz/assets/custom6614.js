(function ($) {
	"use strict";

	function removeUrlParameter(url, parameter) {
		var urlParts = url.split('?');

		if (urlParts.length >= 2) {
			// Get first part, and remove from array
			var urlBase = urlParts.shift();

			// Join it back up
			var queryString = urlParts.join('?');

			var prefix = encodeURIComponent(parameter) + '=';
			var parts = queryString.split(/[&;]/g);

			// Reverse iteration as may be destructive
			for (var i = parts.length; i-- > 0; ) {
				// Idiom for string.startsWith
				if (parts[i].lastIndexOf(prefix, 0) !== -1) {
					parts.splice(i, 1);
				}
			}

			url = urlBase + '?' + parts.join('&');
		}

		return url;
	}

	function updateQueryStringParameter(uri, key, value) {
		var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		if (uri.match(re)) {
			return uri.replace(re, '$1' + key + "=" + value + '$2');
		}
		else {
			return uri + separator + key + "=" + value;
		}
	}

	function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if(pair[0] == variable){return pair[1];}
		}
		return(false);
	}

	var scroll = getQueryVariable( 'scroll' );
	if( scroll ) {
		var target = $('#' + scroll );
		if( target.length ) {
			$('html, body').animate( { scrollTop: target.position().top }, 0 );
		}
		var url = removeUrlParameter( "" + window.location, 'scroll' );
		window.history.replaceState({}, null, url );
	}

	$(document).ready(function() {
		var filtersToOpen = $('.filter.desktop-open-filters');

		if( filtersToOpen.length ) {
			if( false === getQueryVariable('extra_filters') && $(window).width() >= 1024) {
				filtersToOpen.find('.filter-toggle').addClass('filter-toggle--active');
				filtersToOpen.find('.filter-section').addClass('filter-section--active');
				$('#extra-filters-display').val(1);
				$('.paging a').each( function() {
					var href = $(this).attr('href');
					href = updateQueryStringParameter( href, 'extra_filters', 1 );
					$(this).attr('href',href);
				} );
			}
		}

		$('.live-search input').keyup( function() {
			var query = $(this).val();
			var lang = $('html').attr('lang');
			if ( query.length < 3 ) {
				return;
			}

			$.get('/live-search/', { query: query, lang: lang }, function (response) {
				window.search.setResults(response);
			}, 'json' );
		} );
		$('.filter-toggle__button, .tag-list__button, .input--dropdown .dropdown__close').click( function(e) {
		 	e.preventDefault();
		} );

		$('.filter__container form button, form.dp-listing-form button').click( function() {
			var field = $(this).data('field');
			if( field ) {
				$('#' + field ).val( $(this).data('value') );
			}
		} );

		$('.filter-toggle .filter-toggle__button').click( function() {
			var val = $(this).parent('.filter-toggle').hasClass('filter-toggle--active') ? 1 : 0;
			$('#extra-filters-display').val(val);
			$('.paging a').each( function() {
				var href = $(this).attr('href');
				href = updateQueryStringParameter( href, 'extra_filters', val );
				$(this).attr('href',href);
			} );
		} );

		$('.filter__container form input[type="radio"]').change( function() {
			if( $(this).parents('#events-groups').length && $(this).val() !== 'specialists' ) {
				$('#filter-search__field-subgroup').val('');
				var credits = $('#credits-input input');
				credits.removeAttr('checked');
			}
			$(this).parents('form').submit();
		} );

		var search_input = $('.filter__container .input--search input');
		if ( search_input.length > 0 ) {
			var initial_value = search_input.val();
			if ( initial_value === '' ) {
				var form = search_input.parents( 'form' );
				var submit_callback = function(e) {
					if ( search_input.val() == initial_value ) {
						return;
					}
					e.preventDefault();
					$('input[type="hidden"], input[type="radio"]', form).not('input[name="extra_filters"]').val('');
					form.off( 'submit', submit_callback );
					form.submit();
				}
				form.on( 'submit', submit_callback);
			}
		}

		if( $('#module-iframe').length ) {
			window.addEventListener("message", function (event) {
				var data = event.data.split("->");
				if (data[0] == 'module-iframe-resize') {
					document.getElementById('module-iframe').setAttribute("height", data[1]);
				}
			}, false);
		}
	} );
}(jQuery));