/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive("sgFileBox", ["$window", "$rootScope", ($window: ng.IWindowService, $rootScope: ng.IRootScopeService) => {
        return {
            restrict: 'A',
            scope: {
                boxTitle: '@',
                boxClass: '@',
                fileTypeDescription: '@',
                fileTypeRegex: '@',
                maxFileSize: '@', //in bytes
                readonly: '=',
                document: '=',
                eventId: '@',
                fileExtRegex: '@',
                isRequired: '=' //TODO: Not used
            },
            templateUrl: 'file-box.html',
            link: (scope, element) => {
                var box = $(element),
                    fileSelector = box.find('input[type=file]'),
                    defaultMaxSize = 2097152;

                var readFile = files => {
                    scope.$apply(() => { scope.fileSizeError = false; scope.fileTypeError = false; });

                    if (files.length == 0) {
                        return;
                    }

                    var file = files[0];                    

                    scope.document = scope.document || {};

                    var maxSize = scope.maxFileSize || defaultMaxSize;

                    var maxSizeAllowed: string = getReadableFileSizeString(maxSize);
                    scope.maxSizeAllowed = maxSizeAllowed;

                    if (file.size > maxSize) {
                        scope.$apply(() => {
                            scope.fileSizeError = true;
                            
                            scope.clear();
                        });
                        return;
                    }

                    var regex = scope.fileTypeRegex || 'image.*';
                    var extRegex = scope.fileExtRegex;
                    var extension : string = getExtension(file);

                    if (!file.type.match(regex) && (extRegex == null || !extension.match(extRegex))) {
                        scope.$apply(() => {
                            scope.fileTypeError = true;

                            scope.clear();
                        });
                        return;
                    }

                    var reader = new FileReader();
                    reader.onload = event => {
                        scope.$apply(() => {
                            scope.document.Url = '';

                            scope.document.Id = null; //We have new object => reset Id of the old one so that there is no confusion on the server
                            scope.document.DataUrl = (<any>event.target).result;
                            scope.document.ContentType = file.type;
                            scope.document.Extension = getExtension(file);

                            if (scope.eventId) {
                                $rootScope.$emit('sgFileBox.fileChanged_' + scope.eventId);
                            }
                            
                        });
                    };
                    reader.readAsDataURL(file);
                };

                function getExtension(file: File) : string {
                    var parts: Array<string> = file.name.split('.');
                    var extension: string = parts[parts.length - 1];
                    return !!extension ? extension.toLowerCase() : undefined;
                }

                scope.isNotEmpty = () => {
                    return scope.document && scope.document.ContentType;
                };

                scope.isImage = () => {
                    return scope.document && scope.document.ContentType && scope.document.ContentType.indexOf('image') != -1;
                };

                scope.isPdf = () => {
                    return scope.document && scope.document.ContentType && scope.document.ContentType.indexOf('pdf') != -1;
                };

                scope.isAudio = () => {
                    return scope.document && scope.document.ContentType && scope.document.ContentType.indexOf('audio') != -1;
                };

                scope.isExcel = () => {
                    return scope.document && scope.document.ContentType && scope.document.ContentType.indexOf('spreadsheet') != -1;
                }

                scope.isWord = () => {
                    return scope.document && scope.document.ContentType && (
                        scope.document.ContentType.indexOf('application/vnd.openxmlformats-officedocument.wordprocessingml.document') != -1 //docx
                        || scope.document.ContentType.indexOf('application/msword') != -1 //doc
                        );
                }

                scope.isXml = () => {
                    return scope.document && scope.document.ContentType && scope.document.ContentType.indexOf('text/xml') != -1;
                }

                scope.isEmailFile = () => {
                    return scope.document && (
                        scope.document.ContentType && scope.document.ContentType.indexOf('message/rfc822') != -1
                        //Emails saved from MS Outlook do not have content type but they have .msg extension.
                        //Emails save from Thunderbird have correct content type (and the extension is .eml)
                        || scope.document.ContentType == '' && scope.document.Extension == 'msg'
                        );
                }

                scope.clear = () => {
                    if (scope.document == null) return;

                    scope.document.DataUrl = '';
                    scope.document.Url = '';
                    scope.document.ContentType = '';
                    scope.document.PreviewUrl = '';
                };

                var readFilesFromInput = (e: Event) => {
                    e.stopPropagation();
                    e.preventDefault();

                    scope.clear();

                    var files = (<any>e.target).files;
                    readFile(files);
                    fileSelector.val('');
                };

                var readFilesFromDrop = (e: Event) => {
                    e.stopPropagation();
                    e.preventDefault();
                    box.removeClass("dragging-over");
                    var files = (<any>e).originalEvent.dataTransfer.files;
                    readFile(files);
                };

                box.find("img.image-selector, div.image-selector").on('click', () => {
                    if (scope.document != null && scope.document.PreviewUrl != null && scope.document.PreviewUrl != '') {
                        $window.open(scope.document.PreviewUrl, '_blank');
                        return;
                    }

                    if (!scope.readonly) {
                        fileSelector.click();
                    }
                });

                box.find(".btn.image-selector").on('click', () => {
                    if (!scope.readonly) {
                        fileSelector.click();
                    }
                });

                fileSelector.on('change', readFilesFromInput);

                box.on('drop', readFilesFromDrop);

                box.on('dragover', e => {
                    e.stopPropagation();
                    e.preventDefault();
                    box.addClass("dragging-over");
                    (<any>e).originalEvent.dataTransfer.dropEffect = 'copy';
                });

                box.on('dragleave', () => {
                    box.removeClass("dragging-over");
                });
            }
        };

        function getReadableFileSizeString(fileSizeInBytes) {

            var i = -1;
            var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes > 1024);

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        };
    }]);

}
