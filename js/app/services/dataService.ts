'use strict';

angular.module('root').service('dataService', function() {
	let self = this;
	let data = {
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
	let date = new Date();
	date.setHours(0, 0, 0, 0);
	let dateNow = date.getTime()/1000;
	date.setDate(22); // 22 мая, понедельник
	let monday = date.getTime()/1000;

	data.listUser = [
		{id:1, name:'Иван', surname:'Иванов', patron:'Иванович', dateBD:'11.11.2011', numPolicOMS:1111111111111111},
		{id:2, name:'Алексей', surname:'Алексеев', patron:'Алексеевич', dateBD:'22.12.1922', numPolicOMS:2222222222222222},
		{id:3, name:'Петр', surname:'Петров', patron:'Петрович', dateBD:'01.01.1990', numPolicOMS:3333333333333333},
		{id:4, name:'Сергей', surname:'Сергеев', patron:'Сергеевич', dateBD:'02.02.2002', numPolicOMS:4444444444444444},
		{id:5, name:'Василий', surname:'Васильев', patron:'Васильевич', dateBD:'09.09.1949', numPolicOMS:5555555555555555}
	];

	data.listDr = [
		{
			id:1,
			name: 'Григорьева Г.Г.',
			specialty: 'Терапевт',
			institution: 'ГП №128', // Муниципальное Учреждение
			room: '110',
			dateStartWork: (dateNow - (60*60*24)), // вчера
			dateEndWork: (dateNow + (60*60*24*60)), // через 2 месяца
			start: (60*60*10),
			end: (60*60*20),
			listWorkWeekDay: [1,2,3,4,5],
			startWD: 1,
			endWD: 5,
			stepSchedule: (30*60), // 30 минут
			quots: [
				{name:'Запись на прием', start:(60*60*10), end:(60*60*14)},
				{name:'Запись на прием', start:(60*60*15), end:(60*60*20)},
				{name:'Врач не работает', start:(60*60*14), end:(60*60*15)},
			],
			listRecords: [
				{
					idUser: 1,
					dateRecord: dateNow+(60*60*10),
					time: (60*60*10),
					user: {id:1, name:'Иван', surname:'Иванов', patron:'Иванович', dateBD:'11.11.2011', numPolicOMS:1111111111111111},
				},
				{
					idUser: 2,
					dateRecord: dateNow+(60*60*10),
					time: (60*60*10),
					user: {id:2, name:'Алексей', surname:'Алексеев', patron:'Алексеевич', dateBD:'22.12.1922', numPolicOMS:2222222222222222},
				},
				{
					idUser: 3,
					dateRecord: dateNow+(60*60*10)+(60*30),
					time: (60*60*10)+(60*30),
					user: {id:3, name:'Петр', surname:'Петров', patron:'Петрович', dateBD:'01.01.1990', numPolicOMS:3333333333333333},
				}
			],
			checked: false
		},
		{
			id:2,
			name: 'Сидорова С.С.',
			specialty: 'Терапевт',
			institution: 'ГП №128', // Муниципальное Учреждение
			room: '120',
			dateStartWork: (dateNow - (60*60*24)), // вчера
			dateEndWork: (dateNow + (60*60*24*60)), // через 2 месяца
			start: (60*60*8),
			end: (60*60*15),
			listWorkWeekDay: [1,2,3,4],
			startWD: 1,
			endWD: 5,
			stepSchedule: 30*60, // 30 минут
			quots: [
				{name:'Запись на прием', start:(60*60*10), end:(60*60*15)},
				{name:'Обучение', start:(60*60*10), end:(60*60*15), listDaysWeek:[1]},
			],
			listRecords: [
				{
					idUser: 4,
					dateRecord: monday+(60*60*12),
					time: (60*60*12),
					user: {id:4, name:'Сергей', surname:'Сергеев', patron:'Сергеевич', dateBD:'02.02.2002', numPolicOMS:4444444444444444},
				}
			],
			checked: false
		},
		{
			id:3,
			name: 'Сидорова С.С.',
			specialty: 'Терапевт',
			institution: 'ГП №128', // Муниципальное Учреждение
			room: '130',
			dateStartWork: (dateNow - (60*60*24)), // вчера
			dateEndWork: (dateNow + (60*60*24*30)), // через месяц
			start: (60*60*14),
			end: (60*60*18),
			listWorkWeekDay: [5,6],
			startWD: 5,
			endWD: 6,
			stepSchedule: 60*10, // 10 минут
			quots: [
				{name:'Запись на прием', start:(60*60*14), end:(60*60*18)},
			],
			listRecords: [],
			checked: false
		},
		{
			id:4,
			name: 'Елисеева Е.Е.',
			specialty: 'Офтальмолог',
			institution: 'ГП №128', // Муниципальное Учреждение
			room: '140',
			dateStartWork: (dateNow - (60*60*24)), // вчера
			dateEndWork: (dateNow + (60*60*24*60)), // через 2 месяца
			start: (60*60*8),
			end: (60*60*18),
			listWorkWeekDay: [1,2,3,4,5],
			startWD: 1,
			endWD: 5,
			stepSchedule: 60*30, // 30 минут
			quots: [
				{name:'Запись на прием', start:(60*60*10), end:(60*60*17+(60*45))},
				{name:'Работа с документами', start:(60*60*14+(60*30)), end:(60*60*14+(60*55))},
				{name:'Работа с документами', start:(60*60*16+(60*20)), end:(60*60*16+(60*40))},
			],
			listRecords: [],
			checked: false
		},
		{
			id:5,
			name: 'Константинова-Щедрина А.А.',
			specialty: 'Офтальмоло',
			institution: 'ГП №128', // Муниципальное Учреждение
			room: '150',
			dateStartWork: (dateNow - (60*60*24)), // вчера
			dateEndWork: (dateNow + (60*60*24*60)), // через 2 месяца
			start: (60*60*8),
			end: (60*60*15),
			listWorkWeekDay: [2,3,4,5,6],
			startWD: 2,
			endWD: 6,
			stepSchedule: 60*30, // 30 минут
			quots: [
				{name:'Запись на прием', start:(60*60*9), end:(60*60*21), listDaysWeek:[3,4,5,6]},
			],
			listRecords: [],
			checked: false
		},

	];

	// data.listRecord =

	this.get = function(nameData: string) {
		return data[nameData];
	}

	this.set = function(nameData: string, obj:object) {
		data[nameData] = obj;
		// console.log(obj);
	}
});