'use strict';

angular.module('root').controller('ScheduleController', function($scope, $modal, dataService) {
	let schedule = this;

	schedule.showList = false;
	schedule.list = {};
	schedule.classBlock = "emptyBlock";
	schedule.openedCell = '';
	schedule.defaultInfoTextEmptySchedule = 'Для просмотра расписания выберите хотя бы один Доступный ресурс.';
	schedule.infoTextEmptySchedule = schedule.defaultInfoTextEmptySchedule;
	schedule.textError = '';
	schedule.textInfo = '';
	schedule.maxHeightHead = 0;

	// schedule.heightHead = '';
	// schedule.marginTopHead = '';

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

	schedule.openModalinfo = function(text) {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalInfo',
			windowClass: 'modal-info',
			// backdrop: false,
			controller: function($scope, $modalInstance, schedule, text){
				$scope.modalText = text;
				setTimeout(function($modalInstance) {
					$modalInstance.dismiss('cancel');
				}, 3000, $modalInstance);
			},
			size: 'sm',
			resolve: {
				schedule: function () {
					return schedule;
				},
				text: function() {
					return text;
				}
			}
		});
	}

	schedule.cellOpen = function(item, cell, self) {
		let options = dataService.get('listOption');
		let elemCell = self.currentTarget;
		let target = self.target;
		let recordUser = {doctorName:'', doctorRoom:'', surname:'', name:'', patron:''};

		if (!cell.isOpenPopup) {
			return false;
		}

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

		// Проверка на доступность записи на выбранный интервал
		schedule.dataPopup.btnCreateRecord.isView = ckeckAllowedCreateRecord(cell, item, options);
		schedule.dataPopup.btnDeleteRecord.isView = ckeckAllowedDeleteRecord(cell, item);
		schedule.dataPopup.btnViewRecord.isView = (cell.recordUser.name != '');

		// setTimeout(function(target){
		// 	console.log('OOOOOK__!');
		// 	if ($(target).hasClass('js-popup-open')) {
		// 		$(target).removeClass('js-popup-open');
		// 	} else {
		// 		$(target).addClass('js-popup-open');
		// 	}
		// }, 100, target);
	}

	schedule.expandGraf = function(event) {
		$(event.target).parent().removeClass('collapsed');
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

				if (!ckeckAllowedCreateRecord(cell, item, options)) {
					return false;
				}

				dataRecord.user = options.user;
				dataRecord.idUser = options.user.id;
				//
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
			deleteRecord: function(cell, item) {
				let options = dataService.get('listOption');
				// cell.isOpenPopup = false;
				// $('.b-schedule__item-step').attr('popover-is-open', false);
				if (!ckeckAllowedDeleteRecord(cell, item)) {
					return false;
				}

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
			closePopup: function() {
				schedule.openedCell.isOpenPopup = false;
			}
		};
		return data;
	}
	schedule.dataPopup = getPopupDate();

	function renderList() {
		let options = dataService.get('listOption');
		let today = new Date();
		schedule.heightHead = '';
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
				let item = {listCells:[], timeWorking:'', listQuotsWorking:[], dateDay: new Date(), quots:{}, stepSchedule:0, listRecords:[], start:0, end:0};

				// проверка работы специалиста в этот день
				let todayWeekDay = day.getDay()==0 ? 7 : day.getDay();
				if (!specialist.listWorkWeekDay || specialist.listWorkWeekDay.indexOf(todayWeekDay) < 0) {
					schedule.infoTextEmptySchedule = 'Выберете другую дату для отображения расписания';
					continue;
				}

				// забивка данных из специалиста в итем (если так не делать то из за хеша ангулара выходит дублирование данных)
				item = dataItemFromSpectialist(item, specialist);
				item.listCells = [];
				item.timeWorking = getTimeWorcking(item);
				item.dateDay = day;

				// список ячеек таблицы
				setColumnList(item, day);

				item.listCells.sort(sortScheduleCells);
				item.listQuotsWorking.sort(sortQuotsWorking);
				schedule.list.push(item);
			}
		}

		schedule.list.sort(sortScheduleColumn);

		$('.b-schedule__list-content').css('width', (161*schedule.list.length)+'px');

		schedule.showList = schedule.list && schedule.list.length > 0;

		setTimeout(function() {
			maxScheduleHeader();
		});
	}

	function sortScheduleCells(a, b) {
		if (a.hour < b.hour) return -1;
		else if (a.hour > b.hour) return 1;

		if (a.minute < b.minute) return -1;
		else if (a.minute > b.minute) return 1;

		return 0;
	}
	function sortScheduleColumn(a, b) {
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
	function sortQuotsWorking(a, b) {
		return (a.start < b.start) ? -1 : (a.start > b.start ? 1 : 0);
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
	// правила создания ячеек таблицы
	function setColumnList(item, day){
		let todayWeekDay = day.getDay()==0 ? 7 : day.getDay();
		let isEmptyRecord = false;
		let listEmptyQuota = [];
		for (var i = item.start; i < item.end; i+=item.stepSchedule) {
			let isNotRecordQuote = false;
			let isRecordQuota = false;

			for (var k in item.quots) {
				let quota = item.quots[k];
				// если квота не для этого дня недели
				if (quota.listDaysWeek && quota.listDaysWeek.indexOf(todayWeekDay) < 0) {
					continue;
				}

				if (quota.name == 'Запись на прием') {
					if (i >= quota.start && i < quota.end) {
						isRecordQuota = true;
					}
				}

				if (quota.name != 'Запись на прием') {
					if (i >= quota.start && i < quota.end) {
						isNotRecordQuote = true;
					}
					if (i < quota.start && quota.start < (i + (item.stepSchedule*0.8))) {
						isNotRecordQuote = true;
					}
				}
			}

			if (isRecordQuota && !isNotRecordQuote) {
				setCellData({name:'Запись на прием'}, i, item, day);
				isEmptyRecord = false;
			} else if (!isNotRecordQuote && !isRecordQuota) {
				isEmptyRecord = true;
				listEmptyQuota.push({start:i});
			}

			if (!isEmptyRecord && listEmptyQuota.length > 0) {
				setCellData({name:'Нет записи'}, listEmptyQuota.shift().start, item, day);
				listEmptyQuota = [];
			}
		}

		if (isEmptyRecord && listEmptyQuota.length > 0) {
			setCellData({name:'Нет записи'}, listEmptyQuota.shift().start, item, day);
			listEmptyQuota = [];
		}

		for (var k in item.quots) {
			if (item.quots[k].listDaysWeek && item.quots[k].listDaysWeek.indexOf(todayWeekDay) < 0) {
				continue;
			}
			if (item.quots[k].name != 'Запись на прием') {
				item.quots[k].labelTime = getTimeWorcking(item.quots[k]);
				setCellData(item.quots[k], item.quots[k].start, item, day);
				item.listQuotsWorking.push(item.quots[k]);
			}
		}
	}
	function setCellData(qoute, timeStart, item, day){
		let time = (timeStart*1000)+( new Date((timeStart*1000)).getTimezoneOffset()*60*1000 );
		let now = new Date().getTime()/1000;
		let date = new Date(day);
		let cell = {
			isOpenPopup: false,
			date: 0,
			time: time,
			hour: new Date(time).getHours(),
			minute: new Date(time).getMinutes(),
			label: '',
			title: '',
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
						let userRecord = item.listRecords[kRec].user;
						cell.records.push(item.listRecords[kRec]);
						cell.title += userRecord.surname + ' ' + userRecord.name.charAt(0) + '.' + userRecord.patron.charAt(0) + '.; ';
					}
				}
			}
			if (cell.records.length < 1) {
				cell.title = (now < cell.date ? 'Время доступно для записи' : 'Запись на прошедший временной интервал недоступна');
			}
			if (cell.records.length > 0) {
				cell.elemClass += ' b-schedule__item-record-true';
			}
		} else {
			cell.label = qoute.name;
			cell.isPopup = false;
		}

		item.listCells.push(cell);
	}

	// Проверка на доступность записи на выбранный интервал
	function ckeckAllowedCreateRecord(cell, item, options) {
		let now = new Date().getTime()/1000;
		if (cell.date && (now+item.stepSchedule) > cell.date) {
			schedule.openModalinfo('Интервал не доступен для записи');
			return false;
		}
		if (options.user == '') {
			return false;
		}
		if (cell.records) {
			if (cell.records.length > 1) {
				return false;
			}
			for (var kRec in cell.records) {
				if (cell.records[kRec].idUser == options.user.id) {
					schedule.openModalinfo('Интервал не доступен для записи');
					return false;
				}
			}
		}
		return true;
	}
	// Проверка на доступность отмены в выбранный интервал
	function ckeckAllowedDeleteRecord(cell, item) {
		let now = new Date().getTime()/1000;
		if (cell.date && (now+item.stepSchedule) > cell.date) {
			return false;
		}
		if (cell.recordUser && cell.recordUser.name == '') {
			return false;
		}
		return true;
	}
	function maxScheduleHeader() {
		let maxHeader = Math.max.apply(Math, $(".b-schedule__item-head-cnt").map(function(){
			return $(this).outerHeight()
		}).get());
		schedule.maxHeightHead = maxHeader;
		// TODO переделать, долго и видно прыги
		$('.b-schedule__item-cntnt').css('margin-top', maxHeader+'px');

		schedule.maxHeigthName = Math.max.apply(Math, $(".b-schedule__item-name").map(function(){
			return $(this).height()
		}).get());
		schedule.maxHeigthSpec = Math.max.apply(Math, $(".b-schedule__item-spec").map(function(){
			return $(this).height()
		}).get());
		schedule.maxHeigthAdrec = Math.max.apply(Math, $(".b-schedule__item-adrec").map(function(){
			return $(this).height()
		}).get());

		let maxHeight = Math.max.apply(Math, $(".b-schedule__item").map(function(){
			return $(this).outerHeight()
		}).get());
		$(".b-schedule__item").height(maxHeight);

		$('.b-schedule__list').scrollTop(1);
		$('.b-schedule__list').scrollTop(0);
		$('.b-schedule__list').scrollLeft(1);
		$('.b-schedule__list').scrollLeft(0);
	}

	// изменение шапок столбцов сетки при скроллинге
	$('.b-schedule__list').scroll(function(){
		let scrollTop = $('.b-schedule__list').scrollTop();

		$('.b-schedule__item-head').css('top', scrollTop+'px');

		if ($(".b-schedule__item .b-schedule__item-graf:not(.collapsed)").length < 1) {
			$(".b-schedule__item-name").height(schedule.maxHeigthName);
			$(".b-schedule__item-spec").height(schedule.maxHeigthSpec);
			$(".b-schedule__item-adrec").height(schedule.maxHeigthAdrec);
		} else {
			$(".b-schedule__item-name").height('');
			$(".b-schedule__item-spec").height('');
			$(".b-schedule__item-adrec").height('');
		}

		$(".b-schedule__item").each(function(){
			let blockGraf = $(this).find('.b-schedule__item-graf');

			if (!blockGraf.attr('data-height')) {
				let heightHeaden = 0;
				let maxHeight = Math.max.apply(Math, $(".b-schedule__item").map(function(){
					return $(this).outerHeight()
				}).get());
				$(this).find('.b-schedule__item-head-cnt > div').each(function() {
					heightHeaden += $(this).outerHeight();
				});
				blockGraf.attr('data-height', $(blockGraf).outerHeight());
				blockGraf.attr('data-marginhead', schedule.maxHeightHead-heightHeaden);
				$(".b-schedule__item").height(maxHeight);
			}

			if (scrollTop > (blockGraf.attr('data-height')/2 + parseInt(blockGraf.attr('data-marginhead')))) {
				$(blockGraf).addClass('collapsed');
			} else {
				$(blockGraf).removeClass('collapsed');
			}
		});
	});

	$scope.$on('renderSchedule', function(){
		renderList();
	});

	var el = document.querySelector('.b-schedule__list');
	Ps.initialize(el);
});