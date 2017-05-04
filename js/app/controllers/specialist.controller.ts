'use strict';

angular.module('root')
	.controller('specialistController', function specialistController($rootScope, dataService) {
		var special = this;

		special.list = dataService.get('listDr');

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

		special.selected = function() {
			let options = dataService.get('listOption');
			let selectedDr = [];
			for (var key in special.list) {
				if (special.list[key].checked) {
					selectedDr.push(special.list[key]);
				}
			}
			options.listDr = selectedDr.length > 0 ? selectedDr : '';
			dataService.set('options');
			$rootScope.$broadcast('updateDatepicker');
		}
	});