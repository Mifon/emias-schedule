'use strict';

angular.module('root').controller('ScheduleController', function($scope, $modal, dataService) {
	let schedule = this;

	schedule.showList = false;
	schedule.list = {};
	schedule.classBlock = "emptyBlock";
	schedule.openedCell = '';
	schedule.defaultInfoTextEmptySchedule = 'Для просмотра расписания выберите хотя бы один Доступный ресурс.';
	schedule.infoTextEmptySchedule = schedule.defaultInfoTextEmptySchedule;

	schedule.update = function() {
		console.log('ok');
		// renderList();
	}

	schedule.openModalOk = function() {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalOk',
			windowClass: 'modal-ok',
			controller: function($modalInstance){
				setTimeout(function($modalInstance) {
					$modalInstance.dismiss('cancel');
				}, 3000, $modalInstance);
			},
			size: 'sm'
		});
	}

	schedule.cellOpen = function(item, cell, self) {
		let options = dataService.get('listOption');
		let elemCell = self.currentTarget;
		let target = self.target;
		let recordUser = {doctorName:'', doctorRoom:'', surname:'', name:'', patron:''};

		if ($(target).hasClass('b-schedule__item-cntnt-record')) {
			let elemKey = $(target).attr('data-dateid');
			let dataKey = elemKey.split('_');

			for (var kRec in cell.records) {
				if (cell.records[kRec].idUser == dataKey[1]) {
					recordUser = cell.records[kRec].user;
				}
			}
			recordUser.doctorName = item.name;
			recordUser.doctorRoom = item.room;
		}

		if (schedule.openedCell != cell) {
			if (schedule.openedCell != '') {
				schedule.openedCell.isOpenPopup = false;
			}
		}
		schedule.openedCell = cell;

		cell.target = target;
		cell.parent = self.currentTarget;
		cell.recordUser = recordUser;

		schedule.dataPopup.isViewMenu = true;
		schedule.dataPopup.isViewUser = false;
		schedule.dataPopup.isViewConfirmCancel = false;
		if (recordUser.name == '') {
			schedule.dataPopup.title = 'Выбран интервал времени';
			schedule.dataPopup.isIconUser = false;
			schedule.dataPopup.time = cell.label + ' - ';
			schedule.dataPopup.time += addZIONTime(new Date(cell.time + (item.stepSchedule*1000)).getHours()) + ':';
			schedule.dataPopup.time += addZIONTime(new Date(cell.time + (item.stepSchedule*1000)).getMinutes());
		} else {
			schedule.dataPopup.title = recordUser.surname + ' ' + recordUser.name.charAt(0) + '.' + recordUser.patron.charAt(0) + '.';
			schedule.dataPopup.time = '';
			schedule.dataPopup.isIconUser = true;
		}

		schedule.dataPopup.btnCreateRecord.isView = (!cell.records || cell.records.length < 2) && options.user != '';
		schedule.dataPopup.btnDeleteRecord.isView = (cell.records && cell.records.length > 0);
		schedule.dataPopup.btnViewRecord.isView = (recordUser.name != '');

		setTimeout(function(target){
			console.log('OOOOOK__!');
			if ($(target).hasClass('js-popup-open')) {
				$(target).removeClass('js-popup-open');
			} else {
				$(target).addClass('js-popup-open');
			}
		}, 100, target);
	}
	schedule.openPopover = function() {
	}


	class ClassName {

		templateUrl: 'popoverTemplate';
		title: '';
		time: '';
		user: {
			name:''
		};
		btnViewRecord: {
			title: 'Просмотреть запись',
			icon: '',
			isView: false
		};
		btnCreateRecord: {
			title: 'Создать запись',
			icon: '',
			isView: false
		};
		btnDeleteRecord: {
			title: 'Отменить запись',
			icon: '',
			isView: false
		};
	}


	function getPopupDate() {
		let data = {
			templateUrl: 'popoverTemplate',
			title: '',
			time: '',
			user: {
				name:''
			},
			isIconUser: false,
			isViewUser: false,
			isViewMenu: true,
			isViewConfirmCancel: false,
			btnViewRecord: {
				title: 'Просмотреть запись',
				icon: '',
				isView: false
			},
			btnCreateRecord: {
				title: 'Создать запись',
				icon: '',
				isView: false
			},
			btnDeleteRecord: {
				title: 'Отменить запись',
				icon: '',
				isView: false
			},
			viewRecord: function(cell) {
				if ($(cell.target).hasClass('b-schedule__item-cntnt-record')) {
					schedule.dataPopup.isViewUser = true;
					schedule.dataPopup.isViewMenu = false;
				}
			},
			createRecord: function(cell, item) {
				let options = dataService.get('listOption');
				let dataRecord = {idUser:0, time:0, user:{}, dateRecord:0};

				if (options.user == '') {
					return false;
				}

				dataRecord.user = options.user;
				dataRecord.idUser = options.user.id;
				dataRecord.time = (60*60*cell.hour)+(60*cell.minute);
				dataRecord.dateRecord = cell.date;

				item.listRecords.push(dataRecord);
				cell.records.push(dataRecord);

				for (var kDr in options.listDr) {
					if (item.id == options.listDr[kDr].id) {
						options.listDr[kDr].listRecords.push(dataRecord);
					}
				}

				dataService.set('listOption', options);
				renderList();
				schedule.openModalOk();
			},
			confirmDeleteRecord: function(cell, item) {
				schedule.dataPopup.isViewConfirmCancel = true;
				schedule.dataPopup.isViewMenu = false;
			},
			returnToSchedule: function() {
				schedule.dataPopup.isViewConfirmCancel = false;
				schedule.dataPopup.isViewMenu = true;
				if (schedule.openedCell != '') {
					schedule.openedCell.isOpenPopup = false;
				}
			},
			deleteRecord: function(cell, item) {
				// cell.isOpenPopup = false;
				// $('.b-schedule__item-step').attr('popover-is-open', false);
				let options = dataService.get('listOption');

				for (var kDr in options.listDr) {
					if (item.id == options.listDr[kDr].id) {

						for (var kRec in options.listDr[kDr].listRecords) {
							if (cell.recordUser.id == options.listDr[kDr].listRecords[kRec].idUser
								&& cell.date == options.listDr[kDr].listRecords[kRec].dateRecord) {
								options.listDr[kDr].listRecords.splice(kRec, 1);
							}
						}
					}
				}

				dataService.set('listOption', options);
				renderList();
			}
		};
		return data;
	}
	schedule.dataPopup = getPopupDate();

	function renderList() {
		let options = dataService.get('listOption');
		let today = new Date();
		schedule.infoTextEmptySchedule = schedule.defaultInfoTextEmptySchedule;

		schedule.list   = [];
		schedule.listDr = options.listDr;

		// по дням
		for (var d = 0; d < options.viewDays; d++) {
			let day = new Date(options.date);
			if (options.date == '') continue;

			day.setDate(day.getDate() + d);

			// по специалистам
			for (var key in schedule.listDr) {
				let specialist = schedule.listDr[key];
				let item = {listCells:[], timeWorking:'', strDate: new Date(), quots:{}, stepSchedule:0, listRecords:[]};


				let keyError = 0;
				// проверка работы специалиста в этот день
				specialist.listWorkWeekDay
				let todayWeekDay = day.getDay()==0 ? 7 : day.getDay();
				if (!specialist.listWorkWeekDay || specialist.listWorkWeekDay.indexOf(todayWeekDay) < 0) {
					keyError = 1;
				}

				if (keyError) {
					if (keyError == 1) {
						schedule.infoTextEmptySchedule = 'Выберете другую дату для отображения расписания';
					}
					continue;
				}


				// забивка данных из специалиста в итем (если так не делать то из за хеша ангулара выходит дублирование данных)
				item = dataItemFromSpectialist(item, specialist);

				item.listCells = [];
				item.timeWorking = getTimeWorcking(item);
				item.strDate = day;

				for (var k in item.quots) {
					let qoute = item.quots[k];

					if (qoute.name == 'Запись на прием') {
						for (var i = qoute.start; i < qoute.end; i+=item.stepSchedule) {
							setCellData(qoute, i, item, day);
						}
					} else {
						setCellData(qoute, qoute.start, item, day);
					}
				}
				item.listCells.sort(scheduleCellsSort);
				schedule.list.push(item);
			}
		}

		$('.b-schedule__list-content').css('width', (161*schedule.list.length)+'px');

		schedule.showList = schedule.list && schedule.list.length > 0;
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
	function dataItemFromSpectialist(item, specialist) {
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
	function setCellData(qoute, timeStart, item, day){
		let time = (timeStart*1000)+( new Date((timeStart*1000)).getTimezoneOffset()*60*1000 );
		let date = new Date(day);
		let cell = {
			isOpenPopup: false,
			date: 0,
			time: time,
			hour: new Date(time).getHours(),
			minute: new Date(time).getMinutes(),
			label: '',
			isPopup: true,
			elemClass: qoute.name != 'Запись на прием' ? 'b-schedule__item-step-notrec' : 'b-schedule__item-step',
			records: []
		};

		date.setHours(cell.hour, cell.minute, 0, 0);
		cell.date = date.getTime()/1000;

		if (qoute.name == 'Запись на прием') {
			cell.label = addZIONTime(cell.hour) + ':' + addZIONTime(cell.minute);

			if (item.listRecords) {
				for (var kRec in item.listRecords) {
					if (cell.date == item.listRecords[kRec].dateRecord) {
						cell.records.push(item.listRecords[kRec]);
					}
				}
			}
		} else {
			cell.label = qoute.name;
			cell.isPopup = false;
		}

		item.listCells.push(cell);
	}

	$scope.$on('renderSchedule', function(){
		renderList();
	});

	var el = document.querySelector('.b-schedule__list');
	Ps.initialize(el);
});