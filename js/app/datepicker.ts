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

	dpicker.clear = function(){
		console.log(dpicker.dt);
		dpicker.dt = null;
	};
	dpicker.select = function($event, string){
		console.log($event);
		console.log(string);
	}

	dpicker.disabled = function(date, mode) {
		// console.log(date.getDate());
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	dpicker.open = function($event) {
		dpicker.status.opened = true;
	};

	var tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	var afterTomorrow = new Date();
	afterTomorrow.setDate(tomorrow.getDate() + 2);
	dpicker.events =
	[
		{
			date: tomorrow,
			status: 'full'
		},
		{
			date: afterTomorrow,
			status: 'partially'
		}
	];

	dpicker.getDayClass = function(date, mode) {
		console.log(mode);
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0,0,0,0);

			for (var i=0;i<dpicker.events.length;i++){
				var currentDay = new Date(dpicker.events[i].date).setHours(0,0,0,0);

				if (dayToCheck === currentDay) {
					return dpicker.events[i].status;
				}
			}
		}

		return '';
	};
});