//Update 1.3.2017
var ContentsReport = function() {
    var _this = this;
    var dbFile = "";
    var dbFileC= "";
    var contentDBlength;
    var MarkArr=[];

    ContentsReport.prototype.init = function() {
        _this.showonPage();
    };
    ContentsReport.prototype.showonPage = function() {
        activityID = "markExercise";
        dbFile = libraryVar.DocumentPath + "/Sync/" + libraryVar.unitID + "/" + libraryVar.CurrentUserID + "/userDB/" + activityID;
        var selectSql = 'SELECT DISTINCT Title, t1.ExID , ExScore , TotalScore , InCount FROM PagesMark  as t1 LEFT OUTER JOIN (SELECT ExID , markDate, SUM(ScoreGain)  as TotalScore FROM PagesMark WHERE  ScoreGain IS NOT NULL GROUP BY ExID) as t2  ON t1.ExID = t2.ExID   LEFT OUTER JOIN (Select Max(ExerciseScore) as ExScore , ExID from PagesMark Group By ExID ) as t3 ON t1.ExID = t3.ExID  LEFT OUTER JOIN (Select Count(ScoreGain) as InCount , ExID from PagesMark where ScoreGain = 0 Group By ExID) as t4 ON t3.ExID = t4.ExID';
        var dbObj = new QueryManager();
        dbObj.runQuery(selectSql, dbFile, function(results) {
            console.log(results)
            for (i = 0; i < results.length; i++) {
                var scoreStr = "";
                //console.log(results[i].InCount);
                if(results[i].ExID){
                    var notattempt = results[i].ExScore - (results[i].TotalScore+results[i].InCount);
                    var PageDiv = document.createElement('a');
                    var incorrectCount;
                    PageDiv.id = results[i].ExID;
                    if (results[i].InCount == null) {
                        incorrectCount = 0;
                    }else{
                        incorrectCount = results[i].InCount;
                    }
                    PageDiv.innerHTML = "<div class='title'>"+results[i].Title+"</div><div class='scorePart' id='score_"+results[i].ExID+"'><div class='incorcount'><span>Incorrect</span><label>"+incorrectCount+"</label></div><div class='corcount'><span> Correct </span><label>"+results[i].TotalScore+"</label></div><div class='notattempt'><span>No Attempt</span><label>"+notattempt + "</label></div></div>";
                    PageDiv.setAttribute('href', results[i].ExID+"_1.html");
                    $(".contentContainer").append(PageDiv);
                    $("#"+results[i].ExID).addClass("subcontent");
                }
            };
            $('.subcontent').click(function(e){
                txtlink = $(this).attr('href');
                arrpagename = txtlink.split(".html");
                pagename = arrpagename[0];
                window.plugins.PhysicsFirstPlugin.selectPage(pagename, function(tx,results){} , function(tx,results){});
                  
            });
        });

    };
    
    _this.init();
};  