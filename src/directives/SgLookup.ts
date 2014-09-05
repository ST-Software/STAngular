/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive('sgLookup', ["$parse", "$injector",
        ($parse, $injector) => {

            return {
                restrict: "A",
                scope: {     
                    fields: "@",
                    titles: "@",
                    searchBy: "@",
                    display: "@",
                    ngModel: "@",
                    inputClass: "@",
                    sgLookup: "@",
                    minSearchLength: "@",
                    ngRequired: "=",
                    ngReadOnly: "=",
                    resourceFilter: "&"
                },                
                link: (scope, elm, attrs, ctrl) => {
                    var modelGet = $parse(scope.ngModel),
                        modelSet = modelGet.assign;

                    var idMode = true; // defines if the ngModel shows to id or resource
                    var resourceFilterGet = scope.resourceFilter || (() => ({}));
                    var minSearchLength = scope.minSearchLength ? parseInt(scope.minSearchLength, 10) : 2;
                    
                    var resource = $injector.get(scope.sgLookup);
                    var element = $(elm);
                    var inputElm = element.find("input");
                    
                    scope.fieldList = scope.fields.split(',').map(i => i.trim());
                    scope.titleList = scope.titles.split(',').map(i => i.trim());
                                       
                    var loadData = () => {
                        if (!scope.isOpen) {
                            return;
                        }
                        if (scope.filterText == null && minSearchLength > 0 || scope.filterText != null && scope.filterText.length <= minSearchLength) {
                            scope.data = null;
                            return;
                        }
                        scope.loading = true;
                        var query = {
                            Page: 1,
                            PageSize: 10,
                            OrderBy: scope.searchBy,
                            Filter: resourceFilterGet()
                        };
                        query.Filter[scope.searchBy] = scope.filterText;
                        resource.pagedQuery(query, null, (data) => {
                            scope.data = data;
                            scope.loading = false;
                            scope.selectedIndex = 0;
                            scope.selected = null;
                        });
                    };
                    
                    var up = () => { scope.selectedIndex = scope.selectedIndex - 1; };
                    var down = () => { scope.selectedIndex = scope.selectedIndex + 1; };
                    var select = () => {
                        if (scope.data) {
                            setItem(scope.data.Items[scope.selectedIndex]);
                            close();
                        }
                    };

                    var setItem = (item) => {
                        scope.selected = item;
                        if (item) {
                            scope.filterText = item[scope.display];
                            scope.selectedId = item.Id;
                        } else {
                            scope.filterText = null;
                            scope.selectedId = null;
                        }
                        if (idMode) {
                            modelSet(scope.$parent, scope.selectedId);
                        } else {
                            modelSet(scope.$parent, scope.selected);
                        }
                    }
                    var resetItem = () => {
                        setItem(null);
                    }
                    var open = () => {
                        scope.isOpen = true;
                        loadData();
                    }
                    var close = () => {
                        scope.isOpen = false;
                    }

                    var updateSelectedId = () => {
                        var selectedValue = modelGet(scope.$parent);
                        if (!selectedValue) return;

                        idMode = _.isString(selectedValue);
                        if (idMode) {
                            if (scope.selectedId != selectedValue) {
                                scope.itemLoading = true;
                                resource.get({ Id: selectedValue }, (item) => {
                                    scope.itemLoading = false;
                                    setItem(item);
                                });
                            }
                        } else {
                            setItem(selectedValue);
                        }
                    };
                    
                    scope.$parent.$watch(scope.ngModel, () => updateSelectedId());
                    updateSelectedId();

                    var throttledLoadData = _.throttle(loadData, 200);
                    scope.$watch("filterText", () => throttledLoadData());                 

                    scope.selectedIndex = 0;
                    scope.isOpen = false;                    

                    scope.reset = () => {
                        resetItem();
                        close();
                    };
                    scope.open = () => {
                        resetItem();
                        open();
                    };
                    scope.setItem = (item) => {
                        setItem(item);
                        close();
                    };

                    inputElm.keydown((e: KeyboardEvent) => {
                        scope.$apply(() => {
                            if (scope.isOpen) {
                                if (e.keyCode == 27) {
                                    if (!scope.selected) {
                                        resetItem();
                                    }
                                    close();
                                } else if (e.keyCode == 38) {
                                    e.preventDefault();
                                    up();
                                } else if (e.keyCode == 40) {
                                    e.preventDefault();
                                    down();
                                } else if (e.keyCode == 13) {
                                    e.preventDefault();
                                    select();
                                }
                            } else {
                                if (e.keyCode == 8 || e.keyCode == 46) {
                                    resetItem();
                                } else if (e.keyCode != 9) {
                                    resetItem();
                                    open();
                                }
                            }
                        });
                    });

                    $(document).on("click focusin focus", (e: JQueryEventObject) => {                        
                        // scope.isOpen => optimalization
                        if (scope.isOpen && !$.contains(<Element>elm.get(0), <Element>e.target)) {
                            scope.$apply(() => {
                                close();
                            });
                        }
                    });
                },
                templateUrl: 'templates/lookup.html'
            };
        }
    ]);
}