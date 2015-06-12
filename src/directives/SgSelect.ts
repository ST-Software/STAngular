module FinaDb
{

    interface ISgSelectOption {
        Id: string;
        Name: string;
        Readonly?: boolean;
    }

	// http://plnkr.co/edit/Vu3KyTtTav9cSQSJYbHb?p=preview
	GlobalModule.directive("sgSelect", ["$parse", "$filter",
		($parse, $filter) => {
		    var defaultTableWidth = 400;

		return {
			restrict: "A",
			scope: {
				sgSelect: "@",
				sgSelectOriginalOptions: "=sgSelectOptions",
				sgSelectOptionsReadonly: "=",
				sgSelectValid: "&",
                sgSelectInitialValue: "=",
                tableWidth: "@",
				//ngModel: "@",
				ngModel: "=",
				ngDisabled: "=",
				ngRequired: "=",
				display: "@",
				ngReadOnly: "=",
				placeholder: "@",
				parentScopeLevel: "@",
			},
			templateUrl: "../directive/SgSelect.html",
            link: (scope, elm, attrs, ctrl) => {
                
                if (scope.tableWidth == null) {
                    scope.tableWidth = defaultTableWidth;
                }

				if (!scope.parentScopeLevel) scope.parentScopeLevel = 1;
                
				scope.$watch('sgSelectOriginalOptions', () => {
				    scope.sgSelectOptions = getSelectOptions();
				});

                function getSelectOptions(): Array<ISgSelectOption> {
                    var sgSelectOptions = angular.copy(scope.sgSelectOriginalOptions);
                    if (angular.isFunction(scope.sgSelectOptionsReadonly)) {
                        sgSelectOptions = scope.sgSelectOptionsReadonly(sgSelectOptions, scope.sgSelectInitialValue);
                    }

                    return sgSelectOptions;
                }

				var setItem = (item) => {
					if (item) {
						scope.selectedId = item.Id;
						scope.selectedItemValue = item[scope.display];
					} else {
						scope.selectedId = null;
						scope.selectedItemValue = null;
					}

				    scope.ngModel = scope.selectedId;
				};

				var updateSelectedId = () => {
					var selectedId = scope.ngModel;

					var item = _.find(scope.sgSelectOptions, (i: any) => { return i.Id == selectedId; });
					if (item) {
						setItem(item);
					}
				};

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

                scope.$watch('selectedItemValue', (newValue: string, oldValue: string) => {
                    if (newValue == oldValue) {
                        return;
                    }

                    if (!!scope.selectedItemValue) {
                        var options = getSelectOptions();
                        options = $filter('filter')(options, { Name: scope.selectedItemValue });
                        scope.sgSelectOptions = options;
                    } else {
                        scope.sgSelectOptions = getSelectOptions();
                    }
                });


                //TODO: Commited out because of difficulty skipping the disabled elements/options in the list
                //scope.$apply(() => {
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
