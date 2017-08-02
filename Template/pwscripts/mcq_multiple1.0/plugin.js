/*---- 16.09.2016-----*/
var pluginObj = new (function() {
    this.init = function() {
        // init code goes here:
        this.addRequiredFile();
    },

    this.addRequiredFile =function() {
        //To Add Module's required file use below method of library 
        FileLoadManager.addJSFile("pwscripts/mcq_multiple1.0/mcq_multiple.js",function(){  
            var mcq_multiple = new multiple_MCQ();
        }); //For JS file 
        
        FileLoadManager.addCSSFile("pwscripts/mcq_multiple1.0/mcq_multiple.css",function(){ }); // For CSS file
    },
    this.init();
});