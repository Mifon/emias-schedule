'use strict';

angular.module('root').controller('DatepickerCtrl', function ($scope, $rootScope, dataService) {
	let dpicker = this;

	dpicker.dateOptions = {
		formatYear: 'yyyy',
		startingDay: 1,
		showWeeks: false
	};
	dpicker.status = {
		opened: false
	};
	dpicker.format = 'dd.MM.yyyy';
	dpicker.minDate = dpicker.minDate ? null : new Date();
	dpicker.maxDate = new Date(new Date().getTime()+(1000*60*60*24*365)); // доступные даты в календаре на год вперед
	dpicker.btnDisabled = 'disabled';
	dpicker.btnDisabledTitle = 'Выберите доступный ресурс';
	dpicker.selectedDate = '';
	dpicker.dt = '';
	dpicker.options = '';

	dpicker.select = function(str){
		let option = dataService.get('listOption');
		option.date = dpicker.dt;
		if (str != 'change') {
			dpicker.selectedDate = dpicker.dt;
			$('.b-date ul.dropdown-menu').remove();
		}
		dataService.set('listOption', option);
		$rootScope.$broadcast('renderSchedule');
	}
	dpicker.dateReset = function() {
		let option  = dataService.get('listOption');
		dpicker.dt  = dpicker.selectedDate;
		option.date = dpicker.selectedDate;
		$('.b-date ul.dropdown-menu').remove();
		dataService.set('listOption', option);
		$rootScope.$broadcast('renderSchedule');
	}

	dpicker.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 ) );
	};

	dpicker.open = function($event) {
		if (dpicker.btnDisabled != '') {
			return false;
		}
		dpicker.selectedDate = dpicker.dt;
		dpicker.status.opened = true;
		setTimeout(function(){
			let btnCancel = $('<button type="button" class="btn btn-sm btn-default btn-dpicker">Отменить</button>');
			let btnDone = $('<button type="button" class="btn btn-sm btn-success btn-dpicker">Ок</button>');
			let block = $('.b-date ul.dropdown-menu .btn-group').parent();

			btnCancel.click(dpicker.dateReset);
			btnDone.click(dpicker.select);

			$(block).css('text-align', 'right');
			$(block).html('').append(btnCancel).append(btnDone);

			$('.b-date .js-date-disabled button').attr('disabled', 'disabled');
		});
	};

	dpicker.dayClass = function(date, mode) {
		let timeDate = date.getTime();
		let now      = new Date().getTime();
		let strClass = 'b-date__select';

		// на две неделе вперед
		if (changeWorkWeekDay(date) && (timeDate < (now + (1000*60*60*24*14)))) {
			strClass += ' b-date__select-work';
		}

		// if (changeWorkWeekDay(date) && (timeDate > (now + (1000*60*60*24*14)) || timeDate < (now - (1000*60*60*24))) {
			// strClass += ' disabled js-date-disabled';
		if (timeDate < (now - (1000*60*60*24)) || timeDate > (now + (1000*60*60*24*14))) {
			strClass += ' disabled js-date-disabled';
		} else if (date.getDay() === 0) {
			strClass += ' disabled-day-off';
		} else {
			strClass += ' js-date-select';
		}
		return strClass;
	}

	function changeWorkWeekDay(day) {
		let todayWeekDay = day.getDay()==0 ? 7 : day.getDay();
		for (var key in dpicker.options.listDr) {
			let specialist = dpicker.options.listDr[key];
			if (specialist.listWorkWeekDay && specialist.listWorkWeekDay.indexOf(todayWeekDay) >= 0) {
				return true;
			}
		}
	}

	// обновление дата пикера и вызов из радительского контроллера
	$scope.$on('updateDatepicker', function(){
		let options = dataService.get('listOption');
		dpicker.options = options;
		if (options.listDr && options.listDr.length > 0) {
			dpicker.btnDisabled = '';
			dpicker.btnDisabledTitle = '';
			dpicker.dt = (dpicker.dt == '' ? new Date() : dpicker.dt);
		} else {
			dpicker.btnDisabled = 'disabled';
			dpicker.btnDisabledTitle = 'Выберите доступный ресурс';
			dpicker.dt = '';
		}
		dpicker.select();
	});
});