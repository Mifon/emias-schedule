'use strict';

angular.module('root').controller('DatepickerCtrl', function ($scope, dataService) {
	let dpicker = this;

	dpicker.dateOptions = {
		formatYear: 'yyyy',
		startingDay: 1
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

	dpicker.btnDisabled = '';
	dpicker.btnDisabledTitle = '';

	dpicker.select = function(str){
		let option = dataService.get('listOption');
		option.date = dpicker.dt;
		if (str != 'change') {
			dpicker.selectedDate = dpicker.dt;
			$('.b-date ul.dropdown-menu').remove();
		}
		dataService.set('listOption', option);
	}
	dpicker.dateReset = function() {
		let option = dataService.get('listOption');
		dpicker.dt = dpicker.selectedDate;
		option.date = dpicker.selectedDate;
		$('.b-date ul.dropdown-menu').remove();
		dataService.set('listOption', option);
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
		if (timeDate > (new Date().getTime() + (60000*60*24*14))) {
			return 'js-date-disabled';
		}
		return 'js-date-select';
	}


	$('body').delegate('.js-date-select', 'click', function(){
		dpicker.select();
	})
});