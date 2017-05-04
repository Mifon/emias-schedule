'use strict';

angular.module('root').controller('ScheduleController', function($scope, dataService) {
	let scheduleList = this;

	scheduleList.showList     = false;
	scheduleList.list = {};
	scheduleList.classBlock = "emptyBlock";

	scheduleList.update = function() {
		console.log('ok');
		// renderList();
	}

	function renderList() {
		let options = dataService.get('listOption');
		console.log(options);

		scheduleList.list = options.listDr;
		scheduleList.showList = scheduleList.list && scheduleList.list.length > 0;
	}

	$scope.$on('renderSchedule', function(){
		renderList();
	});
})