'use strict';

// селекты
angular
	.module('root')
	.controller('DropdownMenuController', function DropdownMenuController($scope, $log) {
		$scope.status = {
			isopen: false
		};

		$scope.toggleDropdown = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.status.isopen = !$scope.status.isopen;
		};
	});