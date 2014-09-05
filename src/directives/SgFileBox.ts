/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.directive("sgFileBox", () => {
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
                isRequired: '=' //TODO: Not used
            },
            templateUrl: 'file-box.html',
            link: (scope, element) => {
                var box = $(element),
                    //fileSelector = $('<input type="file" />'),
                    fileSelector = box.find('input[type=file]'),
                    defaultMaxSize = 2097152;

                var readFile = files => {
                    scope.$apply(() => { scope.fileSizeError = false; scope.fileTypeError = false; });

                    if (files.length == 0)
                        return;

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
                    if (!file.type.match(regex)) {
                        scope.$apply(() => {
                            scope.fileTypeError = true;

                            scope.clear();
                        });
                        return;
                    }

                    var reader = new FileReader();
                    reader.onload = e => {
                        scope.$apply(() => {
                            scope.document.Url = '';

                            scope.document.DataUrl = e.target.result;
                            scope.document.ContentType = file.type;
                        });
                    };
                    reader.readAsDataURL(file);
                };

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

                scope.clear = () => {
                    scope.document.DataUrl = '';
                    scope.document.Url = '';
                    scope.document.ContentType = '';
                };

                var readFilesFromInput = (e: Event) => {
                    e.stopPropagation();
                    e.preventDefault();

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

                box.find(".image-selector").on('click', () => {
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
    });

}