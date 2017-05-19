'use strict';

angular
	.module('root')
	.controller('DpickerController', function DpickerController($scope, $rootScope, DataService) {
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
		dpicker.btnDisabled = 'disabled';
		dpicker.btnDisabledTitle = 'Выберите доступный ресурс';
		dpicker.selectedDate = '';
		dpicker.dt = '';
		dpicker.options = '';

		// выбор даты
		dpicker.select = function (str) {
			let option = DataService.get('listOption');
			option.date = dpicker.dt;
			if (str != 'change') {
				dpicker.selectedDate = dpicker.dt;
				$('.b-date ul.dropdown-menu').remove();
			}
			DataService.set('listOption', option);
			$rootScope.$broadcast('renderSchedule');
		}
		// сброс даты при закрытии по "отмена"
		dpicker.dateReset = function () {
			let option = DataService.get('listOption');
			dpicker.dt = dpicker.selectedDate;
			option.date = dpicker.selectedDate;
			$('.b-date ul.dropdown-menu').remove();
			DataService.set('listOption', option);
			$rootScope.$broadcast('renderSchedule');
		}

		// разрешено ли выбрать дату в калдарике (вызывается для каждой даты при открытии)
		dpicker.disabled = function (date, mode) {
			// воскресение
			return (mode === 'day' && (date.getDay() === 0));
		};

		// класс ячейки дня при построении календаря (вызывается для каждой даты при открытии)
		dpicker.dayClass = function (date, mode) {
			let timeDate = date.getTime();
			let now = new Date().getTime();
			let strClass = 'b-date__select';

			// на две неделе вперед, проверка на существование расписания на дату
			if (changeWorkWeekDay(date) && (timeDate > (now - (1000 * 60 * 60 * 24))) && (timeDate < (now + (1000 * 60 * 60 * 24 * 14)))) {
				strClass += ' b-date__select-work';
			}

			// для прошедших дат
			if (timeDate < (now - (1000 * 60 * 60 * 24))) {
				strClass += ' before-today js-date-disabled';
				// даты после двух недель
			} else if (timeDate > (now + (1000 * 60 * 60 * 24 * 14))) {
				strClass += ' after-two-week js-date-disabled';
			} else {
				strClass += ' js-date-select';
			}

			// воскресение
			if (date.getDay() === 0) {
				strClass += ' disabled-day-off';
			}

			return strClass;
		}

		// откртыие календаря
		dpicker.open = function ($event) {
			if (dpicker.btnDisabled != '') {
				return false;
			}
			dpicker.selectedDate = dpicker.dt;
			dpicker.status.opened = true;
			// поанель с кнопками
			setTimeout(function () {
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

		// проверка существования расписания на дату
		function changeWorkWeekDay(day) {
			let todayWeekDay = day.getDay() == 0 ? 7 : day.getDay();
			for (var key in dpicker.options.listDr) {
				let specialist = dpicker.options.listDr[key];
				if (specialist.listWorkWeekDay && specialist.listWorkWeekDay.indexOf(todayWeekDay) >= 0) {
					return true;
				}
			}
		}

		// обновление дата пикера и вызов из радительского контроллера
		$scope.$on('updateDatepicker', function () {
			let options = DataService.get('listOption');
			dpicker.options = options;
			// есть ли выбранные ДР
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