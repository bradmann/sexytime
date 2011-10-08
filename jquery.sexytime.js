(function($){
	var methods = {
		init: function(options){
			if (options) {
				$.extend(settings, options);
			}
			
			var date = methods.parseDate($(this).html());
			if (date === null) {
				$(this).attr('data-sexytime', "parse_error");
			} else {
				$(this).attr('data-sexytime', date.getTime());
			}
		},
		update: function() {
			$(selector).each(function(){
				if (!$(this).attr('data-sexytime')) {
					var date = methods.parseDate($(this).html());
					if (date === null) {
						$(this).attr('data-sexytime', "parse_error");
					} else {
						$(this).attr('data-sexytime', date.getTime());
					}
				}
				if ($(this).attr('data-sexytime') !== "parse_error") {
					var time = parseInt($(this).attr('data-sexytime'), 10);
					$(this).html(methods.sexify(new Date(time)));
				}
			});
		},
		parseDate: function(dateString) {
			var year = parseInt(dateString.substr(yearPos, 4), 10);
			var month = parseInt(dateString.substr(monthPos, 2), 10);
			var day = parseInt(dateString.substr(dayPos, 2), 10);
			var hour = parseInt(dateString.substr(hourPos, 2), 10);
			var minute = parseInt(dateString.substr(minPos, 2), 10);
			var second = parseInt(dateString.substr(secPos, 2), 10);
			if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
				return null;
			}
			return new Date(year, month - 1, day, hour, minute, second);
		},
		sexify: function(time) {
			 var compareTime = time.getTime();
			 var currentTime = (new Date()).getTime();
			 var timeDiff = currentTime - compareTime;
			 var timeArray;
			 var period;
			 if (timeDiff > 0) {
				 period = settings.grammar.past;
				 timeArray = pastArray;
			 } else {
				 period = settings.grammar.future;
				 timeArray = futureArray;
				 timeDiff = Math.abs(timeDiff);
			 }
			 for (var i=0; i<timeArray.length; ++i) {
				 if (timeDiff < timeArray[i]) {
					 break;
				 }
			 }
			 i--;
			 return methods.speak(time, timeDiff, period[String(timeArray[i])]);
		},
		speak: function(time, timeDiff, str) {
			var hour = time.getHours()%12;
			return str
			.replace('%mmm', settings.fullMonths[time.getMonth()])
			.replace('%mm', settings.shortMonths[time.getMonth()])
			.replace('%m', time.getMonth() + 1)
			.replace('%ddd', settings.fullDays[time.getDay()])
			.replace('%dd', settings.shortDays[time.getDay()])
			.replace('%d', time.getDate())
			.replace('%y', time.getFullYear())
			.replace('%h', time.getHours())
			.replace('%H', hour ? hour : 12 )
			.replace('%p', Math.floor(time.getHours()/12) ? settings.grammar.am : settings.grammar.pm)
			.replace('%M', time.getMinutes())
			.replace('%rM', Math.floor(timeDiff/one_minute))
			.replace('%rh', Math.floor(timeDiff/one_hour))
			.replace('%rd', Math.floor(timeDiff/one_day))
			.replace('%rw', Math.floor(timeDiff/one_week))
			.replace('%rm', Math.floor(timeDiff/one_month))
			.replace('%ry', Math.floor(timeDiff/one_year));
		}
	};
	
	var settings = {
		'frequency': 1000,
		'format': 'YYYY-mm-ddThh:MM:ss',
		'grammar': {
			'past': {
				'0': 'Just now',
				'3000': 'Three seconds ago',
				'10000': 'Less than a minute ago',
				'60000': '1 minute ago',
				'120000' : '%rM minutes ago',
				'3600000': 'An hour ago',
				'7200000': '%rh hours ago',
				'86400000': 'Yesterday at %H:%M%p',
				'172800000': '%rd days ago',
				'604800000': 'Last week',
				'1209600000': '%rw weeks ago',
				'2592000000': 'Last month',
				'5184000000': '%rm months ago',
				'31536000000': '%mmm %d %y'
			},
			'future': {
				'0': 'Less than a minute from now',
				'60000': '1 minute from now',
				'120000': '%rM minutes from now',
				'3600000': 'An hour from now',
				'7200000': '%rh hours from now',
				'86400000': 'Tomorrow at %H:%M%p',
				'172800000': '%rd days from now',
				'604800000': 'Next week',
				'1209600000': '%rw weeks from now',
				'2592000000': 'Next month',
				'5184000000': '%rm months from now',
				'31536000000': '%mmm %d %y'
			},
			'am': 'am',
			'pm': 'pm'
		},
		'fullMonths': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		'fullDays': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	};
	
	var timer;
	var self;
	var selector;
	var pastArray = [];
	var futureArray = [];
	var one_second = 1000;
	var one_minute = 60 * one_second;
	var one_hour = 60 * one_minute;
	var one_day = 24 * one_hour;
	var one_week = 7 * one_day;
	var one_month = 30 * one_day;
	var one_year = 365.25 * one_day;
	var yearPos;
	var monthPos;
	var dayPos;
	var hourPos;
	var minPos;
	var secPos;
	var msPos;

	$.fn.sexytime = function(method) {
		self = this;
		selector = this.selector;
		var t;
		if (methods[method]) {
			return this.each(function(){
				return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			});
		} else if (typeof method === 'object' || !method) {
			var format = settings.format;
			yearPos = format.indexOf('YYYY');
			monthPos = format.indexOf('mm');
			dayPos = format.indexOf('dd');
			hourPos = format.indexOf('hh');
			minPos = format.indexOf('MM');
			secPos = format.indexOf('ss');
			msPos = (t = format.indexOf('SSS')) == -1 ? 0 : t;

			this.each(function(){
				methods.init.apply(this, arguments);
			});
			for (var key in settings.grammar.past) {
				pastArray.push(parseInt(key, 10));
			}
			for (var key in settings.grammar.future) {
				futureArray.push(parseInt(key, 10));
			}
			pastArray.sort(function(a,b){ return a-b; });
			futureArray.sort(function(a,b){ return a-b; });

			methods.update.apply(this, arguments);
			timer = setInterval(methods.update, settings.frequency);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.sexytime');
		}
		return this;
	};
})(jQuery);