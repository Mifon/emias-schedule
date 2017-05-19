'use strict';

angular
	.module('root')
	.controller('SpecialistController', function SpecialistController($rootScope, DataService) {
		var special = this;

		special.list = DataService.get('listDr');
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

		special.selected = function () {
			let options = DataService.get('listOption');
			let selectedDr = [];
			special.list.forEach(specialist => {
				if (specialist.checked) {
					selectedDr.push(specialist);
				}
			});
			options.listDr = selectedDr.length > 0 ? selectedDr : '';
			DataService.set('options', options);
			$rootScope.$broadcast('updateDatepicker');
		}

		// инициализация скролла
		var el = document.querySelector('.b-spec__list');
		Ps.initialize(el);

		// отображение скролла
		setTimeout(function () {
			if ($('.b-spec__list').height() >= $('.b-spec__list > div').height()) {
				$('.ps-scrollbar-y-rail').css('display', 'none');
			} else {
				$('.ps-scrollbar-y-rail').css('display', 'block');
			}
		})
	});