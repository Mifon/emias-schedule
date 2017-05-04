'use strict';
angular.module('root', ['ui.bootstrap']);
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
angular.module('root').controller('specialist', function (dataService) {
    var special = this;
    special.list = dataService.get('listDr');
});
var el = document.querySelector('.b-spec__list');
Ps.initialize(el);
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
angular.module('root').controller('DatepickerCtrl', function ($scope, dataService) {
    var dpicker = this;
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
    dpicker.select = function (str) {
        var option = dataService.get('listOption');
        option.date = dpicker.dt;
        if (str != 'change') {
            dpicker.selectedDate = dpicker.dt;
            $('.b-date ul.dropdown-menu').remove();
        }
        dataService.set('listOption', option);
    };
    dpicker.dateReset = function () {
        var option = dataService.get('listOption');
        dpicker.dt = dpicker.selectedDate;
        option.date = dpicker.selectedDate;
        $('.b-date ul.dropdown-menu').remove();
        dataService.set('listOption', option);
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
        if (timeDate > (new Date().getTime() + (60000 * 60 * 24 * 14))) {
            return 'js-date-disabled';
        }
        return 'js-date-select';
    };
    $('body').delegate('.js-date-select', 'click', function () {
        dpicker.select();
    });
});
angular.module('root').controller('ScheduleController', function (dataService) {
    var scheduleList = this;
    var showList = false;
    scheduleList.list = {};
    scheduleList.classBlock = "emptyBlock";
});
angular.module('root').service('dataService', function () {
    var self = this;
    var data = {
        listUser: [],
        listDr: {},
        listRecord: [],
        listOption: {},
    };
    data.listUser = [
        { id: 1, name: 'Иван', surname: 'Иванов', patron: 'Иванович', dateBD: '11.11.2011', numPolicOMS: 1111111111111111 },
        { id: 2, name: 'Алексей', surname: 'Алексеев', patron: 'Алексеевич', dateBD: '22.12.1922', numPolicOMS: 2222222222222222 },
        { id: 3, name: 'Петр', surname: 'Петров', patron: 'Петрович', dateBD: '01.01.1990', numPolicOMS: 3333333333333333 },
        { id: 4, name: 'Сергей', surname: 'Сергеев', patron: 'Сергеевич', dateBD: '02.02.2002', numPolicOMS: 4444444444444444 },
        { id: 5, name: 'Василий', surname: 'Васильев', patron: 'Васильевич', dateBD: '09.09.1949', numPolicOMS: 5555555555555555 }
    ];
    data.listDr = {
        1: {
            id: 1,
            name: 'Григорьева Г.Г.',
            specialty: 'Терапевт',
            institution: 'ГП №128',
            room: '110',
            start: 10,
            end: 20,
            startWD: 1,
            endWD: 5,
            stepSchedule: 30 * 60,
            quots: [
                { name: 'Запись на прием', start: 10, end: 14 },
                { name: 'Запись на прием', start: 15, end: 20 },
                { name: 'Врач не работает', start: 14, end: 15 },
            ],
            checked: false
        },
        2: {
            id: 2,
            name: 'Сидорова С.С.',
            specialty: 'Терапевт',
            institution: 'ГП №128',
            room: '110',
            start: 10,
            end: 20,
            startWD: 1,
            endWD: 5,
            stepSchedule: 30 * 60,
            quots: [
                { name: 'Запись на прием', start: 10, end: 14 },
                { name: 'Запись на прием', start: 15, end: 20 },
                { name: 'Врач не работает', start: 14, end: 15 },
            ],
            checked: false
        }
    };
    this.get = function (nameData) {
        return data[nameData];
    };
    this.set = function (nameData, obj) {
        data[nameData] = obj;
    };
});
