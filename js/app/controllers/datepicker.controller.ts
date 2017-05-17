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
	dpicker.maxDate = new Date(2020, 5, 22);
	dpicker.btnDisabled = 'disabled';
	dpicker.btnDisabledTitle = 'Выберите доступный ресурс';
	dpicker.selectedDate = '';
	dpicker.dt = '';

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
		let option = dataService.get('listOption');
		dpicker.dt = dpicker.selectedDate;
		option.date = dpicker.selectedDate;
		$('.b-date ul.dropdown-menu').remove();
		dataService.set('listOption', option);
		$rootScope.$broadcast('renderSchedule');
	}

	dpicker.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
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
		if (timeDate > (now + (1000*60*60*24*14)) || timeDate < (now - (1000*60*60*24))) {
			strClass += ' disabled js-date-disabled';
		} else if (date.getDay() === 0 || date.getDay() === 6) {
			strClass += ' disabled-day-off';
		} else {
			strClass += ' js-date-select';
		}
		return strClass;
	}

	$scope.$on('updateDatepicker', function(){
		let options = dataService.get('listOption');
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