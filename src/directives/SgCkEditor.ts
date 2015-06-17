/// <reference path="../../angular.d.ts" />
/// <reference path="../../../ckeditor/ckeditor.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular
{
	class FuncQueue
	{
		constructor()
		{
			this.funcList = [];
			this.isRunning = false;
		}

		funcList: any[];

		isRunning: boolean;

		pushFunc = (func: () => void) =>
		{
			this.funcList.push(func);
			this.start();
		};

		start = () =>
		{
			if (!this.isRunning && this.funcList.length > 0)
			{
				this.isRunning = true;
				var currentFunc = this.funcList.shift();
				setTimeout(currentFunc(), 100);
			}
		};

		funcFinished = () =>
		{
			this.isRunning = false;

			this.start();
		};

	}


    //Inspiration taken from https://github.com/esvit/ng-ckeditor/blob/master/src/scripts/02-directive.js
    Module.directive('sgCkEditor', [<any>'$window', "$rootScope", "$timeout", function ($window, $rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService) {


        var EMPTY_HTML = '<p></p>',
            scriptName = 'sgCkEditor',
		    funcQueue = new FuncQueue();

        return {
            require: ['?ngModel', '^?form'],
            priority: 10,
            scope: {
                width: '@',
                height: '@',
                extraPlugins: '@', //As space-separated list (like: "plugin1 plugin2 plugin3")
                onPropertyChange: '=' //signature is: 'name of property', 'name of function to invoke'
            },
            link: (scope, el, attr, ctrls) => {

                var ngModel = ctrls[0],
                    form = ctrls[1] || null;

                var ck : CKEDITOR.editor = $window.CKEDITOR.replace(el[0],
                {
                    width: scope.width,
                    height: scope.height,
                    extraPlugins: scope.extraPlugins
                });

                el.bind('$destroy', () => {
                    if (ck == null) return;

                    ck.destroy(
                        false //If the instance is replacing a DOM element, this parameter indicates whether or not to update the element with the instance contents.
                    );
                });

                var setModelData = setPristine => {
                    var data = ck.getData();

                    if (data == '') {
                        data = null;
                    }

                    $timeout(() => { // for key up event
                        (setPristine !== true || data != ngModel.$viewValue) && ngModel.$setViewValue(data);
                        (setPristine === true && form) && form.$setPristine();
                    }, 0);
                };
                
                ck.on('change', setModelData);
                ck.on('blur', setModelData);

                ck.on('instanceReady', () => {
					scope.$broadcast("ckeditor.ready");

					//TODO: The only solution is calling setData after previous setData finished. That's the correct way of using setData.
					//TODO: http://dev.ckeditor.com/ticket/10501
					ck.setData(ngModel.$viewValue);

					//console.log('setData-instanceReady ' + scope.$id);
					//ck.setData(ngModel.$viewValue, () => { console.log('setData-instanceReady FINISHED ' + scope.$id);});

					//funcQueue.pushFunc(() => { console.log('setData-instanceReady ' + scope.$id); ck.setData(ngModel.$viewValue, () => { console.log('setData-instanceReady FINISHED ' + scope.$id); funcQueue.funcFinished();}); });
                    
                    ck.document.on("keyup", setModelData);
                });

                ck.on('pasteState', () => {
                    scope.$apply(() => {
                        ngModel.$setViewValue(ck.getData());
                    });
                });
                
				ngModel.$render = value =>
				{
					//TODO: The only solution is calling setData after previous setData finished. That's the correct way of using setData.
					//TODO: http://dev.ckeditor.com/ticket/10501
					//TODO: causes console error log in IE: "SCRIPT70: Permission denied"
					ck.setData(ngModel.$modelValue);

					//console.log('setData-$render ' + scope.$id);
					//ck.setData(ngModel.$modelValue, () => { console.log('setData-$render FINISHED ' + scope.$id); });

					//funcQueue.pushFunc(() => { console.log('setData-$render ' + scope.$id); ck.setData(ngModel.$modelValue, () => { console.log('setData-$render FINISHED ' + scope.$id); funcQueue.funcFinished(); }); });
                };

                //#region EmailTemplateVariable  plugin configuration
                //TODO: This code is relevant for EmailTemplateVariable plugin only => so it should be elsewhere => find a proper place
                var onPropertyChange = scope.onPropertyChange;
                if (onPropertyChange != null) {
                    var propertyName = onPropertyChange.split(',')[0],
                        callbackName = onPropertyChange.split(',')[1],
                        callbackGetVariablesListFn: Function = null;

                    if (callbackName != null && callbackName != '') {
                        callbackName = callbackName.trim();
                        //TODO: Bad hack ... I need to find robust solution insted of messing with $parent
                        //TODO: Use getter/setter from $parse?
                        callbackGetVariablesListFn = scope.$parent[callbackName];
                    }

                    var unbindTypeListener = $rootScope.$on('emailTemplateType.updated', (event: ng.IAngularEvent, value: any) => {

                        if (callbackGetVariablesListFn) {
                            var result: Array<string> = callbackGetVariablesListFn();
                            updateVariablesDropdown(result);
                        }
                    });

                    scope.$on('$destroy', unbindTypeListener);

                    var unbindNewVariablesListener = $rootScope.$on('emailTemplate.newVariables', (event: ng.IAngularEvent, variables: Array<string>) => {
                        updateVariablesDropdown(variables);
                    });

                    scope.$on('$destroy', unbindNewVariablesListener);   
                }

                function updateVariablesDropdown(variables: Array<string>) {
                    //I need to reconfigure the given plugin with the result
                    var newVariables = _.map(variables, (r: string) => {return { name: r, title: r, html: '{{' + r + '}}' } });

                    //Get instance of plugin
                    setTimeout(() => {
                        ck.fire('emailTemplateVariable_initialize', newVariables);

                        //Give ckEditor enough time to initialize all the plugins, then try to call our plugin
                        var retryCounter = 0,
                            maxRetryCount = 3,
                            retryInterval = 500;

                        var initPlugin = () => {
                            if (retryCounter >= maxRetryCount) {
                                console.error(scriptName + '.updateVariablesDropdown() - max retry count reached');
                                return;
                            }

                            if (ck.plugins != null) {
                                var pluginInstance = ck.plugins['emailTemplateVariable'];
                                if (pluginInstance) {
                                    pluginInstance.rebuildList(newVariables);
                                }
                            } else {
                                retryCounter++;
                                setTimeout(() => initPlugin(), retryInterval);
                            }
                        }

                        setTimeout(() => {
                            //Perform again until ck.plugins is ready (until 3 times)
                            initPlugin();
                        }, retryInterval);

                    }, 20);
                }
                //#endregion EmailTemplateVariable  plugin configuration
            }
        };
    }]);

} 
