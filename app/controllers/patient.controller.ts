'use strict';

// блок пациента
angular
	.module('root')
	.controller('PatientController', function PatientController(DataService) {
		let patient = this;

		patient.user = '';
		patient.list = DataService.get('listUser');
		patient.listRes = '';
		patient.btnDisabled = 'disabled';

		patient.inputChange = function (e) {
			if (patient.inputSearch.length >= 3) {
				patient.listRes = patient.list;
			} else {
				patient.listRes = '';
			}
		}

		patient.selectedUser = function (item) {
			let option = DataService.get('listOption');

			patient.user = item;
			patient.btnDisabled = '';
			patient.listRes = '';
			patient.inputSearch = '';

			option.user = item;
			DataService.set('listOption', option);
		}

		patient.relogUser = function () {
			let option = DataService.get('listOption');

			patient.user = '';
			patient.btnDisabled = 'disabled';

			option.user = '';
			DataService.set('listOption', option);
		}
	})
	.filter('searchPatient', function(){
		return function(input, uppercase) {
			let listout = [];
			let sting = parseInt(uppercase.charAt(0));
			let isInt = !isNaN(sting);
			input.forEach(user => {
				let strSearch = isInt ? user.numPolicOMS : user.surname;
				if (String(strSearch).toLowerCase().indexOf(uppercase.toLowerCase())+1) {
					listout.push(user);
				}
			});
		    return listout;
		}
	});