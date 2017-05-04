'use strict';

angular.module('root')
	.controller('specialistController', function specialistController(dataService) {
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
		}
	});