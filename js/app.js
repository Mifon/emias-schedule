'use strict';
angular.module('root', ['ui.bootstrap'])
    .constant('CONFIG', {
    DebugMode: true,
    StepCounter: 0,
});
angular.module('root').controller('DropdownCtrl', function ($scope, $log) {
    $scope.items = [
        'The first choice!',
        'And another choice for you.',
        'but wait! A third!'
    ];
    $scope.status = {
        isopen: false
    };
    $scope.toggled = function (open) {
        $log.log('Dropdown is now: ', open);
    };
    $scope.toggleDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
});
angular.module('root').controller('DatepickerCtrl', function ($scope, $rootScope, dataService) {
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
    dpicker.maxDate = new Date(2020, 5, 22);
    dpicker.btnDisabled = 'disabled';
    dpicker.btnDisabledTitle = 'Выберите доступный ресурс';
    dpicker.selectedDate = '';
    dpicker.dt = '';
    dpicker.select = function (str) {
        var option = dataService.get('listOption');
        option.date = dpicker.dt;
        if (str != 'change') {
            dpicker.selectedDate = dpicker.dt;
            $('.b-date ul.dropdown-menu').remove();
        }
        dataService.set('listOption', option);
        $rootScope.$broadcast('renderSchedule');
    };
    dpicker.dateReset = function () {
        var option = dataService.get('listOption');
        dpicker.dt = dpicker.selectedDate;
        option.date = dpicker.selectedDate;
        $('.b-date ul.dropdown-menu').remove();
        dataService.set('listOption', option);
        $rootScope.$broadcast('renderSchedule');
    };
    dpicker.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
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
    dpicker.dayClass = function (date, mode) {
        var timeDate = date.getTime();
        var now = new Date().getTime();
        var strClass = 'b-date__select';
        if (timeDate > (now + (1000 * 60 * 60 * 24 * 14)) || timeDate < (now - (1000 * 60 * 60 * 24))) {
            strClass += ' disabled js-date-disabled';
        }
        else if (date.getDay() === 0 || date.getDay() === 6) {
            strClass += ' disabled-day-off';
        }
        else {
            strClass += ' js-date-select';
        }
        return strClass;
    };
    $scope.$on('updateDatepicker', function () {
        var options = dataService.get('listOption');
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
angular.module('root').controller('DaysController', function ($scope, $rootScope, dataService) {
    var options = dataService.get('listOption');
    $scope.radioModel = options.viewDays;
    $scope.changeDays = function () {
        options = dataService.get('listOption');
        options.viewDays = $scope.radioModel;
        dataService.set('options', options);
        $rootScope.$broadcast('updateDatepicker');
    };
});
angular.module('root').controller('PatientController', function (dataService) {
    var patient = this;
    patient.user = '';
    patient.list = dataService.get('listUser');
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
        var option = dataService.get('listOption');
        patient.user = item;
        patient.btnDisabled = '';
        patient.listRes = '';
        patient.inputSearch = '';
        option.user = item;
        dataService.set('listOption', option);
    };
    patient.relogUser = function () {
        var option = dataService.get('listOption');
        patient.user = '';
        patient.btnDisabled = 'disabled';
        option.user = '';
        dataService.set('listOption', option);
    };
});
angular.module('root').controller('ScheduleController', function ($scope, $modal, dataService) {
    var schedule = this;
    schedule.showList = false;
    schedule.list = {};
    schedule.classBlock = "emptyBlock";
    schedule.openedCell = '';
    schedule.defaultInfoTextEmptySchedule = 'Для просмотра расписания выберите хотя бы один Доступный ресурс.';
    schedule.infoTextEmptySchedule = schedule.defaultInfoTextEmptySchedule;
    schedule.textError = '';
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
    schedule.cellOpen = function (item, cell, self) {
        var options = dataService.get('listOption');
        var elemCell = self.currentTarget;
        var target = self.target;
        var recordUser = { doctorName: '', doctorRoom: '', surname: '', name: '', patron: '' };
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
            schedule.dataPopup.time += addZIONTime(new Date(cell.time + (item.stepSchedule * 1000)).getHours()) + ':';
            schedule.dataPopup.time += addZIONTime(new Date(cell.time + (item.stepSchedule * 1000)).getMinutes());
        }
        else {
            schedule.dataPopup.title = recordUser.surname + ' ' + recordUser.name.charAt(0) + '.' + recordUser.patron.charAt(0) + '.';
            schedule.dataPopup.time = '';
            schedule.dataPopup.isIconUser = true;
        }
        schedule.dataPopup.btnCreateRecord.isView = ckeckAllowedCreateRecord(cell, item, options);
        schedule.dataPopup.btnDeleteRecord.isView = (cell.records && cell.records.length > 0);
        schedule.dataPopup.btnViewRecord.isView = (recordUser.name != '');
    };
    function getPopupDate() {
        var data = {
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
                var options = dataService.get('listOption');
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
                dataService.set('listOption', options);
                renderList();
                schedule.openModalOk();
            },
            deleteRecord: function (cell, item) {
                var options = dataService.get('listOption');
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
        return data;
    }
    schedule.dataPopup = getPopupDate();
    function renderList() {
        var options = dataService.get('listOption');
        var today = new Date();
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
                var item = { listCells: [], timeWorking: '', dateDay: new Date(), quots: {}, stepSchedule: 0, listRecords: [] };
                var keyError = 0;
                specialist.listWorkWeekDay;
                var todayWeekDay = day.getDay() == 0 ? 7 : day.getDay();
                if (!specialist.listWorkWeekDay || specialist.listWorkWeekDay.indexOf(todayWeekDay) < 0) {
                    keyError = 1;
                }
                if (keyError) {
                    if (keyError == 1) {
                        schedule.infoTextEmptySchedule = 'Выберете другую дату для отображения расписания';
                    }
                    continue;
                }
                item = dataItemFromSpectialist(item, specialist);
                item.listCells = [];
                item.timeWorking = getTimeWorcking(item);
                item.dateDay = day;
                for (var k in item.quots) {
                    var qoute = item.quots[k];
                    if (qoute.name == 'Запись на прием') {
                        for (var i = qoute.start; i < qoute.end; i += item.stepSchedule) {
                            setCellData(qoute, i, item, day);
                        }
                    }
                    else {
                        setCellData(qoute, qoute.start, item, day);
                    }
                }
                item.listCells.sort(sortScheduleCells);
                schedule.list.push(item);
            }
        }
        schedule.list.sort(sortScheduleColumn);
        $('.b-schedule__list-content').css('width', (161 * schedule.list.length) + 'px');
        schedule.showList = schedule.list && schedule.list.length > 0;
    }
    function sortScheduleCells(a, b) {
        if (a.hour < b.hour)
            return -1;
        else if (a.hour > b.hour)
            return 1;
        if (a.minute < b.minute)
            return -1;
        else if (a.minute > b.minute)
            return 1;
        return 0;
    }
    function sortScheduleColumn(a, b) {
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
    }
    function getTimeWorcking(spec) {
        var strTime = '';
        var start = (spec.start * 1000) + (new Date((spec.start * 1000)).getTimezoneOffset() * 60 * 1000);
        var end = (spec.end * 1000) + (new Date((spec.end * 1000)).getTimezoneOffset() * 60 * 1000);
        var startHour = new Date(start).getHours();
        var startMinute = new Date(start).getMinutes();
        var endHour = new Date(end).getHours();
        var endMinute = new Date(end).getMinutes();
        strTime += addZIONTime(startHour);
        strTime += ':' + addZIONTime(startMinute);
        strTime += '-' + addZIONTime(endHour);
        strTime += ':' + addZIONTime(endMinute);
        return strTime;
    }
    function addZIONTime(time) {
        return time < 10 ? '0' + time : time;
    }
    function dataItemFromSpectialist(item, specialist) {
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
    }
    function setCellData(qoute, timeStart, item, day) {
        var time = (timeStart * 1000) + (new Date((timeStart * 1000)).getTimezoneOffset() * 60 * 1000);
        var now = new Date().getTime() / 1000;
        var date = new Date(day);
        var cell = {
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
        cell.date = date.getTime() / 1000;
        if (qoute.name == 'Запись на прием') {
            cell.label = addZIONTime(cell.hour) + ':' + addZIONTime(cell.minute);
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
                cell.title = (now < cell.date ? 'Время доступно для записи' : 'Запись на прошедший временной интервал недоступна');
            }
        }
        else {
            cell.label = qoute.name;
            cell.isPopup = false;
        }
        item.listCells.push(cell);
    }
    function ckeckAllowedCreateRecord(cell, item, options) {
        var now = new Date().getTime() / 1000;
        if (cell.time && (now + item.stepSchedule) > cell.time) {
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
                    return false;
                }
            }
        }
        return true;
    }
    $scope.$on('renderSchedule', function () {
        renderList();
    });
    var el = document.querySelector('.b-schedule__list');
    Ps.initialize(el);
});
angular.module('root')
    .controller('specialistController', function specialistController($rootScope, dataService) {
    var special = this;
    special.list = dataService.get('listDr');
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
    special.selected = function () {
        var options = dataService.get('listOption');
        var selectedDr = [];
        for (var key in special.list) {
            if (special.list[key].checked) {
                selectedDr.push(special.list[key]);
            }
        }
        options.listDr = selectedDr.length > 0 ? selectedDr : '';
        dataService.set('options', options);
        $rootScope.$broadcast('updateDatepicker');
    };
    var el = document.querySelector('.b-spec__list');
    Ps.initialize(el);
});
angular.module('root').service('dataService', function () {
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
                { name: 'Запись на прием', start: (60 * 60 * 10), end: (60 * 60 * 14) },
                { name: 'Запись на прием', start: (60 * 60 * 15), end: (60 * 60 * 20) },
                { name: 'Врач не работает', start: (60 * 60 * 14), end: (60 * 60 * 15) },
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
                }
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
                { name: 'Запись на прием', start: (60 * 60 * 10), end: (60 * 60 * 15) },
                { name: 'Обучение', start: (60 * 60 * 10), end: (60 * 60 * 15), listDaysWeek: [1] },
            ],
            listRecords: [
                {
                    idUser: 4,
                    dateRecord: monday + (60 * 60 * 12),
                    time: (60 * 60 * 12),
                    user: { id: 4, name: 'Сергей', surname: 'Сергеев', patron: 'Сергеевич', dateBD: '02.02.2002', numPolicOMS: 4444444444444444 },
                }
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
                { name: 'Запись на прием', start: (60 * 60 * 14), end: (60 * 60 * 18) },
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
                { name: 'Запись на прием', start: (60 * 60 * 10), end: (60 * 60 * 17 + (60 * 45)) },
                { name: 'Работа с документами', start: (60 * 60 * 14 + (60 * 30)), end: (60 * 60 * 14 + (60 * 55)) },
                { name: 'Работа с документами', start: (60 * 60 * 16 + (60 * 20)), end: (60 * 60 * 16 + (60 * 40)) },
            ],
            listRecords: [],
            checked: false
        },
        {
            id: 5,
            name: 'Константинова-Щедрина А.А.',
            specialty: 'Офтальмоло',
            institution: 'ГП №128',
            room: '150',
            dateStartWork: (dateNow - (60 * 60 * 24)),
            dateEndWork: (dateNow + (60 * 60 * 24 * 60)),
            start: (60 * 60 * 8),
            end: (60 * 60 * 15),
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
