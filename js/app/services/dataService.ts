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
			step: 1
		},
	};

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
			start: 10,
			end: 20,
			startWD: 1,
			endWD: 5,
			stepSchedule: 30*60, // 30 минут
			quots: [
				{name:'Запись на прием', start:10, end:14},
				{name:'Запись на прием', start:15, end:20},
				{name:'Врач не работает', start:14, end:15},
			],
			checked: false
		},
		{
			id:2,
			name: 'Сидорова С.С.',
			specialty: 'Терапевт',
			institution: 'ГП №128', // Муниципальное Учреждение
			room: '110',
			start: 10,
			end: 20,
			startWD: 1,
			endWD: 5,
			stepSchedule: 30*60, // 30 минут
			quots: [
				{name:'Запись на прием', start:10, end:14},
				{name:'Запись на прием', start:15, end:20},
				{name:'Врач не работает', start:14, end:15},
			],
			checked: false
		}

	];

	// data.listRecord =

	this.get = function(nameData: string) {
		return data[nameData];
	}

	this.set = function(nameData: string, obj:object) {
		data[nameData] = obj;
	}
});