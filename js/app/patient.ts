'use strict';

// блок пациента
angular.module('root').controller('PatientController', function(dataService) {
	let patient = this;

	patient.user = '';
	patient.list = dataService.get('listUser');
	patient.listRes = '';
	patient.btnDisabled = 'disabled';

	patient.inputChange = function(e) {
		if (patient.inputSearch.length >= 3) {
			patient.listRes = patient.list;
		} else {
			patient.listRes = '';
		}
	}

	patient.selectedUser = function(item) {
		let option = dataService.get('listOption');

		patient.user = item;
		patient.btnDisabled = '';
		patient.listRes = '';
		patient.inputSearch = '';

		option.user = item;
		dataService.set('listOption', option);
	}

	patient.relogUser = function() {
		let option = dataService.get('listOption');

		patient.user = '';
		patient.btnDisabled = 'disabled';

		option.user = '';
		dataService.set('listOption', option);
	}
})