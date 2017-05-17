'use strict';

angular.module('root')
	.controller('specialistController', function specialistController($rootScope, dataService) {
		var special = this;

		special.list = dataService.get('listDr');
		special.list.sort(sortSpecialist);

		special.checkAll = function () {
			setStateItems(true);
		}
		special.uncheckAll = function () {
			setStateItems(false);
		}
		function setStateItems(checked) {
			if (!special.list && typeof special.list !== typeof [])
				return;

			special.list.forEach(element => {
				element.checked = checked;
			});

			special.selected();
		}
		function sortSpecialist(a, b) {
			var nameA = a.name.toUpperCase();
			var nameB = b.name.toUpperCase();
			var specialtyA = a.specialty.toUpperCase();
			var specialtyB = b.specialty.toUpperCase();

			if (nameA < nameB) return -1;
			else if (nameA > nameB) return 1;

			if (specialtyA < specialtyB) return -1;
			else if (specialtyA > specialtyB) return 1;

			return 0;
		}

		special.selected = function() {
			let options = dataService.get('listOption');
			let selectedDr = [];
			for (var key in special.list) {
				if (special.list[key].checked) {
					selectedDr.push(special.list[key]);
				}
			}
			options.listDr = selectedDr.length > 0 ? selectedDr : '';
			dataService.set('options', options);
			$rootScope.$broadcast('updateDatepicker');
		}

		var el = document.querySelector('.b-spec__list');
		Ps.initialize(el);
	});