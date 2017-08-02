/*---- 16.09.2016-----*/
var CustomBtn = new ( function() {
    var _this = this;
    var dbFile = "";
    var pageID;
    _this.init = function() {
     setTimeout(function() {
    var offBtnCustom = $(".CheckMyAnsBtnCustom");
    if (offBtnCustom) {
        var activityID = offBtnCustom.attr('id');
        pageID = activityID;
        if (activityID != "" && activityID != undefined) {
            activityID = "offlineans_" + activityID;
            dbFile = libraryVar.DocumentPath + "/Sync/" + libraryVar.unitID + "/" + libraryVar.CurrentUserID + "/userDB/" + activityID;
            var createSql = 'CREATE TABLE IF NOT EXISTS PageAnswers (ID VARCHAR(64) primary key, QID VARCHAR(50), Answer text, Type integer , Mark integer)';
            var dbObj = new QueryManager();
            dbObj.runQuery(createSql, dbFile, function(results) {
                _this.checkExistingAnswer();
                _this.checkAnswerBtn();
            });
        }
    }
    }, 100);

    $(".dicshow").click(function() {
        var showWord = $(this).text();
        showWord = showWord.toLowerCase();
        showWord = showWord.replace(/^\s+|\s+$/gm, '');
        Dictionaryshow(showWord);
    });

    $(".dicshowdiffmeaning").click(function() {
        var showWord = $(this).attr('name');
        showWord = showWord.toLowerCase();
        showWord = showWord.replace(/^\s+|\s+$/gm, '');
        Dictionaryshow(showWord);
    });

};


_this.checkExistingAnswer = function() {
    var selectSql = 'SELECT * FROM PageAnswers WHERE Type=9';
    var dbObj = new QueryManager();
    dbObj.runQuery(selectSql, dbFile, function(results) {
        if (results.length == 0) {
            _this.addCheckEvent();
        } else {
            _this.disableCheckSupport();
        }
        _this.checkForAnswer(results.length);
        _this.getReloadAnswer(results.length);
    });
};


_this.addCheckEvent = function() {
    // alert("add check event");
        $('.typeandcheck').focusout(function() {
            var changedqid = $(this).attr('id');
            strAns = $(this).val(); //alert(strAns);
            var selectSql = 'SELECT * FROM PageAnswers WHERE QID="' + changedqid + '"';
            var dbObj = new QueryManager();
            dbObj.runQuery(selectSql, dbFile, function(results) {
                if (results.length) {
                    _this.UpdateData(strAns, results[0].ID);
                } else {
                    var generatedid = MD5(libraryVar.CurrentUserID + "" + $.now());
                    _this.InsertData(generatedid, changedqid, strAns, 2);
                }
            });
        });

        $('.selsuggestion').change(function() {
            changedqid = $(this).attr('id');
            strAns = $(this).val();
            var selectSql = 'SELECT * FROM PageAnswers WHERE QID="' + changedqid + '"';
            var dbObj = new QueryManager();
            dbObj.runQuery(selectSql, dbFile, function(results) {
                if (results.length) {
                    _this.UpdateData(strAns, results[0].ID);
                } else {
                    var generatedid = MD5(libraryVar.CurrentUserID + "" + $.now());
                    _this.InsertData(generatedid, changedqid, strAns, 3);
                }
            });

        });
        $('.rowmchoice').click(function(e) {
            $(this).toggleClass("highlight");
            rethasclass = $(this).hasClass("highlight");
            changedqid = "";
            valMark = "";
            objparent = $(this).parent().parent();
            changedqid = objparent.attr('id');
            objchild = $(this).children('.mclabel');
            if (objchild.hasClass("lblfirst")) {
                valMark = 1;
            } else if (objchild.hasClass("lblsecond")) {
                valMark = 2;
            } else if (objchild.hasClass("lblthird")) {
                valMark = 3;
            } else if (objchild.hasClass("lblfourth")) {
                valMark = 4;
            }

            var selectSql = 'SELECT * FROM PageAnswers WHERE QID="' + changedqid + '"';
            var dbObj = new QueryManager();
            dbObj.runQuery(selectSql, dbFile, function(results) {
                var len = results.length;
                if (len) {
                    var resid = results[0].ID;
                    var resans = results[0].Answer;
                    strAns = "";
                    if (rethasclass) {
                        strAns = resans + "," + valMark;
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
                        var deleteSql = 'DELETE FROM PageAnswers WHERE QID="' + changedqid + '"';
                        var dbObj = new QueryManager();
                        dbObj.runQuery(deleteSql, dbFile, function(results) {

                        });
                    } else {
                        _this.UpdateData(strAns, resid);

                    }
                } else {
                    if (rethasclass) {
                        generatedid = MD5(libraryVar.CurrentUserID + "" + $.now());
                        _this.InsertData(generatedid, changedqid, valMark, 1);
                    }
                }
            });
        });
        $('.mchoiceqd').click(function() {
            $(this).addClass("highlight1");
            rethasclass = $(this).hasClass("highlight1");
            rethasclass1 = $(this).next("a");
            changedqid = "";
            valMark = "";
            objparent = $(this).parent().parent();
            changedqid = objparent.attr('id');
            istherehightlight = $(this).parent().siblings('li').find('span').hasClass("highlight1");
            if (istherehightlight == true) {
                $(this).parent().siblings('li').removeClass("hightlightParentPortion");
                $(this).parent().siblings('li').find('span').removeClass("highlight1");
                $(this).parent().siblings('li').find('span').addClass("mcqdic");
            }
            objchild = $(this).siblings('.mcqdlabel');
            if (objchild.hasClass("lbfirst")) {
                valMark = 1;
            } else if (objchild.hasClass("lbsecond")) {
                valMark = 2;
            } else if (objchild.hasClass("lbthird")) {
                valMark = 3;
            } else if (objchild.hasClass("lbfourth")) {
                valMark = 4;
            }
            $(this).parent().addClass("hightlightParentPortion");

            var selectSql = 'SELECT * FROM PageAnswers WHERE QID="' + changedqid + '"';
            var dbObj = new QueryManager();
            dbObj.runQuery(selectSql, dbFile, function(results) {
                var len = results.length;
                if (len) {
                    var resid = results[0].ID;
                    var resans = results[0].Answer;
                    strAns = "";
                    if (rethasclass1) {
                        strAns = valMark;
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
                        var deleteSql = 'DELETE FROM PageAnswers WHERE QID="' + changedqid + '"';
                        var dbObj = new QueryManager();
                        dbObj.runQuery(deleteSql, dbFile, function(results) {

                        });
                    } else {
                        _this.UpdateData(strAns, resid);
                    }
                } else {

                    if (rethasclass1) {
                        generatedid = MD5(libraryVar.CurrentUserID + "" + $.now());
                        _this.InsertData(generatedid, changedqid, valMark, 4);
                    }
                }
            });
        });
    };

    _this.UpdateData = function(strAns, resid) {
        var updateSql = "UPDATE PageAnswers SET Answer='" + strAns + "' WHERE ID='" + resid + "'";
        var dbObj = new QueryManager();
        dbObj.runQuery(updateSql, dbFile, function(results) {

        });
    };

    _this.InsertData = function(generatedid, changedqid, strAns, type) {
        var insertSql = 'INSERT INTO PageAnswers (ID, QID, Answer, Type) VALUES ("' + generatedid + '","' + changedqid + '","' + strAns + '","' + type + '")';
        var dbObj = new QueryManager();
        dbObj.runQuery(insertSql, dbFile, function(results) {

        });
    };

    _this.showTypeOne = function() {
        splcoransArr = resqid.split("_");
        coransArr = splcoransArr[0].split("-");
        ansCheck = 1;
        for (ians = 0; ians < coransArr.length; ians++) {
            ansdtlchk = 0;
            for (ians = 0; ians < coransArr.length; ians++) {
                ansdtlchk = 0;
                for (uans = 0; uans < usransArr.length; uans++) {
                    if (coransArr[ians] == usransArr[uans]) {
                        ansdtlchk = 1;
                    }
                }
                if (ansdtlchk == 0) {
                    ansCheck = 0;
                }
            }

            if (ansCheck == 1) {
                $("#" + resqid).addClass('mccorrect');
                corrAnsCount += 1;
            } else {
                $("#" + resqid).addClass('mcincorrect');
            }
        }
    };

    _this.showTypeTwo = function() {
        $("#" + resqid).val(resans);
        resans = resans.replace(/^\s+|\s+$/gm, '');
        tcname = $("#" + resqid).attr("name");
        tccorrectans = $("#answer_" + resqid).val();
        tccorrectans1 = $("#answer1_" + resqid).val();
        tccorrectans2 = $("#answer2_" + resqid).val();
        tccorrectans3 = $("#answer3_" + resqid).val();
        tccorrectans4 = $("#answer4_" + resqid).val();
        tccorrectans5 = $("#answer5_" + resqid).val();

        var oriWidth = $("#" + resqid).width();
        if (resans == tccorrectans) {
            $("#" + resqid).replaceWith('<span name="' + tcname + '" id="' + resqid + '"><span class="truesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckTick.svg"></span>' + tccorrectans + '</span>');
            $("#" + resqid).addClass('tccorrectAns');
            corrAnsCount += 1;
        } else if (resans == tccorrectans1) {
            $("#" + resqid).replaceWith('<span name="' + tcname + '" id="' + resqid + '"><span class="truesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckTick.svg"></span>' + tccorrectans1 + '</span>');
            $("#" + resqid).addClass('tccorrectAns');
            corrAnsCount += 1;
        } else if (resans == tccorrectans2) {
            $("#" + resqid).replaceWith('<span name="' + tcname + '" id="' + resqid + '"><span class="truesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckTick.svg"></span>' + tccorrectans2 + '</span>');
            $("#" + resqid).addClass('tccorrectAns');
            corrAnsCount += 1;
        }else if (resans == tccorrectans3) {
            $("#" + resqid).replaceWith('<span name="' + tcname + '" id="' + resqid + '"><span class="truesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckTick.svg"></span>' + tccorrectans3 + '</span>');
            $("#" + resqid).addClass('tccorrectAns');
            corrAnsCount += 1;
        }else if (resans == tccorrectans4) {
            $("#" + resqid).replaceWith('<span name="' + tcname + '" id="' + resqid + '"><span class="truesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckTick.svg"></span>' + tccorrectans4 + '</span>');
            $("#" + resqid).addClass('tccorrectAns');
            corrAnsCount += 1;
        }else if (resans == tccorrectans5) {
            $("#" + resqid).replaceWith('<span name="' + tcname + '" id="' + resqid + '"><span class="truesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckTick.svg"></span>' + tccorrectans5 + '</span>');
            $("#" + resqid).addClass('tccorrectAns');
            corrAnsCount += 1;
        }else {
            $("#" + resqid).replaceWith('<span name="' + tcname + '" id="' + resqid + '"><span class="falsesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckCross.svg"></span>' + resans + '</span>');
            $("#" + resqid).addClass('tcincorrectAns');
        }

        $(".tccorrectAns").css({"background-color": "green", "color": "white" ,"border-radius" : '5px' , "padding" : "0 1px" , "line-height" : '1' , "width" : oriWidth , "display" : "inline-block"});
        $(".tcincorrectAns").css({"background-color": "red", "color": "white" ,"border-radius" : '5px' , "padding" : "0 1px" , "line-height" : '1' , "width" : oriWidth , "display" : "inline-block"});
         $("#" + resqid).children("span").css("margin","5px 1px 5px 5px");
    };

    _this.showTypeThree = function() {
        optval = $("#" + resqid + " option[value='" + resans + "']").text();
        optname = $("#" + resqid).attr("name");
        splcoransArr = resqid.split("_");
        coransstr = splcoransArr[0];
        if (resans == coransstr) {
            $("#" + resqid).replaceWith('<span style=border-radius:5px;padding:10px; name="' + optname + '" id="' + resqid + '"><span class="truesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckTick.svg"></span>' + optval + '</span>');
            $("#" + resqid).addClass('thcorrect');
            corrAnsCount += 1;
        } else {
            $("#" + resqid).replaceWith('<span style=border-radius:5px;padding:10px; name="' + optname + '" id="' + resqid + '"><span class="falsesign"><img src="' + settings.libraryPath + 'assets/images/offlineCheckCross.svg"></span>' + optval + '</span>');
            $("#" + resqid).addClass('thincorrect');
        }
        $("#" + resqid).val(resans);
    };

    _this.showTypeFour = function() {
        $('br').remove();
        splcoransArr = resqid.split("_");
        coransArr = splcoransArr[0].split("-");
        ansCheck = 1;
        for (ians = 0; ians < coransArr.length; ians++) {
            ansdtlchk = 0;
            for (uans = 0; uans < usransArr.length; uans++) {
                if (coransArr[ians] == usransArr[uans]) {
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ') .mchoiceqd').replaceWith("<span style='padding-left: 3px;'><span class='pccorrect'><img src='" + settings.libraryPath + "assets/images/offlineCheckTick.svg'></span></span>");
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ')').addClass('mcqdcorrect');
                    heightParent = $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ')').height();
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ').mcqdcorrect .anstext').height(heightParent);
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ').mcqdcorrect .anstext').css("line-height", heightParent + 'px');
                    ansdtlchk = 1;
                } else {
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ') .mchoiceqd').replaceWith("<span style='padding-left: 3px;'><span class='pcincorrect'><img src='" + settings.libraryPath + "assets/images/offlineCheckCross.svg'></span></span>");
                    $('#' + resqid + ' li:nth-child(' + coransArr[ians] + ')').addClass('correctans');
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ')').addClass('mcqdincorrect');
                    heightParent = $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ')').height();
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ').mcqdincorrect .anstext').height(heightParent);
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ').mcqdincorrect .anstext').css("line-height", heightParent + 'px');
                    ansdtlchk = 2;
                    widthLI = $('#' + resqid + '.nochoicemcqd').width();
                    widthLI = widthLI + widthLI * 0.015;
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ').mcqdincorrect .mcqdans').width(widthLI + "px");
                    $('#' + resqid + ' li:nth-child(' + usransArr[ians] + ').correctans .mcqdans').width(widthLI + "px");
                }
                if (ansdtlchk == 2) {
                    ansCheck = 0;
                }

            }
            if (ansCheck == 1) {
                corrAnsCount += 1;
                $("#" + resqid).removeClass('nochoicemcqd');
            } else {
                $("#" + resqid).removeClass('nochoicemcqd');
                $("#" + resqid).addClass('suggestionmcqd');
                $('.suggesttext').text("Please revise the following:");
            }
        }
        for (ians = 0; ians < usransArr.length; ians++) {
            $("#" + resqid + " li:nth-child(" + usransArr[ians] + ")").addClass('hightlightParentPortion');
            $("#" + resqid + " li:nth-child(" + usransArr[ians] + ") .mchoiceqd").addClass('highlight1');
        }
    };

    _this.getReloadAnswer = function(){
        // alert("reload answer");
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
                    if(restype == 1){
                        for (ians = 0; ians < usransArr.length; ians++) {
                            $("#" + resqid + " li:nth-child(" + usransArr[ians] + ") .rowmchoice").addClass('highlight');
                        }
                    }
                    else if(restype == 2){
                        $("#" + resqid).val(resans);
                    }
                    else if(restype == 3){
                        $("#" + resqid).val(resans);
                    }
                    else if(restype == 4){
                        for (ians = 0; ians < usransArr.length; ians++) {
                            $("#" + resqid + " li:nth-child(" + usransArr[ians] + ")").addClass('hightlightParentPortion');
                            $("#" + resqid + " li:nth-child(" + usransArr[ians] + ") .mchoiceqd").addClass('highlight1');
                        }
                    }
                }
            };
        });
    };

