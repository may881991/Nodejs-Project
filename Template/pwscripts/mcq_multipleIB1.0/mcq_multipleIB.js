/*---- 23.7.2017------*/
 var multiple_MCQ = function() {
     var dbFile = "";
     _this = this;
     var pageID;
     var score;
     var childimg = $('.questiontitle').has('img')
     if (childimg) {
         $(childimg).each(function(i) {
            $(this).addClass("questionImg")
         });
     }
     multiple_MCQ.prototype.initMcqmulti = function() {
         var activityID = libraryVar.fileNameID.replace(".html", "");
         pageID = activityID;
         if (activityID != "" && activityID != undefined) {
             activityID = "offlineans_" + activityID;
             dbFile = libraryVar.DocumentPath + "/Sync/" + libraryVar.unitID + "/" + libraryVar.CurrentUserID + "/userDB/" + activityID;
             var createSql = 'CREATE TABLE IF NOT EXISTS PageMarks (ID VARCHAR(64) primary key, QID VARCHAR(50), Answer text, Type integer ,MARK integer ,SubmitId BOOLEAN)';
             var dbObj = new QueryManager();
             dbObj.runQuery(createSql, dbFile, function(results) {
                 _this.checkMCQPExistingAnswer();
                 _this.checkAnswerBtnMCQ();
             });
         }
     };


     multiple_MCQ.prototype.checkMCQPExistingAnswer = function() {
            _this.addMCQPCheckEvent();
            _this.getmcqmultiData();
     };

     multiple_MCQ.prototype.addMCQPCheckEvent = function() {
         ansObj = {};
         $('.mcqmulti').each(function(i) {
             parentId = $(this).attr("id");
             ansObj[parentId] = [];
             $("#" + parentId + ' li').each(function(i) {
                 $(this).attr("id", i + 1);
             })
         });

         $('.mcqmulti li').click(function() {
             $(this).toggleClass("mcqhighlight");
             $(this).children('span').toggleClass("hlmcqmulti");
             changedqid = "";
             answerCB = "";
             var choicelimit;
             objparent = $(this).parent();
             parentId = objparent.attr('id');
             choiceLimit = objparent.attr('choicelimit');
             var answer = $(this).attr('id');
             valMark = answer;
            rethasclass = $(this).hasClass("mcqhighlight");
            hasClassSib = $(this).siblings('li').hasClass("mcqhighlight");

             changedqid = objparent.attr('id');
             $("#btnImg_"+changedqid).css("display","block");

            if (choiceLimit == 1) {
                if (hasClassSib == true) {
                    $(this).siblings('li').removeClass("mcqhighlight");
                    $(this).siblings('li').children('span').removeClass("hlmcqmulti");
                    $(this).siblings('li').children('span').addClass("choicemcqp");
                }
            }

             var selectSql = 'SELECT * FROM PageMarks WHERE QID="' + parentId + '"';
             var dbObj = new QueryManager();
             dbObj.runQuery(selectSql, dbFile, function(results) {
                 var len = results.length;
                 if (len) {
                     var resid = results[0].ID;
                     var resans = results[0].Answer;
                     strAns = "";
                     if (rethasclass) {
                         if (choiceLimit) {
                            strAns = answer;
                         }else{
                            strAns = resans + "," + answer;
                         }
                     } else {
                         resArr = resans.split(",");
                         for (i = 0; i < resArr.length; i++) {
                             if (resArr[i] != valMark) {
                                 if (strAns == "") {
                                     strAns = resArr[i];
                                 } else {
                                     strAns += "," + resArr[i];
                                 }
                             }
                         }
                     }
                     if (strAns == "") {
                         var deleteSql = 'DELETE FROM PageMarks WHERE QID="' + parentId + '"';
                         var dbObj = new QueryManager();
                         dbObj.runQuery(deleteSql, dbFile, function(results) {

                         });
                     } else {
                         _this.UpdatemcqmultiData(strAns, resid);
                     }
                 } else {

                     if (rethasclass) {
                         generatedid = MD5(libraryVar.CurrentUserID + "" + $.now());
                         _this.InsertmcqmultiData(generatedid, parentId, valMark, 13);
                     }
                 }
             });
         });
     };
     multiple_MCQ.prototype.checkFormcqmultiAnswer = function(mcqpQID) {
            var selectSql = 'SELECT * FROM PageMarks WHERE QID = "' + mcqpQID + '"';
            var dbObj = new QueryManager();
            dbObj.runQuery(selectSql, dbFile, function(results) {
                var len = results.length;
               
                for (var il = 0; il < len; il++) {
                    resqid = results[il].QID;
                    resans = results[il].Answer;
                    restype = results[il].Type;
                    console.log(restype+" restype");
                    $("#btnImg_" + resqid).attr("src","pwscripts/mcq_multipleIB1.0/images/resetanswer.png");
                    switch (restype) {
                       case 13:
                              _this.showTypeThirteen();
                             continue;
                    }
                };
            });

        };

     multiple_MCQ.prototype.UpdatemcqmultiData = function(strAns, resid) {
         var updateSql = "UPDATE PageMarks SET Answer='" + strAns + "' WHERE ID='" + resid + "'";
         var dbObj = new QueryManager();
         dbObj.runQuery(updateSql, dbFile, function(results) {

         });
     };

     multiple_MCQ.prototype.InsertmcqmultiData = function(generatedid, changedqid, strAns, type) {
         var insertSql = 'INSERT INTO PageMarks (ID, QID, Answer, Type) VALUES ("' + generatedid + '","' + changedqid + '","' + strAns + '","' + type + '")';
         var dbObj = new QueryManager();
         dbObj.runQuery(insertSql, dbFile, function(results) {

         });
     };

     multiple_MCQ.prototype.disablemcqmultiCheckSupport = function() {
         var getLan = $('.mcqmulti').attr("language");
         if (getLan) {
            $('.mcqmulti').addClass('nochoicemcqmultieng');
         }else{
            $('.mcqmulti').addClass('nochoicemcqmulti');
         }
     };

     multiple_MCQ.prototype.showTypeThirteen = function(mcqpQID) {
         coransArr = $("#" + resqid).attr("answer");
         ansCheck = 0;
             if (coransArr == resans) {
                $('#' + resqid + ' li:nth-child(' + resans + ') .choicemcqmulti').replaceWith("<span class='glyphicon glyphicon-ok' style='padding: 0px 5px;vertical-align: top;'></span>");
                 $('#' + resqid + ' li:nth-child(' + resans + ') .choicemcqmulti');
                 $('#' + resqid + ' li:nth-child(' + resans + ')').addClass('mcqmulticorrect');
                 $('#' + resqid  ).addClass('dismcqpgame');
                 ansCheck = 1;
                 var scoremark = $('.displayscoremark').text();
                 if(scoremark == ""){
                    scoremark = 1;
                    $('.displayscoremark').text(ansCheck)
                 }
                 else{
                    scoremark = parseInt(scoremark) + 1;
                    $('.displayscoremark').text(scoremark);
                 }
                 var updateSql = "UPDATE PageMarks SET MARK = 1 WHERE QID = '" + resqid + "' ";//ScoreGain
                 var dbObj = new QueryManager();
                 dbObj.runQuery(updateSql, dbFile, function(results) {});

             } else {
                 $('#' + resqid + ' li:nth-child(' + coransArr + ') .choicemcqmulti').replaceWith("<span class='glyphicon glyphicon-ok' style='padding: 0px 5px;vertical-align: top;'></span>");
                 $('#' + resqid + ' li:nth-child(' + resans+ ') .choicemcqmulti').replaceWith("<span class='glyphicon glyphicon-remove' style='padding: 0px 5px;vertical-align: top;'></span>");
                 $('#' + resqid + ' li:nth-child(' + coransArr + ')').addClass('mcqmulticorrectans');//mcqmulticorrectans
                 $('#' + resqid + ' li:nth-child(' + resans+ ') .choicemcqmulti');
                 $('#' + resqid + ' li:nth-child(' + resans + ')').addClass('mcqmultiincorrect');
                 $('#' + resqid  ).addClass('dismcqpgame');
                 var inscoremark = $('.displayscoremark').text();
                 if(inscoremark == ""){
                    inscoremark = 0;
                    $('.displayscoremark').text(inscoremark);
                 }
                 else{
                    inscoremark = parseInt(inscoremark) + 0;
                    $('.displayscoremark').text(inscoremark);
                 }
                 var updateSql = "UPDATE PageMarks SET MARK = 0 WHERE QID = '" + resqid + "' ";//ScoreGain
                 var dbObj = new QueryManager();
                 dbObj.runQuery(updateSql, dbFile, function(results) {});
             }
            
             $("#fb_" + resqid).children('.fbheader').css("display", "block");
             var dbname = "markExercise";
             var dbFile1 = libraryVar.DocumentPath + "/Sync/" + libraryVar.unitID + "/" + libraryVar.CurrentUserID + "/userDB/" + dbname;
             var updateSql1 = "UPDATE PagesMark SET ScoreGain ='" + ansCheck + "' WHERE QID='" + resqid + "'";
             var dbObj1 = new QueryManager();
             dbObj1.runQuery(updateSql1, dbFile1, function(results) {
                console.log(results);
             });
     };
     $(".mcqmulti_feedback").click(function() {
         id = $(this).attr('id');
         $("#" + id).children('.fbparagraph').fadeToggle(500);
     });

     multiple_MCQ.prototype.getmcqmultiData = function() {
         var selectSql = 'SELECT * FROM PageMarks';
         var dbObj = new QueryManager();
         dbObj.runQuery(selectSql, dbFile, function(results) {
            console.log(results.length);
             var len = results.length;
             for (var il = 0; il < len; il++) {
                 resqid = results[il].QID;
                 resans = results[il].Answer;
                 restype = results[il].Type;
                 usransArr = resans.split(",");
                 resSubmit = results[il].SubmitId;
                 if (len) {
                     if (restype == 13) {
                         for (ians = 0; ians < usransArr.length; ians++) {
                             $("#" + resqid + " li:nth-child(" + usransArr[ians] + ")").addClass('mcqhighlight');
                             $("#" + resqid + " li:nth-child(" + usransArr[ians] + ") .choicemcqmulti").addClass('hlmcqmulti');
                             $("#btnImg_"+resqid).css("display","block");
                         }
                     }
                     if (resSubmit == 1) {
                        _this.checkFormcqmultiAnswer(resqid);
                    };
                 }
             };
         });
     };
    _this.insertMarkContent = function(corrAnsCount, totalQues) {
        var date = new Date();
        pageID = pageID.toLowerCase();
        activityID = "markExercise";
        dbFile1 = libraryVar.DocumentPath + "/Sync/" + libraryVar.unitID + "/" + libraryVar.CurrentUserID + "/userDB/" + activityID;
        var mon = "";
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (var i = 0; i < months.length; i++) {
            if (date.getMonth() == i) {
                mon = months[i];
                break;
            }
        };
        var dt =  date.getDate() + "-" + mon + "-" + date.getFullYear();
        var updateSql = "UPDATE PagesMark SET ScoreGain='" + corrAnsCount + "',markDate='" + dt + "' WHERE PID='" + pageID + "'";
        var dbObj1 = new QueryManager();
        dbObj1.runQuery(updateSql, dbFile1, function(results) {});
    };


    multiple_MCQ.prototype.checkAnswerBtnMCQ = function() {
        console.log("checkAnswerBtnMCQ");
         var actSbmtBtn = document.getElementsByClassName("IndividualmcqBtn");
         var returnid = "";
         for (var i = 0; i < actSbmtBtn.length; i++) {
             var objactsubmits = actSbmtBtn.item(i); //Individualbutton's element
             objactsubmits.setAttribute("align", "center");
             returnid = objactsubmits.id; //Individualbutton's id.
             objactsubmits.innerHTML = "<img id='btnImg_"+returnid+"' src='pwscripts/mcq_multipleIB1.0/images/checkanswer.png' height='60px' style='border-style: none;display:none'>";
             $("#btnImg_" + returnid).click(function(e) {            
                 var btnid = $(this).parent().attr('id');
                 var mcqid = $(this).parent().siblings('.mcqmulti').attr('id');
                 var pageID = $(this).parent().siblings('.mcqmulti').attr('pageid');
                 var corAns = $(this).parent().siblings('.mcqmulti').attr('answer');
                 if (btnid == mcqid) {
                     var selectSql = 'SELECT * FROM PageMarks WHERE QID = "' + btnid + '"';
                     var dbObj = new QueryManager();
                     dbObj.runQuery(selectSql, dbFile, function(results) {
                        var usrAns = results[0].Answer;
                        if (results[0].SubmitId == 1) { //check whether check button or reset button
                            var dbname = "markExercise";
                            var dbFile1 = libraryVar.DocumentPath + "/Sync/" + libraryVar.unitID + "/" + libraryVar.CurrentUserID + "/userDB/" + dbname;
                            var dbObj1 = new QueryManager();
                            var selectSql1 = "SELECT ScoreGain FROM PagesMark WHERE QID='" + btnid + "'";
                            dbObj1.runQuery(selectSql1 , dbFile1 , function(res) {
                                if (res[0].ScoreGain == 1) {
                                    var inscoremark = $('.displayscoremark').text();
                                     if(inscoremark == 0){
                                        inscoremark = 0;
                                        $('.displayscoremark').text("");
                                     }
                                     else{
                                        inscoremark = parseInt(inscoremark) - 1;
                                        $('.displayscoremark').text(inscoremark);
                                     }
                                }
                            });
                            var updateSql1 = "UPDATE PagesMark SET ScoreGain = null WHERE QID='" + btnid + "'";
                            dbObj1.runQuery(updateSql1, dbFile1, function(results) {});

                            var deleteSql = 'DELETE FROM PageMarks WHERE QID = "' + btnid + '"';
                            var dbObj = new QueryManager();
                            dbObj.runQuery(deleteSql, dbFile, function(results) {
                                $('#' + btnid).removeClass('dismcqpgame');
                                $('#' + btnid + ' li .glyphicon').parent().removeClass('mcqpcorrect');
                                $('#' + btnid + ' li ').parent().removeClass('mcqhighlight');
                                $('#' + btnid + ' li .glyphicon').parent().removeClass('mcqmultiincorrect');
                                $('#' + btnid + ' li .glyphicon').parent().removeClass('mcqmulticorrectans');
                                $('#' + btnid + ' li .glyphicon').parent().removeClass('mcqmulticorrect');
                                $('#' + btnid + ' li .glyphicon').parent().removeClass('mcqhighlight');
                                $('#' + btnid + ' li .glyphicon').removeClass('hlmcqmulti');
                                $('#' + btnid + ' li .glyphicon').addClass('choicemcqmulti').removeClass('glyphicon-ok');
                                $('#' + btnid + ' li .glyphicon').addClass('choicemcqmulti').removeClass('glyphicon-remove');
                                $('#' + btnid + ' li .choicemcqmulti').removeClass('glyphicon');
                                $("#btnImg_" + btnid).attr("src", "pwscripts/mcq_multipleIB1.0/images/checkanswer.png");
                                $('.choicemcqmulti').removeAttr( "style" );
                                $("#btnImg_" + btnid).css("display","none");
                                $("#fb_" + btnid).children('.fbheader').css("display", "none");
                                $("#fb_" + btnid).children('.fbparagraph').css("display", "none");
                            });
                        } else {
                            var updateSql = "UPDATE PageMarks SET SubmitId = 1 WHERE QID = '" + btnid + "' ";
                            var dbObj = new QueryManager();
                            dbObj.runQuery(updateSql, dbFile, function(results) {
                                _this.checkFormcqmultiAnswer(btnid);
                            });
                            $("#btnImg_" + btnid).attr("src","pwscripts/mcq_multipleIB1.0/images/resetanswer.png");
                            if (usrAns == corAns) {
                                var value = 1;
                            }else{
                               var value = 0; 
                            }
                        }
                     });
                 }
             });
         };
     };
     _this.initMcqmulti();
 };