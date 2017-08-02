/*---- 17.7.2017------*/
 var multiple_MCQ = function() {
     var dbFile = "";
     _this = this;
     var pageID;
     
     $('.preloader').css("display","none");
     $('.pageBody').css("display","block");
     var childimg = $('.questiontitle').has('img')
     if (childimg) {
         $(childimg).each(function(i) {
            $(this).addClass("questionImg")
         });
     }
     multiple_MCQ.prototype.initMCQMULTI = function() {
         setTimeout(function() {
             var activityID = libraryVar.fileNameID.replace(".html", "");
             pageID = activityID;
             if (activityID != "" && activityID != undefined) {
                 activityID = "offlineans_" + activityID;
                 dbFile = libraryVar.DocumentPath + "/Sync/" + libraryVar.unitID + "/" + libraryVar.CurrentUserID + "/userDB/" + activityID;
                 var createSql = 'CREATE TABLE IF NOT EXISTS PageAnswers (ID VARCHAR(64) primary key, QID VARCHAR(50), Answer text, Type integer)';
                 var dbObj = new QueryManager();
                 dbObj.runQuery(createSql, dbFile, function(results) {
                     _this.checkMCQPExistingAnswer();
                    $("html, body").animate({
                        scrollTop:  $('#pageFrame').offset().top 
                    },0);
                 });
             }
         }, 100);
         
         var w = window.innerWidth;
         if (w > 280 && w < 480) {
            var img = $('img');
            for (var i = 0; i < img.length ; i++) {
                 var imgwidth = img[i].width;
                 if (imgwidth > 280 ) {
                    img[i].style.width = "100%";
                 }
            }
         }
     };

     multiple_MCQ.prototype.checkMCQPExistingAnswer = function() {
         var selectSql = 'SELECT * FROM PageAnswers WHERE Type=9';
         var dbObj = new QueryManager();
         dbObj.runQuery(selectSql, dbFile, function(results) {
             if (results.length == 0) {
                 _this.addMCQPCheckEvent();
             } else {
                console.log("Existing Data")
                 _this.disablemcqmultiCheckSupport();
             }
             _this.checkFormcqmultiAnswer(results.length);
             _this.getmcqmultiData(results.length);
         });
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
            if (choiceLimit == 1) {
                if (hasClassSib == true) {
                    $(this).siblings('li').removeClass("mcqhighlight");
                    $(this).siblings('li').children('span').removeClass("hlmcqmulti");
                    $(this).siblings('li').children('span').addClass("choicemcqp");
                }
            }

             var selectSql = 'SELECT * FROM PageAnswers WHERE QID="' + parentId + '"';
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
                         var deleteSql = 'DELETE FROM PageAnswers WHERE QID="' + parentId + '"';
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

     multiple_MCQ.prototype.checkFormcqmultiAnswer = function(len9) {
         // alert("check for MCQD answer");
         var selectSql = 'SELECT * FROM PageAnswers';
         var dbObj = new QueryManager();
         dbObj.runQuery(selectSql, dbFile, function(results) {
             var len = results.length;
             corrAnsCount = 0;
             for (var il = 0; il < len; il++) {
                 resqid = results[il].QID;
                 resans = results[il].Answer;
                 restype = results[il].Type;
                 usransArr = resans.split(",");
                 if (len9) {
                     switch (restype) {
                         case 13:
                             _this.showTypeThirteen();
                             continue;
                     }
                 }
             }
             if (len9) {
                 btncmaid = libraryVar.fileNameID.replace(".html", "");
                 totalQues = $("[name='" + btncmaid + "']").length;
                     $(".displayscoremark").text(corrAnsCount);
                     $(".displaybasemark").text(totalQues);
                    _this.insertMarkContent(corrAnsCount, totalQues);
                 $(".displaybox").css('display', 'block');
             }
         });

     };

     multiple_MCQ.prototype.UpdatemcqmultiData = function(strAns, resid) {
         var updateSql = "UPDATE PageAnswers SET Answer='" + strAns + "' WHERE ID='" + resid + "'";
         var dbObj = new QueryManager();
         dbObj.runQuery(updateSql, dbFile, function(results) {

         });
     };

     multiple_MCQ.prototype.InsertmcqmultiData = function(generatedid, changedqid, strAns, type) {
         var insertSql = 'INSERT INTO PageAnswers (ID, QID, Answer, Type) VALUES ("' + generatedid + '","' + changedqid + '","' + strAns + '","' + type + '")';
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

     multiple_MCQ.prototype.showTypeThirteen = function() {

         var tccorrectans = $("#" + resqid).attr("answer");
         coransArr = tccorrectans.split(",");
         var resAns = usransArr.sort();
         resAns = resAns.toString();
         corAns = coransArr.sort();
         corAns = corAns.toString();
         ansCheck = 0;

         var corans = coransArr.filter(function(val) {
             return usransArr.indexOf(val) != -1;
         });

         if (corans) {
             for (var i = 0; i < corans.length; i++) {
                 $('#' + resqid + ' li:nth-child(' + corans[i] + ')').children("span").replaceWith("<span><span class='pccorrect'><img src='" + settings.libraryPath + "assets/images/offlineCheckTick.svg'></span></span>");
                 $('#' + resqid + ' li:nth-child(' + corans[i] + ')').addClass('mcqmulticorrect');
                 var rmCorans = coransArr.indexOf(corans[i]);
                 coransArr.splice(rmCorans, 1);
                 var rmUsrans = usransArr.indexOf(corans[i]);
                 usransArr.splice(rmUsrans, 1);
             }

         }

         if (coransArr) {
             for (var j = 0; j < coransArr.length; j++) {
                 $('#' + resqid + ' li:nth-child(' + coransArr[j] + ')').children("span").replaceWith("<span><span class='pccorrectans'><img src='" + settings.libraryPath + "assets/images/offlineCheckTick.svg'></span></span>");
                 $('#' + resqid + ' li:nth-child(' + coransArr[j] + ')').addClass('mcqmulticorrectans');
             }
         }

         if (usransArr) {
             for (var k = 0; k < usransArr.length; k++) {
                 $('#' + resqid + ' li:nth-child(' + usransArr[k] + ')').children("span").replaceWith("<span><span class='pcincorrect'><img src='" + settings.libraryPath + "assets/images/offlineCheckCross.svg'></span></span>");
                 $('#' + resqid + ' li:nth-child(' + usransArr[k] + ')').addClass('mcqmultiincorrect');
                 var fbtext = $('#' + resqid + ' li:nth-child(' + usransArr[k] + ')').children('.multifbtext').text();

                 $('#' + resqid).children('.resultmcqmulti').css("display", "block");
                 if (fbtext.length != 0) {
                     $('#' + resqid).children('.resultmcqmulti').append('<lable class="suggesttext"> Please revise the following:</lable>');
                     $('#' + resqid).children('.resultmcqmulti').append('<p class="show_fb">' + fbtext + '</span>');
                 }

             }
         }

         $("#fb_" + resqid).children('.fbheader').css("display", "block");
         if (resAns == corAns) {
             ansCheck = 1;
             if (ansCheck == 1) {
                 corrAnsCount += 1;
             }
             $("#" + resqid).removeClass('nochoicemcqmulti');
             $("#" + resqid).removeClass('nochoicemcqmultieng');
         } else {
             ansCheck = 2;
             $("#" + resqid).removeClass('nochoicemcqmulti');
             $("#" + resqid).removeClass('nochoicemcqmultieng');
         }
     };

     $(".mcqmulti_feedback").click(function() {
         id = $(this).attr('id');
         $("#" + id).children('.fbparagraph').fadeToggle(500);
     });

     multiple_MCQ.prototype.getmcqmultiData = function() {
         var selectSql = 'SELECT * FROM PageAnswers';
         var dbObj = new QueryManager();
         dbObj.runQuery(selectSql, dbFile, function(results) {
             var len = results.length;
             for (var il = 0; il < len; il++) {
                 resqid = results[il].QID;
                 resans = results[il].Answer;
                 restype = results[il].Type;
                 usransArr = resans.split(",");
                 if (len) {
                     if (restype == 13) {
                         for (ians = 0; ians < usransArr.length; ians++) {
                             $("#" + resqid + " li:nth-child(" + usransArr[ians] + ")").addClass('mcqhighlight');
                             $("#" + resqid + " li:nth-child(" + usransArr[ians] + ") .choicemcqmulti").addClass('hlmcqmulti');
                         }
                     }
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
     _this.initMCQMULTI();
 };