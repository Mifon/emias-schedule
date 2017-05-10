'use strict';

angular.module('root').controller('ScheduleController', function($scope, dataService) {
	let scheduleList = this;

	scheduleList.showList     = false;
	scheduleList.list = {};
	scheduleList.classBlock = "emptyBlock";

	scheduleList.update = function() {
		console.log('ok');
		// renderList();
	}

	function renderList() {
		let options = dataService.get('listOption');
		let cell = {
			hour: 0,
			minute: 0,
			label: '',
			elemClass: ''
		};

		scheduleList.list     = options.listDr;
		scheduleList.showList = scheduleList.list && scheduleList.list.length > 0;

		console.log(options.date);
		options.viewDays;

		// по дням
		// for (var i = 0; i < options.viewDays; i++) {

			// по специалистам
			for (var key in scheduleList.list) {
				let item = scheduleList.list[key];
				item.schCells = [];
				item.timeWorking = getTimeWorcking(item);

				for (var k in item.quots) {
					let qoute = item.quots[k];

					if (qoute.name == 'Запись на прием') {
						for (var i = qoute.start; i < qoute.end; i+=item.stepSchedule) {
							let time = (i*1000)+( new Date((i*1000)).getTimezoneOffset()*60*1000 );
							let nameClass = qoute.name != 'Запись на прием' ? 'b-schedule__item-step-notrec' : 'b-schedule__item-step';
							let cellA:any = Object.create(cell);

							cellA.hour      = new Date(time).getHours();
							cellA.minute    = new Date(time).getMinutes();
							cellA.label     = cellA.hour + ':' + (cellA.minute < 10 ? '0'+cellA.minute : cellA.minute);
							cellA.elemClass = nameClass;

							item.schCells.push(cellA);
						}
					} else {
						let time = (qoute.start*1000)+( new Date((qoute.start*1000)).getTimezoneOffset()*60*1000 );
						let nameClass = 'b-schedule__item-step-notrec';
						let cellB = Object.create(cell);

						cellB.hour      = new Date(time).getHours();
						cellB.minute    = new Date(time).getMinutes();
						cellB.label     = qoute.name;
						cellB.elemClass = nameClass;

						item.schCells.push(cellB);
					}
				}
				item.schCells.sort(scheduleCellsSort);
				scheduleList.list[key] = item;
			}
		// }
	}

	function scheduleCellsSort(a, b) {
		if (a.hour < b.hour) return -1;
		else if (a.hour > b.hour) return 1;

		if (a.minute < b.minute) return -1;
		else if (a.minute > b.minute) return 1;

		return 0;
	}
	function getTimeWorcking(spec) {
		let strTime = '';
		let start   = (spec.start*1000)+( new Date((spec.start*1000)).getTimezoneOffset()*60*1000 );
		let end     = (spec.end*1000)+( new Date((spec.end*1000)).getTimezoneOffset()*60*1000 );
		let startHour   = new Date(start).getHours();
		let startMinute = new Date(start).getMinutes();
		let endHour   = new Date(end).getHours();
		let endMinute = new Date(end).getMinutes();

		strTime += addZIONTime(startHour);
		strTime += ':'+addZIONTime(startMinute);
		strTime += '-'+addZIONTime(endHour);
		strTime += ':'+addZIONTime(endMinute);

		return strTime;
	}
	function addZIONTime(time) { // addZeroIfOneNumTime
		return time < 10 ? '0' + time : time;
	}

	$scope.$on('renderSchedule', function(){
		renderList();
	});

	var el = document.querySelector('.b-schedule__list');
	Ps.initialize(el);
})