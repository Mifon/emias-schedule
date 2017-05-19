'use strict';
angular.module('root', ['ui.bootstrap'])
    .constant('CONFIG', {
    DebugMode: true,
    StepCounter: 0,
});
angular
    .module('root')
    .controller('DropdownMenuController', function DropdownMenuController($scope, $log) {
    $scope.status = {
        isopen: false
    };
    $scope.toggleDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
});
angular
    .module('root')
    .controller('DpickerController', function DpickerController($scope, $rootScope, DataService) {
    var dpicker = this;
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
    dpicker.select = function (str) {
        var option = DataService.get('listOption');
        option.date = dpicker.dt;
        if (str != 'change') {
            dpicker.selectedDate = dpicker.dt;
            $('.b-date ul.dropdown-menu').remove();
        }
        DataService.set('listOption', option);
        $rootScope.$broadcast('renderSchedule');
    };
    dpicker.dateReset = function () {
        var option = DataService.get('listOption');
        dpicker.dt = dpicker.selectedDate;
        option.date = dpicker.selectedDate;
        $('.b-date ul.dropdown-menu').remove();
        DataService.set('listOption', option);
        $rootScope.$broadcast('renderSchedule');
    };
    dpicker.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0));
    };
    dpicker.dayClass = function (date, mode) {
        var timeDate = date.getTime();
        var now = new Date().getTime();
        var strClass = 'b-date__select';
        if (changeWorkWeekDay(date) && (timeDate > (now - (1000 * 60 * 60 * 24))) && (timeDate < (now + (1000 * 60 * 60 * 24 * 14)))) {
            strClass += ' b-date__select-work';
        }
        if (timeDate < (now - (1000 * 60 * 60 * 24))) {
            strClass += ' before-today js-date-disabled';
        }
        else if (timeDate > (now + (1000 * 60 * 60 * 24 * 14))) {
            strClass += ' after-two-week js-date-disabled';
        }
        else {
            strClass += ' js-date-select';
        }
        if (date.getDay() === 0) {
            strClass += ' disabled-day-off';
        }
        return strClass;
    };
    dpicker.open = function ($event) {
        if (dpicker.btnDisabled != '') {
            return false;
        }
        dpicker.selectedDate = dpicker.dt;
        dpicker.status.opened = true;
        setTimeout(function () {
            var btnCancel = $('<button type="button" class="btn btn-sm btn-default btn-dpicker">Отменить</button>');
            var btnDone = $('<button type="button" class="btn btn-sm btn-success btn-dpicker">Ок</button>');
            var block = $('.b-date ul.dropdown-menu .btn-group').parent();
            btnCancel.click(dpicker.dateReset);
            btnDone.click(dpicker.select);
            $(block).css('text-align', 'right');
            $(block).html('').append(btnCancel).append(btnDone);
            $('.b-date .js-date-disabled button').attr('disabled', 'disabled');
        });
    };
    function changeWorkWeekDay(day) {
        var todayWeekDay = day.getDay() == 0 ? 7 : day.getDay();
        for (var key in dpicker.options.listDr) {
            var specialist = dpicker.options.listDr[key];
            if (specialist.listWorkWeekDay && specialist.listWorkWeekDay.indexOf(todayWeekDay) >= 0) {
                return true;
            }
        }
    }
    $scope.$on('updateDatepicker', function () {
        var options = DataService.get('listOption');
        dpicker.options = options;
        if (options.listDr && options.listDr.length > 0) {
            dpicker.btnDisabled = '';
            dpicker.btnDisabledTitle = '';
            dpicker.dt = (dpicker.dt == '' ? new Date() : dpicker.dt);
        }
        else {
            dpicker.btnDisabled = 'disabled';
            dpicker.btnDisabledTitle = 'Выберите доступный ресурс';
            dpicker.dt = '';
        }
        dpicker.select();
    });
});
angular
    .module('root')
    .controller('DaysController', function DaysController($scope, $rootScope, DataService) {
    var options = DataService.get('listOption');
    $scope.radioModel = options.viewDays;
    $scope.changeDays = function () {
        options = DataService.get('listOption');
        options.viewDays = $scope.radioModel;
        DataService.set('options', options);
        $rootScope.$broadcast('updateDatepicker');
    };
});
angular.module('root').controller('PatientController', function (DataService) {
    var patient = this;
    patient.user = '';
    patient.list = DataService.get('listUser');
    patient.listRes = '';
    patient.btnDisabled = 'disabled';
    patient.inputChange = function (e) {
        if (patient.inputSearch.length >= 3) {
            patient.listRes = patient.list;
        }
        else {
            patient.listRes = '';
        }
    };
    patient.selectedUser = function (item) {
        var option = DataService.get('listOption');
        patient.user = item;
        patient.btnDisabled = '';
        patient.listRes = '';
        patient.inputSearch = '';
        option.user = item;
        DataService.set('listOption', option);
    };
    patient.relogUser = function () {
        var option = DataService.get('listOption');
        patient.user = '';
        patient.btnDisabled = 'disabled';
        option.user = '';
        DataService.set('listOption', option);
    };
});
angular
    .module('root')
    .controller('ScheduleController', function ($scope, $modal, DataService, ScheduleService) {
    var schedule = this;
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
    schedule.openModalOk = function () {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'modalOk',
            windowClass: 'modal-ok',
            controller: function ($modalInstance) {
                setTimeout(function ($modalInstance) {
                    $modalInstance.dismiss('cancel');
                }, 3000, $modalInstance);
            },
            size: 'sm'
        });
    };
    schedule.openModalinfo = function (text) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'modalInfo',
            windowClass: 'modal-info',
            controller: function ($scope, $modalInstance, schedule, text) {
                $scope.modalText = text;
                setTimeout(function ($modalInstance) {
                    $modalInstance.dismiss('cancel');
                }, 3000, $modalInstance);
            },
            size: 'sm',
            resolve: {
                schedule: function () {
                    return schedule;
                },
                text: function () {
                    return text;
                }
            }
        });
    };
    schedule.expandGraf = function (event) {
        $(event.target).parent().removeClass('collapsed');
    };
    schedule.dataPopup = {
        templateUrl: 'popoverTemplate',
        title: '',
        time: '',
        user: {
            name: ''
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
        viewRecord: function (cell) {
            if ($(cell.target).hasClass('b-schedule__item-cntnt-record')) {
                schedule.dataPopup.isViewUser = true;
                schedule.dataPopup.isViewMenu = false;
            }
        },
        createRecord: function (cell, item) {
            var options = DataService.get('listOption');
            var dataRecord = { idUser: 0, time: 0, user: {}, dateRecord: 0 };
            if (!ckeckAllowedCreateRecord(cell, item, options)) {
                return false;
            }
            dataRecord.user = options.user;
            dataRecord.idUser = options.user.id;
            dataRecord.time = (60 * 60 * cell.hour) + (60 * cell.minute);
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
        deleteRecord: function (cell, item) {
            var options = DataService.get('listOption');
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
        confirmDeleteRecord: function (cell, item) {
            schedule.dataPopup.isViewConfirmCancel = true;
            schedule.dataPopup.isViewMenu = false;
        },
        returnToSchedule: function () {
            schedule.dataPopup.isViewConfirmCancel = false;
            schedule.dataPopup.isViewMenu = true;
            if (schedule.openedCell != '') {
                schedule.openedCell.isOpenPopup = false;
            }
        },
        closePopup: function () {
            schedule.openedCell.isOpenPopup = false;
        }
    };
    schedule.popupOpen = function (item, cell, self) {
        var options = DataService.get('listOption');
        var elemCell = self.currentTarget;
        var target = self.target;
        var recordUser = { doctorName: '', doctorRoom: '', surname: '', name: '', patron: '' };
        if (!cell.isOpenPopup) {
            return false;
        }
        if ($(target).hasClass('b-schedule__item-cntnt-record')) {
            var elemKey = $(target).attr('data-dateid');
            var dataKey = elemKey.split('_');
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
        if (recordUser.name == '') {
            schedule.dataPopup.title = 'Выбран интервал времени';
            schedule.dataPopup.isIconUser = false;
            schedule.dataPopup.time = cell.label + ' - ';
            schedule.dataPopup.time += ScheduleService.addZIONTime(new Date(cell.time + (item.stepSchedule * 1000)).getHours()) + ':';
            schedule.dataPopup.time += ScheduleService.addZIONTime(new Date(cell.time + (item.stepSchedule * 1000)).getMinutes());
        }
        else {
            schedule.dataPopup.title = recordUser.surname + ' ' + recordUser.name.charAt(0) + '.' + recordUser.patron.charAt(0) + '.';
            schedule.dataPopup.time = '';
            schedule.dataPopup.isIconUser = true;
        }
        schedule.dataPopup.btnCreateRecord.isView = ckeckAllowedCreateRecord(cell, item, options);
        schedule.dataPopup.btnDeleteRecord.isView = ScheduleService.ckeckAllowedDeleteRecord(cell, item);
        schedule.dataPopup.btnViewRecord.isView = (cell.recordUser.name != '');
    };
    function renderList() {
        var options = DataService.get('listOption');
        var listShedule = [];
        var today = new Date();
        schedule.heightHead = '';
        schedule.infoTextEmptySchedule = schedule.defaultInfoTextEmptySchedule;
        schedule.list = [];
        schedule.listDr = options.listDr;
        for (var d = 0; d < options.viewDays; d++) {
            var day = new Date(options.date);
            if (options.date == '')
                continue;
            day.setDate(day.getDate() + d);
            for (var key in schedule.listDr) {
                var specialist = schedule.listDr[key];
                var item = { listCells: [], timeWorking: '', listQuotsWorking: [], dateDay: new Date(), quots: {}, stepSchedule: 0, listRecords: [], start: 0, end: 0 };
                var todayWeekDay = day.getDay() == 0 ? 7 : day.getDay();
                if (!specialist.listWorkWeekDay || specialist.listWorkWeekDay.indexOf(todayWeekDay) < 0) {
                    schedule.infoTextEmptySchedule = 'Выберете другую дату для отображения расписания';
                    continue;
                }
                item = ScheduleService.dataItemFromSpectialist(item, specialist);
                item.listCells = [];
                item.timeWorking = ScheduleService.getTimeWorcking(item);
                item.dateDay = day;
                setColumnList(item, day);
                item.listCells.sort(ScheduleService.sortScheduleCells);
                item.listQuotsWorking.sort(ScheduleService.sortQuotsWorking);
                schedule.list.push(item);
            }
        }
        schedule.list.sort(ScheduleService.sortScheduleColumn);
        $('.b-schedule__list-content').css('width', (161 * schedule.list.length) + 'px');
        schedule.showList = schedule.list && schedule.list.length > 0;
        schedule.xScrollbar = $('.b-schedule__list .ps-scrollbar-x-rail');
        schedule.yScrollbar = $('.b-schedule__list .ps-scrollbar-y-rail');
        setTimeout(function () {
            maxScheduleHeader();
        });
    }
    function addToViewColumnList(listQuotaCell, item, day) {
        for (var k in listQuotaCell) {
            var step = listQuotaCell[k];
            setCellData(step, step.time, item, day);
        }
    }
    function setColumnList(item, day) {
        var todayWeekDay = day.getDay() == 0 ? 7 : day.getDay();
        var listQuotaCell = [];
        var listEmptyStep = [];
        var tempQuota = { name: '', start: 0, end: 0, time: 0 };
        for (var i = item.start; i < item.end; i += item.stepSchedule) {
            var listQ = [];
            for (var k in item.quots) {
                var quota = item.quots[k];
                if (quota.listDaysWeek && quota.listDaysWeek.indexOf(todayWeekDay) < 0) {
                    continue;
                }
                if (quota.name != 'Запись на прием') {
                    if ((i >= quota.start && i < quota.end) ||
                        (i < quota.start && quota.start < (i + (item.stepSchedule * 0.8)))) {
                        if (tempQuota.name == quota.name || tempQuota.name == '') {
                            if (ScheduleService.getRecordToStep(item, day, i).length > 0) {
                                listQuotaCell.push({ name: 'Запись на прием', time: i, isRecord: false });
                            }
                        }
                        else {
                            if (tempQuota.name != 'Запись на прием') {
                                tempQuota.time = i - 1;
                                listQuotaCell.push(tempQuota);
                            }
                            addToViewColumnList(listQuotaCell, item, day);
                            listQuotaCell = [];
                        }
                        tempQuota = quota;
                        listQ = [];
                        listEmptyStep = [];
                        break;
                    }
                }
                else {
                    if (i >= quota.start && i < quota.end) {
                        if (tempQuota.name != quota.name && tempQuota.name != '') {
                            setCellData({ name: tempQuota.name }, tempQuota.start, item, day);
                            if (listQuotaCell.length > 0) {
                                tempQuota.time = i - 1;
                                listQuotaCell.push(tempQuota);
                                addToViewColumnList(listQuotaCell, item, day);
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
            if (listQ.length < 1 && listQuotaCell.length < 1) {
                if (tempQuota.name == '') {
                    tempQuota.name = 'Нет записи';
                    if (listEmptyStep.length < 1) {
                        tempQuota.start = i;
                        listEmptyStep.push({ name: 'Нет записи', time: i, isRecord: false });
                    }
                    tempQuota.end = i + item.stepSchedule;
                }
                if (ScheduleService.getRecordToStep(item, day, i).length > 0) {
                    listQuotaCell.push({ name: 'Запись на прием', time: i, isRecord: false });
                }
            }
            if (listQ.length > 0 && listQuotaCell.length < 1) {
                addToViewColumnList(listQ, item, day);
            }
        }
        if (listQuotaCell.length > 0) {
            setCellData({ name: tempQuota.name }, tempQuota.start, item, day);
            listQuotaCell.push({ name: tempQuota.name, time: i });
            addToViewColumnList(listQuotaCell, item, day);
        }
        else if (tempQuota.name != 'Запись на прием' && tempQuota.name != 'Нет записи') {
            setCellData({ name: tempQuota.name }, tempQuota.end, item, day);
        }
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
    function setCellData(qoute, timeStart, item, day) {
        var time = (timeStart * 1000) + (new Date((timeStart * 1000)).getTimezoneOffset() * 60 * 1000);
        var now = new Date().getTime() / 1000;
        var date = new Date(day);
        var cell = {
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
        cell.date = date.getTime() / 1000;
        if (qoute.name == 'Запись на прием') {
            cell.label = ScheduleService.addZIONTime(cell.hour) + ':' + ScheduleService.addZIONTime(cell.minute);
            if (item.listRecords) {
                for (var kRec in item.listRecords) {
                    if (cell.date == item.listRecords[kRec].dateRecord) {
                        var userRecord = item.listRecords[kRec].user;
                        cell.records.push(item.listRecords[kRec]);
                        cell.title += userRecord.surname + ' ' + userRecord.name.charAt(0) + '.' + userRecord.patron.charAt(0) + '.; ';
                    }
                }
            }
            if (cell.records.length < 1) {
                cell.title = (now + item.stepSchedule < cell.date ? 'Время доступно для записи' : 'Запись на прошедший временной интервал недоступна');
            }
            if (cell.records.length > 0) {
                cell.elemClass += ' b-schedule__item-record-true';
            }
            cell.isRecord = qoute.isRecord;
        }
        else {
            cell.label = qoute.name;
            cell.isPopup = false;
        }
        item.listCells.push(cell);
    }
    function ckeckAllowedCreateRecord(cell, item, options) {
        var now = new Date().getTime() / 1000;
        if ((cell.date && (now + item.stepSchedule) > cell.date) || !cell.isRecord) {
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
    function maxScheduleHeader() {
        var maxHeader = Math.max.apply(Math, $(".b-schedule__item-head-cnt").map(function () {
            return $(this).outerHeight();
        }).get());
        schedule.maxHeightHead = maxHeader;
        $('.b-schedule__item-cntnt').css('margin-top', maxHeader + 'px');
        schedule.maxHeigthName = Math.max.apply(Math, $(".b-schedule__item-name").map(function () {
            return $(this).height();
        }).get());
        schedule.maxHeigthSpec = Math.max.apply(Math, $(".b-schedule__item-spec").map(function () {
            return $(this).height();
        }).get());
        schedule.maxHeigthAdrec = Math.max.apply(Math, $(".b-schedule__item-adrec").map(function () {
            return $(this).height();
        }).get());
        var maxHeight = Math.max.apply(Math, $(".b-schedule__item").map(function () {
            return $(this).outerHeight();
        }).get());
        $(".b-schedule__item").height(maxHeight);
        $('.b-schedule__list').scrollTop(1);
        $('.b-schedule__list').scrollTop(0);
        $('.b-schedule__list').scrollLeft(1);
        $('.b-schedule__list').scrollLeft(0);
        if ($('.b-schedule__list').width() > $('.b-schedule__list-content').width()) {
            schedule.xScrollbar.css('display', 'none');
            schedule.xScrollbarArrow.css('display', 'none');
        }
        else {
            schedule.xScrollbar.css('display', 'block');
            schedule.xScrollbarArrow.css('display', 'block');
        }
        if ($('.b-schedule__list').height() > $('.b-schedule__list-content').height()) {
            schedule.yScrollbar.css('display', 'none');
            schedule.yScrollbarArrow.css('display', 'none');
        }
        else {
            schedule.yScrollbar.css('display', 'block');
            schedule.yScrollbarArrow.css('display', 'block');
        }
    }
    $('.b-schedule__list').scroll(function () {
        var scrollTop = $('.b-schedule__list').scrollTop();
        $('.b-schedule__item-head').css('top', scrollTop + 'px');
        if ($(".b-schedule__item .b-schedule__item-graf:not(.collapsed)").length < 1) {
            $(".b-schedule__item-name").height(schedule.maxHeigthName);
            $(".b-schedule__item-spec").height(schedule.maxHeigthSpec);
            $(".b-schedule__item-adrec").height(schedule.maxHeigthAdrec);
        }
        else {
            $(".b-schedule__item-name").height('');
            $(".b-schedule__item-spec").height('');
            $(".b-schedule__item-adrec").height('');
        }
        $(".b-schedule__item").each(function () {
            var blockGraf = $(this).find('.b-schedule__item-graf');
            if (!blockGraf.attr('data-height')) {
                var heightHeaden_1 = 0;
                var maxHeight = Math.max.apply(Math, $(".b-schedule__item").map(function () {
                    return $(this).outerHeight();
                }).get());
                $(this).find('.b-schedule__item-head-cnt > div').each(function () {
                    heightHeaden_1 += $(this).outerHeight();
                });
                blockGraf.attr('data-height', $(blockGraf).outerHeight());
                blockGraf.attr('data-marginhead', schedule.maxHeightHead - heightHeaden_1);
                $(".b-schedule__item").height(maxHeight);
            }
            if (scrollTop > (blockGraf.attr('data-height') / 2 + parseInt(blockGraf.attr('data-marginhead')))) {
                $(blockGraf).addClass('collapsed');
            }
            else {
                $(blockGraf).removeClass('collapsed');
            }
        });
    });
    $scope.$on('renderSchedule', function () {
        renderList();
    });
    var el = document.querySelector('.b-schedule__list');
    Ps.initialize(el);
});
angular
    .module('root')
    .controller('SpecialistController', function SpecialistController($rootScope, DataService) {
    var special = this;
    special.list = DataService.get('listDr');
    special.list.sort(sortSpecialist);
    special.checkAll = function () {
        setStateItems(true);
    };
    special.uncheckAll = function () {
        setStateItems(false);
    };
    function setStateItems(checked) {
        if (!special.list && typeof special.list !== typeof [])
            return;
        special.list.forEach(function (element) {
            element.checked = checked;
        });
        special.selected();
    }
    function sortSpecialist(a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        var specialtyA = a.specialty.toUpperCase();
        var specialtyB = b.specialty.toUpperCase();
        if (nameA < nameB)
            return -1;
        else if (nameA > nameB)
            return 1;
        if (specialtyA < specialtyB)
            return -1;
        else if (specialtyA > specialtyB)
            return 1;
        return 0;
    }
    special.selected = function () {
        var options = DataService.get('listOption');
        var selectedDr = [];
        special.list.forEach(function (specialist) {
            if (specialist.checked) {
                selectedDr.push(specialist);
            }
        });
        options.listDr = selectedDr.length > 0 ? selectedDr : '';
        DataService.set('options', options);
        $rootScope.$broadcast('updateDatepicker');
    };
    var el = document.querySelector('.b-spec__list');
    Ps.initialize(el);
    setTimeout(function () {
        if ($('.b-spec__list').height() >= $('.b-spec__list > div').height()) {
            $('.ps-scrollbar-y-rail').css('display', 'none');
        }
        else {
            $('.ps-scrollbar-y-rail').css('display', 'block');
        }
    });
});
angular
    .module('root')
    .service('DataService', function DataService() {
    var self = this;
    var data = {
        listUser: [],
        listDr: {},
        listRecord: [],
        listOption: {
            user: '',
            date: '',
            listDr: '',
            viewDays: 1
        },
    };
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    var dateNow = date.getTime() / 1000;
    date.setDate(22);
    var monday = date.getTime() / 1000;
    data.listUser = [
        { id: 1, name: 'Иван', surname: 'Иванов', patron: 'Иванович', dateBD: '11.11.2011', numPolicOMS: 1111111111111111 },
        { id: 2, name: 'Алексей', surname: 'Алексеев', patron: 'Алексеевич', dateBD: '22.12.1922', numPolicOMS: 2222222222222222 },
        { id: 3, name: 'Петр', surname: 'Петров', patron: 'Петрович', dateBD: '01.01.1990', numPolicOMS: 3333333333333333 },
        { id: 4, name: 'Сергей', surname: 'Сергеев', patron: 'Сергеевич', dateBD: '02.02.2002', numPolicOMS: 4444444444444444 },
        { id: 5, name: 'Василий', surname: 'Васильев', patron: 'Васильевич', dateBD: '09.09.1949', numPolicOMS: 5555555555555555 }
    ];
    data.listDr = [
        {
            id: 1,
            name: 'Григорьева Г.Г.',
            specialty: 'Терапевт',
            institution: 'ГП №128',
            room: '110',
            dateStartWork: (dateNow - (60 * 60 * 24)),
            dateEndWork: (dateNow + (60 * 60 * 24 * 60)),
            start: (60 * 60 * 10),
            end: (60 * 60 * 20),
            listWorkWeekDay: [1, 2, 3, 4, 5],
            startWD: 1,
            endWD: 5,
            stepSchedule: (30 * 60),
            quots: [
                { name: 'Запись на прием', start: (60 * 60 * 10), end: (60 * 60 * 14), isRecord: true },
                { name: 'Запись на прием', start: (60 * 60 * 15), end: (60 * 60 * 20), isRecord: true },
                { name: 'Врач не работает', start: (60 * 60 * 14), end: (60 * 60 * 15), isRecord: false },
            ],
            listRecords: [
                {
                    idUser: 1,
                    dateRecord: dateNow + (60 * 60 * 10),
                    time: (60 * 60 * 10),
                    user: { id: 1, name: 'Иван', surname: 'Иванов', patron: 'Иванович', dateBD: '11.11.2011', numPolicOMS: 1111111111111111 },
                },
                {
                    idUser: 2,
                    dateRecord: dateNow + (60 * 60 * 10),
                    time: (60 * 60 * 10),
                    user: { id: 2, name: 'Алексей', surname: 'Алексеев', patron: 'Алексеевич', dateBD: '22.12.1922', numPolicOMS: 2222222222222222 },
                },
                {
                    idUser: 3,
                    dateRecord: dateNow + (60 * 60 * 10) + (60 * 30),
                    time: (60 * 60 * 10) + (60 * 30),
                    user: { id: 3, name: 'Петр', surname: 'Петров', patron: 'Петрович', dateBD: '01.01.1990', numPolicOMS: 3333333333333333 },
                },
            ],
            checked: false
        },
        {
            id: 2,
            name: 'Сидорова С.С.',
            specialty: 'Терапевт',
            institution: 'ГП №128',
            room: '120',
            dateStartWork: (dateNow - (60 * 60 * 24)),
            dateEndWork: (dateNow + (60 * 60 * 24 * 60)),
            start: (60 * 60 * 8),
            end: (60 * 60 * 15),
            listWorkWeekDay: [1, 2, 3, 4],
            startWD: 1,
            endWD: 5,
            stepSchedule: 30 * 60,
            quots: [
                { name: 'Запись на прием', start: (60 * 60 * 10), end: (60 * 60 * 15), isRecord: true },
                { name: 'Обучение', start: (60 * 60 * 10), end: (60 * 60 * 15), listDaysWeek: [1], isRecord: false },
            ],
            listRecords: [
                {
                    idUser: 4,
                    dateRecord: monday + (60 * 60 * 12),
                    time: (60 * 60 * 12),
                    user: { id: 4, name: 'Сергей', surname: 'Сергеев', patron: 'Сергеевич', dateBD: '02.02.2002', numPolicOMS: 4444444444444444 },
                },
            ],
            checked: false
        },
        {
            id: 3,
            name: 'Сидорова С.С.',
            specialty: 'Терапевт',
            institution: 'ГП №128',
            room: '130',
            dateStartWork: (dateNow - (60 * 60 * 24)),
            dateEndWork: (dateNow + (60 * 60 * 24 * 30)),
            start: (60 * 60 * 14),
            end: (60 * 60 * 18),
            listWorkWeekDay: [5, 6],
            startWD: 5,
            endWD: 6,
            stepSchedule: 60 * 10,
            quots: [
                { name: 'Запись на прием', start: (60 * 60 * 14), end: (60 * 60 * 18), isRecord: true },
            ],
            listRecords: [],
            checked: false
        },
        {
            id: 4,
            name: 'Елисеева Е.Е.',
            specialty: 'Офтальмолог',
            institution: 'ГП №128',
            room: '140',
            dateStartWork: (dateNow - (60 * 60 * 24)),
            dateEndWork: (dateNow + (60 * 60 * 24 * 60)),
            start: (60 * 60 * 8),
            end: (60 * 60 * 18),
            listWorkWeekDay: [1, 2, 3, 4, 5],
            startWD: 1,
            endWD: 5,
            stepSchedule: 60 * 30,
            quots: [
                { name: 'Запись на прием', start: (60 * 60 * 10), end: (60 * 60 * 17 + (60 * 45)), isRecord: true },
                { name: 'Работа с документами', start: (60 * 60 * 14 + (60 * 30)), end: (60 * 60 * 14 + (60 * 55)), isRecord: false },
                { name: 'Работа с документами', start: (60 * 60 * 16 + (60 * 20)), end: (60 * 60 * 16 + (60 * 40)), isRecord: false },
            ],
            listRecords: [],
            checked: false
        },
        {
            id: 5,
            name: 'Константинова-Щедрина А.А.',
            specialty: 'Офтальмолог',
            institution: 'ГП №128',
            room: '150',
            dateStartWork: (dateNow - (60 * 60 * 24)),
            dateEndWork: (dateNow + (60 * 60 * 24 * 60)),
            start: (60 * 60 * 9),
            end: (60 * 60 * 21),
            listWorkWeekDay: [2, 3, 4, 5, 6],
            startWD: 2,
            endWD: 6,
            stepSchedule: 60 * 30,
            quots: [
                { name: 'Запись на прием', start: (60 * 60 * 9), end: (60 * 60 * 21), listDaysWeek: [3, 4, 5, 6] },
            ],
            listRecords: [],
            checked: false
        },
    ];
    this.get = function (nameData) {
        return data[nameData];
    };
    this.set = function (nameData, obj) {
        data[nameData] = obj;
    };
});
angular
    .module('root')
    .service('ScheduleService', function ScheduleService(DataService, $filter) {
    var self = this;
    self.sortScheduleCells = function (a, b) {
        if (a.hour < b.hour)
            return -1;
        else if (a.hour > b.hour)
            return 1;
        if (a.minute < b.minute)
            return -1;
        else if (a.minute > b.minute)
            return 1;
        return 0;
    };
    self.sortScheduleColumn = function (a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        var specialtyA = a.specialty.toUpperCase();
        var specialtyB = b.specialty.toUpperCase();
        if (a.dateDay < b.dateDay)
            return -1;
        else if (a.dateDay > b.dateDay)
            return 1;
        if (nameA < nameB)
            return -1;
        else if (nameA > nameB)
            return 1;
        if (specialtyA < specialtyB)
            return -1;
        else if (specialtyA > specialtyB)
            return 1;
        if (a.start < b.start)
            return -1;
        else if (a.start > b.start)
            return 1;
        return 0;
    };
    self.sortQuotsWorking = function (a, b) {
        return (a.start < b.start) ? -1 : (a.start > b.start ? 1 : 0);
    };
    self.addZIONTime = function (time) {
        return time < 10 ? '0' + time : time;
    };
    self.getTimeWorcking = function (spec) {
        var start = (spec.start * 1000) + (new Date((spec.start * 1000)).getTimezoneOffset() * 60 * 1000);
        var end = (spec.end * 1000) + (new Date((spec.end * 1000)).getTimezoneOffset() * 60 * 1000);
        return $filter('date')(start, 'HH:mm') + '-' + $filter('date')(end, 'HH:mm');
    };
    self.dataItemFromSpectialist = function (item, specialist) {
        for (var elem in specialist) {
            if (elem.charAt(0) == '$')
                continue;
            if (elem == 'quots') {
                if (specialist[elem].length < 0)
                    continue;
                var qElem = [];
                for (var kQElem = specialist[elem].length - 1; kQElem >= 0; kQElem--) {
                    var qElem2 = {};
                    for (var kQElem2 in specialist[elem][kQElem]) {
                        qElem2[kQElem2] = specialist[elem][kQElem][kQElem2];
                    }
                    qElem.push(qElem2);
                }
                item[elem] = qElem;
            }
            else if (elem == 'listRecords') {
                if (specialist[elem].length < 0)
                    continue;
                var qElem = [];
                for (var kQElem = specialist[elem].length - 1; kQElem >= 0; kQElem--) {
                    var qElem2 = {};
                    for (var kQElem2 in specialist[elem][kQElem]) {
                        qElem2[kQElem2] = specialist[elem][kQElem][kQElem2];
                    }
                    qElem.push(qElem2);
                }
                item[elem] = qElem;
            }
            else {
                item[elem] = specialist[elem];
            }
        }
        return item;
    };
    self.getRecordToStep = function (item, day, time) {
        var records = [];
        for (var kRec in item.listRecords) {
            var date = new Date(day);
            var timeI = (time * 1000) + (new Date((time * 1000)).getTimezoneOffset() * 60 * 1000);
            timeI = date.setHours(new Date(timeI).getHours(), new Date(timeI).getMinutes(), 0, 0);
            if (timeI / 1000 == item.listRecords[kRec].dateRecord) {
                records.push(item.listRecords[kRec]);
            }
        }
        return records;
    };
    self.ckeckAllowedDeleteRecord = function (cell, item) {
        var now = new Date().getTime() / 1000;
        if (cell.date && (now + item.stepSchedule) > cell.date) {
            return false;
        }
        if (cell.recordUser && cell.recordUser.name == '') {
            return false;
        }
        return true;
    };
});
