'use strict';

angular
	.module('root')
	.service('ScheduleService', function ScheduleService(DataService) {
		let self = this;

		// сортировка интервалов
		self.sortScheduleCells = function(a, b) {
			if (a.hour < b.hour) return -1;
			else if (a.hour > b.hour) return 1;

			if (a.minute < b.minute) return -1;
			else if (a.minute > b.minute) return 1;

			return 0;
		}

		// сортировка отображаемх ДР в сетке (столбцов)
		self.sortScheduleColumn = function(a, b) {
			var nameA = a.name.toUpperCase();
			var nameB = b.name.toUpperCase();
			var specialtyA = a.specialty.toUpperCase();
			var specialtyB = b.specialty.toUpperCase();

			if (a.dateDay < b.dateDay) return -1;
			else if (a.dateDay > b.dateDay) return 1;

			if (nameA < nameB) return -1;
			else if (nameA > nameB) return 1;

			if (specialtyA < specialtyB) return -1;
			else if (specialtyA > specialtyB) return 1;

			if (a.start < b.start) return -1;
			else if (a.start > b.start) return 1;

			return 0;
		}

		self.sortQuotsWorking = function(a, b) {
			return (a.start < b.start) ? -1 : (a.start > b.start ? 1 : 0);
		}

		self.addZIONTime = function(time) { // addZeroIfOneNumTime
			return time < 10 ? '0' + time : time;
		}

		self.getTimeWorcking = function(spec) {
			let strTime = '';
			let start   = (spec.start*1000)+( new Date((spec.start*1000)).getTimezoneOffset()*60*1000 );
			let end     = (spec.end*1000)+( new Date((spec.end*1000)).getTimezoneOffset()*60*1000 );
			let startHour   = new Date(start).getHours();
			let startMinute = new Date(start).getMinutes();
			let endHour   = new Date(end).getHours();
			let endMinute = new Date(end).getMinutes();

			strTime += self.addZIONTime(startHour);
			strTime += ':'+self.addZIONTime(startMinute);
			strTime += '-'+self.addZIONTime(endHour);
			strTime += ':'+self.addZIONTime(endMinute);

			return strTime;
		}

		self.dataItemFromSpectialist = function(item, specialist) {
			for (var elem in specialist) {
				if (elem.charAt(0) == '$') continue;
				if (elem == 'quots') {
					if (specialist[elem].length < 0) continue;
					let qElem = [];
					for (var kQElem = specialist[elem].length - 1; kQElem >= 0; kQElem--) {
						let qElem2 = {};
						for (var kQElem2 in specialist[elem][kQElem]) {
							qElem2[kQElem2] = specialist[elem][kQElem][kQElem2];
						}
						qElem.push(qElem2);
					}
					item[elem] = qElem;
				} else if (elem == 'listRecords') {
					if (specialist[elem].length < 0) continue;
					let qElem = [];
					for (var kQElem = specialist[elem].length - 1; kQElem >= 0; kQElem--) {
						let qElem2 = {};
						for (var kQElem2 in specialist[elem][kQElem]) {
							qElem2[kQElem2] = specialist[elem][kQElem][kQElem2];
						}
						qElem.push(qElem2);
					}
					item[elem] = qElem;
				} else {
					item[elem] = specialist[elem];
				}
			}
			return item;
		}

		// есть ли записи на время
		self.getRecordToStep = function(item, day, time){
			let records = [];
			for (var kRec in item.listRecords) {
				let date = new Date(day);
				let timeI = (time*1000)+( new Date((time*1000)).getTimezoneOffset()*60*1000 );
				timeI = date.setHours(new Date(timeI).getHours(), new Date(timeI).getMinutes(), 0, 0);

				if (timeI/1000 == item.listRecords[kRec].dateRecord) {
					records.push(item.listRecords[kRec]);
				}
			}
			return records;
		}

		// Проверка на доступность отмены в выбранном интервале
		self.ckeckAllowedDeleteRecord = function(cell, item) {
			let now = new Date().getTime()/1000;
			if (cell.date && (now+item.stepSchedule) > cell.date) {
				return false;
			}
			if (cell.recordUser && cell.recordUser.name == '') {
				return false;
			}
			return true;
		}

	});