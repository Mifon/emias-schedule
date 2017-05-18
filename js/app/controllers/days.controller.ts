'use strict';

angular
	.module('root')
	.controller('DaysController', function DaysController($scope, $rootScope, dataService) {
		let options = dataService.get('listOption');
		$scope.radioModel = options.viewDays;
		$scope.changeDays = function() {
			options = dataService.get('listOption');
			options.viewDays = $scope.radioModel;
			dataService.set('options', options);
			$rootScope.$broadcast('updateDatepicker');
		}
	});