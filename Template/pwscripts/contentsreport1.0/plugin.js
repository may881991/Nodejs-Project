var pluginObj = new (function() {
    this.init = function() {
        // init code goes here:
        this.addRequiredFile();
        
    },

    this.addRequiredFile =function() {
        //To Add Module's required file use below method of library 
        FileLoadManager.addJSFile("pwscripts/contentsreport1.0/contentsreport.js",function(){ 
                var contents = new ContentsReport();

        }); //For JS file 
        
        FileLoadManager.addCSSFile("pwscripts/contentsreport1.0/contentsreport.css",function(){}); // For CSS file
    },
    this.init();
});