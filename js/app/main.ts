'use strict';

angular.module('root', ['ui.bootstrap']);


// селекты
angular.module('root').controller('DropdownCtrl', function ($scope, $log) {
	$scope.items = [
		'The first choice!',
		'And another choice for you.',
		'but wait! A third!'
	];

	$scope.status = {
		isopen: false
	};

	$scope.toggled = function(open) {
		$log.log('Dropdown is now: ', open);
	};

	$scope.toggleDropdown = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.status.isopen = !$scope.status.isopen;
	};
});



// блок доступного ресурса
angular.module('root').controller('specialist', function(dataService) {
	var special = this;
	special.list = dataService.get('listDr');
})



var el = document.querySelector('.b-spec__list');
Ps.initialize(el);