'use strict';

angular
	.module('root')
	.controller('ScheduleController', function($scope, $modal, DataService, ScheduleService) {
		let schedule = this;

		schedule.showList = false;
		schedule.list = {};
		schedule.openedCell = '';
		schedule.defaultInfoTextEmptySchedule = 'Для просмотра расписания выберите хотя бы один Доступный ресурс.';
		schedule.infoTextEmptySchedule = schedule.defaultInfoTextEmptySchedule;
		schedule.maxHeightHead = 0;
		schedule.xScrollbar = '';
		schedule.yScrollbar = '';
		schedule.xScrollbarArrow = $('.b-schedule .scroll-x-arrow');
		schedule.yScrollbarArrow = $('.b-schedule .scroll-y-arrow');

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

		// открытие свернутого при сколинде заголовка в расписании
		schedule.expandGraf = function(event) {
			$(event.target).parent().removeClass('collapsed');
		}

		// объект попап
		schedule.dataPopup = {
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
				let options = DataService.get('listOption');
				let dataRecord = {idUser:0, time:0, user:{}, dateRecord:0};

				if (!ckeckAllowedCreateRecord(cell, item, options)) {
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

				DataService.set('listOption', options);
				renderList();
				schedule.openModalOk();
			},
			deleteRecord: function(cell, item) {
				let options = DataService.get('listOption');
				if (!ScheduleService.ckeckAllowedDeleteRecord(cell, item)) {
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

				DataService.set('listOption', options);
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

		schedule.popupOpen = function(item, cell, self) {
			let options = DataService.get('listOption');
			let elemCell = self.currentTarget;
			let target = self.target;
			let recordUser = {doctorName:'', doctorRoom:'', surname:'', name:'', patron:''};

			if (!cell.isOpenPopup) {
				return false;
			}

			// данные записи на которую кликнули
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


			cell.target = target;
			cell.parent = self.currentTarget;
			cell.recordUser = recordUser;

			schedule.openedCell = cell;
			schedule.dataPopup.isViewMenu = true;
			schedule.dataPopup.isViewUser = false;
			schedule.dataPopup.isViewConfirmCancel = false;

			// вывод заголовка меню
			if (recordUser.name == '') {
				schedule.dataPopup.title = 'Выбран интервал времени';
				schedule.dataPopup.isIconUser = false;
				schedule.dataPopup.time = cell.label + ' - ';
				schedule.dataPopup.time += ScheduleService.addZIONTime(new Date(cell.time + (item.stepSchedule*1000)).getHours()) + ':';
				schedule.dataPopup.time += ScheduleService.addZIONTime(new Date(cell.time + (item.stepSchedule*1000)).getMinutes());
			} else {
				schedule.dataPopup.title = recordUser.surname + ' ' + recordUser.name.charAt(0) + '.' + recordUser.patron.charAt(0) + '.';
				schedule.dataPopup.time = '';
				schedule.dataPopup.isIconUser = true;
			}

			// Проверка на доступность записи на выбранный интервал
			schedule.dataPopup.btnCreateRecord.isView = ckeckAllowedCreateRecord(cell, item, options);
			schedule.dataPopup.btnDeleteRecord.isView = ScheduleService.ckeckAllowedDeleteRecord(cell, item);
			schedule.dataPopup.btnViewRecord.isView = (cell.recordUser.name != '');
		}

		// построение отображения расписания
		function renderList() {
			let options = DataService.get('listOption');
			let listShedule = [];
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
					item = ScheduleService.dataItemFromSpectialist(item, specialist);
					item.listCells = [];
					item.timeWorking = ScheduleService.getTimeWorcking(item);
					item.dateDay = day;

					// построение списока интервалов таблицы
					setColumnList(item, day);

					item.listCells.sort(ScheduleService.sortScheduleCells);
					item.listQuotsWorking.sort(ScheduleService.sortQuotsWorking);

					schedule.list.push(item);
				}
			}

			schedule.list.sort(ScheduleService.sortScheduleColumn);


			// задаем ширину блока расписания
			$('.b-schedule__list-content').css('width', (161*schedule.list.length)+'px');

			schedule.showList = schedule.list && schedule.list.length > 0;

			// фиксирование началных данных по сетке расписания для скроллинга
			schedule.xScrollbar = $('.b-schedule__list .ps-scrollbar-x-rail');
			schedule.yScrollbar = $('.b-schedule__list .ps-scrollbar-y-rail');
			setTimeout(function() {
				maxScheduleHeader();
			});
		}

		function addToViewColimnList(listQuotaCell, item, day) {
			for (var k in listQuotaCell) {
				let step = listQuotaCell[k];
				setCellData(step, step.time, item, day);
			}
		}

		// правила создания ячеек таблицы
		function setColumnList(item, day){
			let todayWeekDay = day.getDay()==0 ? 7 : day.getDay();
			let listQuotaCell = [];
			let listEmptyStep = [];
			let tempQuota = {name:'', start:0, end:0, time:0};

			for (var i = item.start; i < item.end; i+=item.stepSchedule) {

				let listQ = [];
				for (var k in item.quots) {
					let quota = item.quots[k];
					// если квота не для этого дня недели
					if (quota.listDaysWeek && quota.listDaysWeek.indexOf(todayWeekDay) < 0) {
						continue;
					}

					if (quota.name != 'Запись на прием') {
						// входит ли интервал в квоту и перекрывает ли квота интервал
						if (	(i >= quota.start && i < quota.end) ||
								(i < quota.start && quota.start < (i + (item.stepSchedule*0.8)))
							) {

							if (tempQuota.name == quota.name || tempQuota.name == '') {
								// есть ли записи в квоте
								if (ScheduleService.getRecordToStep(item, day, i).length > 0) {
									listQuotaCell.push({name:'Запись на прием', time:i, isRecord:false});
								}
							} else {
								tempQuota.time = i-1; // интервал квоты на секунду меньше для корректной сортировки
								listQuotaCell.push(tempQuota);
								addToViewColimnList(listQuotaCell, item, day);
								listQuotaCell = [];
							}
							tempQuota = quota;
							listQ = [];
							listEmptyStep = [];
							break;
						}
					} else {
						if (i >= quota.start && i < quota.end) {
							if (tempQuota.name != quota.name && tempQuota.name != '') {
								setCellData({name:tempQuota.name}, tempQuota.start, item, day);
								if (listQuotaCell.length > 0) {
									tempQuota.time = i-1; // интервал квоты на секунду меньше для корректной сортировки
									listQuotaCell.push(tempQuota);
									addToViewColimnList(listQuotaCell, item, day);
								}
								tempQuota = quota;
								listQuotaCell = [];
							}
							if (i >= quota.start && i < quota.end) {
								quota.time = i;
								listQ.push(quota);
							}
							tempQuota = quota;
							listEmptyStep = [];
							continue;
						}

					}

				}

				// если шага нет ни в одной квоте
				if (listQ.length < 1 && listQuotaCell.length < 1) {
					if (tempQuota.name == '') {
						tempQuota.name = 'Нет записи';
						if (listEmptyStep.length < 1) {
							tempQuota.start = i;
							listEmptyStep.push({name:'Нет записи', time:i, isRecord:false});
						}
						tempQuota.end = i+item.stepSchedule;
					}
					// есть ли записи в квоте
					if (ScheduleService.getRecordToStep(item, day, i).length > 0) {
						listQuotaCell.push({name:'Запись на прием', time:i, isRecord:false});
					}
				}

				// если интервал для записи - выводим
				if (listQ.length > 0 && listQuotaCell.length < 1) {
					addToViewColimnList(listQ, item, day);
				}

			}

			// если остались не выведенные ячейки интервалов выводим
			if (listQuotaCell.length > 0) {
				setCellData({name:tempQuota.name}, tempQuota.start, item, day);
				listQuotaCell.push({name:tempQuota.name, time:i});
				addToViewColimnList(listQuotaCell, item, day);
			// последние интервалы были запрещающей квоте, выводим
			} else if (tempQuota.name != 'Запись на прием' && tempQuota.name != 'Нет записи') {
				setCellData({name:tempQuota.name}, tempQuota.end, item, day);
			}

			// Задаем промежутки квот для шапки столбца
			for (var k in item.quots) {
				if (item.quots[k].listDaysWeek && item.quots[k].listDaysWeek.indexOf(todayWeekDay) < 0) {
					continue;
				}
				if (item.quots[k].name != 'Запись на прием') {
					item.quots[k].labelTime = ScheduleService.getTimeWorcking(item.quots[k]);
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
				isRecord: false,
				popupPlacement: 'right',
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
				cell.label = ScheduleService.addZIONTime(cell.hour) + ':' + ScheduleService.addZIONTime(cell.minute);

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
					cell.title = (now+item.stepSchedule < cell.date ? 'Время доступно для записи' : 'Запись на прошедший временной интервал недоступна');
				}
				if (cell.records.length > 0) {
					cell.elemClass += ' b-schedule__item-record-true';
				}
				if (qoute.isRecord) {
					cell.isRecord = qoute.isRecord;
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
			// интервал в пределах шага от сейчас - запись запрещена
			if ((cell.date && (now+item.stepSchedule) > cell.date) || !cell.isRecord) {
				schedule.openModalinfo('Интервал не доступен для записи');
				return false;
			}
			if (options.user == '') {
				return false;
			}
			// если выбранный пациент уже записат или если записанных 2
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

		// фиксирование начальных данных для скроллинга
		function maxScheduleHeader() {
			let maxHeader = Math.max.apply(Math, $(".b-schedule__item-head-cnt").map(function(){
				return $(this).outerHeight()
			}).get());
			schedule.maxHeightHead = maxHeader;
			// TODO переделать, долго и видно прыги
			$('.b-schedule__item-cntnt').css('margin-top', maxHeader+'px');

			// вычесление максимальной выосты заголовка в шапке
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

			if ($('.b-schedule__list').width() > $('.b-schedule__list-content').width()) {
				schedule.xScrollbar.css('display', 'none');
				schedule.xScrollbarArrow.css('display', 'none');
			} else {
				schedule.xScrollbar.css('display', 'block');
				schedule.xScrollbarArrow.css('display', 'block');
			}
			if ($('.b-schedule__list').height() > $('.b-schedule__list-content').height()) {
				schedule.yScrollbar.css('display', 'none');
				schedule.yScrollbarArrow.css('display', 'none');
			} else {
				schedule.yScrollbar.css('display', 'block');
				schedule.yScrollbarArrow.css('display', 'block');
			}
		}

		// изменение шапок столбцов сетки при скроллинге
		$('.b-schedule__list').scroll(function(){
			let scrollTop = $('.b-schedule__list').scrollTop();

			$('.b-schedule__item-head').css('top', scrollTop+'px');

			// высота заголовков в шапке. когда они компакты выравниваются
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