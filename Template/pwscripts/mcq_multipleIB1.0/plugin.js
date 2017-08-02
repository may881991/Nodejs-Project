/*---- 16.09.2016-----*/
var pluginObj = new (function() {
    this.init = function() {
        // init code goes here:
        this.addRequiredFile();
    },

    this.addRequiredFile =function() {
        //To Add Module's required file use below method of library 
        FileLoadManager.addJSFile("pwscripts/mcq_multipleIB1.0/mcq_multipleIB.js",function(){  
            var mcq_multipleIB = new multiple_MCQ();
        }); //For JS file 
        
        FileLoadManager.addCSSFile("pwscripts/mcq_multipleIB1.0/mcq_multipleIB.css",function(){ }); // For CSS file
    },
    this.init();
});