//Update 5.6.2017
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
        var selectSql = 'SELECT DISTINCT Title, ExScore, t1.ExID , t2.markDate, TotalScore FROM PagesMark as t1 LEFT OUTER JOIN (SELECT ExID , markDate, SUM(ScoreGain) as TotalScore FROM PagesMark WHERE ScoreGain IS NOT NULL AND markDate IS NOT NULL GROUP BY ExID) as t2 ON t1.ExID = t2.ExID LEFT OUTER JOIN (Select Max(ExerciseScore) as ExScore , ExID from PagesMark Group By ExID ) as t3 ON t1.ExID = t3.ExID';
        var dbObj = new QueryManager();
        dbObj.runQuery(selectSql, dbFile, function(results) {
            for (i = 0; i < results.length; i++) {
                var scoreStr = "";
                if(results[i].ExID){
                    var PageDiv = document.createElement('a');
                    PageDiv.id = results[i].ExID;
                    PageDiv.innerHTML = "<div class='title'>"+results[i].Title+"</div><div class='scorePart' id='score_"+results[i].ExID+"'>"+results[i].ExScore+" 个问题</div>";
                    PageDiv.setAttribute('href', results[i].ExID+"_1.html");
                    $(".contentContainer").append(PageDiv);
                    $("#"+results[i].ExID).addClass("subcontent");
                    date = results[i].markDate;
                    correctScore = results[i].TotalScore;
                    if (correctScore !== null  && date !== null) {
                        scoreStr ="<span class='date'>"+ date + "</span>  <span class='score'>" + correctScore + "/" + results[i].ExScore + "分</span>";
                        $("#score_"+results[i].ExID).html(scoreStr);
                    }
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