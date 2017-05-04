'use strict';

angular.module('root').controller('ScheduleController', function(dataService) {
	let scheduleList = this;
	let showList     = false;

	scheduleList.list = {};
	scheduleList.classBlock = "emptyBlock";
})