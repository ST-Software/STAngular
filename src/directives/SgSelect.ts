/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

  // http://plnkr.co/edit/Vu3KyTtTav9cSQSJYbHb?p=preview
  Module.directive("sgSelect", ["$parse",
		($parse) =>
	{
		return {
			restrict: "A",
			scope: {
				sgSelect: "@",
				sgSelectOriginalOptions: "=sgSelectOptions",
				sgSelectOptionsReadonly: "@",
				sgSelectValid: "&",
				sgSelectInitialValue: "=",
				ngModel: "@",
				ngDisabled: "=",
				ngRequired: "=",
				display: "@",
				ngReadOnly: "=",
				placeholder: "@",
				parentScopeLevel: "@",
        inputClass: "@",
			},
			templateUrl: "../directive/SgSelect.html",
			link: (scope, elm, attrs, ctrl) => {
				if (!scope.parentScopeLevel) scope.parentScopeLevel = 1;

				var modelGet = $parse(scope.ngModel),
					modelSet = modelGet.assign;

				var getParentScope = () => {
					var parentScope = scope.$parent;
					for (var i = 2; i <= scope.parentScopeLevel; i++) {
						parentScope = parentScope.$parent;
					}
					return parentScope;
				}

				scope.$watch('sgSelectOriginalOptions', () => {
					scope.sgSelectOptions = angular.copy(scope.sgSelectOriginalOptions);
					if (scope.sgSelectOptionsReadonly)
					{
						scope.sgSelectOptions = getParentScope()[scope.sgSelectOptionsReadonly](scope.sgSelectOptions, scope.sgSelectInitialValue);
					}
				});

				var setItem = (item) => {
					if (item) {
						scope.selectedId = item.Id;
						scope.selectedItemValue = item[scope.display];
					} else {
						scope.selectedId = null;
						scope.selectedItemValue = null;
					}
					modelSet(getParentScope(), scope.selectedId);
				};

				var updateSelectedId = () => {
					var selectedId = modelGet(getParentScope());
					var item = _.find(scope.sgSelectOptions, (i: any) => { return i.Id == selectedId; });
					if (item) {
						setItem(item);
					}
				};

				getParentScope().$watch(scope.ngModel, () => updateSelectedId());
				updateSelectedId();

				var resetItem = () => {
					setItem(null);
				}

				scope.reset = () => {
					resetItem();
					close();
				};

				var open = () => {
					scope.isOpen = true;
				};

				var close = () => {
					scope.isOpen = false;
				};

				var select = () => {
					setItem(scope.sgSelectOptions[scope.selectedIndex]);
					close();
				};

				scope.open = () => {
					open();
				};

				scope.selectedIndex = 0;
				scope.isOpen = false;
				var up = () => {
					if (scope.selectedIndex == 0) return;
					scope.selectedIndex = scope.selectedIndex - 1;
				};
				var down = () => {
					if (scope.sgSelectOptions.length-1 <= scope.selectedIndex) return;
					scope.selectedIndex = scope.selectedIndex + 1;
				};

				scope.setItem = (item) => {
					setItem(item);
					close();
				};

				scope.$watch('sgSelectOptions', () => updateSelectedId());

				//inputElm.keydown((e: KeyboardEvent) => {
				//	scope.$apply(() => {
				//		if (scope.isOpen)
				//		{
				//			if (e.keyCode == 27) // space
				//			{
				//				if (!scope.selected)
				//				{
				//					resetItem();
				//				}
				//				close();
				//			} else if (e.keyCode == 38) // up
				//			{
				//				e.preventDefault();
				//				up();
				//			} else if (e.keyCode == 40) // down
				//			{
				//				e.preventDefault();
				//				down();
				//			} else if (e.keyCode == 13) // enter
				//			{
				//				e.preventDefault();
				//				select();
				//			}
				//		} else
				//		{
				//			if (e.keyCode == 8 || e.keyCode == 46) {
				//				resetItem();
				//			} else if (e.keyCode != 9) {
				//				resetItem();
				//				open();
				//			}
				//		}
				//	});
				//});

				$(document).on("click focusin focus", (e: JQueryEventObject) =>
				{
					// scope.isOpen => optimalization
					if (scope.isOpen && !$.contains(<Element>elm.get(0), <Element>e.target))
					{
						scope.$apply(() =>
						{
							close();
						});
					}
				});
			}
		};
	}]);
}