_this.disableCheckSupport = function() {
        $('.multichoiceqd').addClass('nochoicemcqd');
        $('.fillblank').addClass('tcincorrect');
        $('.typeandcheck').addClass('tcnotenter');
        $('.typeandcheck').attr("disabled", "disabled");
        $('.olmultichoice').addClass('mcincorrect');
        $('select').addClass('thincorrect');
        $('.array_tag_handler').attr("disabled", "disabled");
};

 _this.checkForAnswer = function(len9) {
    // alert("checkAnswerBtn");
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
                        case 1:
                            _this.showTypeOne();
                            continue;
                        case 2:
                            _this.showTypeTwo();
                            continue;
                        case 3:
                            _this.showTypeThree();
                            continue;
                        case 4:
                            _this.showTypeFour();
                            continue;
                        case 5:
                            showTypefive();
                            continue;
                        case 6:
                            showTypeSix();
                            continue;
                        case 7:
                            showTypeSeven();
                            continue;
                        case 8:
                            showTypeEight();
                            continue;
                        case 10:
                            showTypeTen();
                            continue;
                        case 11:
                            showTypeEleven();
                            continue;
                    }
                }
            }
        });
    };

_this.checkAnswerBtn = function() {
    // alert("show btn");
    var actSbmtBtn = document.getElementsByClassName("CheckMyAnsBtnCustom");
    var customBtn = $(".CheckMyAnsBtnCustom");
    var resertImg = $(".CheckMyAnsBtnCustom").attr('resertvalue');
    var checkImg = $(".CheckMyAnsBtnCustom").attr('value');
    var returnid = "";
    for (var i = 0; i < actSbmtBtn.length; i++) {
        var objactsubmits = actSbmtBtn.item(i);
        objactsubmits.setAttribute("align", "center");
        var newlink = document.createElement('a');
        newlink.setAttribute('class', 'testbtn');
        newlink.setAttribute('href', 'javascript:return;');
        returnid = objactsubmits.id;
        var selSql = 'SELECT * FROM PageAnswers WHERE Type=9';
        var dbObj = new QueryManager();
        newlink.innerHTML = "<img src='"+checkImg+"' style='border-style: none;'>";

        dbObj.runQuery(selSql, dbFile, function(results) {
            if (results.length > 0) {
                newlink.innerHTML = "<img src='"+resertImg+"' style='border-style: none;'>";
            } else {
                newlink.innerHTML = "<img src='"+checkImg+"' style='border-style: none;'>";
            }
        });
        newlink.onclick = function() {
            var selectSql = 'SELECT * FROM PageAnswers WHERE Type=9';
            var dbObj = new QueryManager();
            dbObj.runQuery(selectSql, dbFile, function(results) {
                if (results.length > 0) {
                    var delSql = 'DELETE FROM PageAnswers';
                    var dbObj = new QueryManager();
                    dbObj.runQuery(delSql, dbFile, function(results) {
                        window.location.reload();
                    });
                } else {
                    var totanAns = 0;
                    var correctAnsCount = 0;
                    var selectSql = 'SELECT * FROM PageAnswers';
                    var dbObj = new QueryManager();
                    dbObj.runQuery(selectSql, dbFile, function(results) {
                        var len = results.length;
                        totanAns = len;
                        correctAnsCount = 0;
                        for (var il = 0; il < len; il++) {
                            resqid = results[il].QID;
                            resans = results[il].Answer;
                            splcoransArr = resqid.split("_");
                            coransArr = splcoransArr[0].split("-");
                            usransArr = resans.split(",");
                            ansCheck = 1;
                            for (var ians = 0; ians < coransArr.length; ians++) {
                                ansdtlchk = 0;
                                for (uans = 0; uans < usransArr.length; uans++) {
                                    if (coransArr[ians] == usransArr[uans]) {
                                        ansdtlchk = 1;
                                    }
                                }

                                if (ansdtlchk == 0) {
                                    ansCheck = 0;
                                }
                            }

                            if (ansCheck == 1) {
                                correctAnsCount = correctAnsCount + 1;
                            }
                        }
                        var generatedid = MD5(libraryVar.CurrentUserID + "" + $.now());
                        var insertSql = 'INSERT INTO PageAnswers (ID, QID, Answer, Type) VALUES ("' + generatedid + '","' + returnid + '","' + correctAnsCount + '",9)';
                        var dbObj = new QueryManager();
                        dbObj.runQuery(insertSql, dbFile, function(results) {
                            window.location.reload();
                        });
                    });
                }

            });

        };
        objactsubmits.appendChild(newlink);
    };
};
    _this.init();
});
