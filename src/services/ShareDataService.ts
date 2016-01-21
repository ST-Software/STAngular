/// <reference path="../../angular.d.ts" />
/// <reference path="../Sg.ts" />

module STAngular {

    Module.factory("ShareDataService", [(): STAngular.IShareDataService => {
		/// <summary>	
		/// Super simple service for sharing data between controllers.
        /// </summary>	

        var data = {};

        // If you are retrieving objects then do not forget to call JSON.parse() on the returned value
        // like this: 
        // var value = ShareDataService.getData(key);
        // if (value) {
        //      var obj = JSON.parse(value);
        // }
        function getData(key) {
            return data[key];
        }

        // If you are storing objects then do not forget to call JSON.stringify() first.
        // Otherwise you will store only the reference to an object.
        // 
        // like this: 
        // ShareDataService.setData(key, JSON.stringify(object));
        function setData(key, obj) {
            data[key] = obj;
        }

        return {
			getData: getData,
			setData: setData
        };
    }]);

} 
