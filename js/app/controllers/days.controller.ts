'use strict';

angular
	.module('root')
	.controller('DaysController', function DaysController($scope, $rootScope, DataService) {
		let options = DataService.get('listOption');
		$scope.radioModel = options.viewDays;
		$scope.changeDays = function() {
			options = DataService.get('listOption');
			options.viewDays = $scope.radioModel;
			DataService.set('options', options);
			$rootScope.$broadcast('updateDatepicker');
		}
	});