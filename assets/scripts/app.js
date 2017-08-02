//Declare Global Variables 17.7.2017
var gui = require('nw.gui');
var guiWindow = gui.Window.get();
var async = require("async");
var fs = require('fs');
var fs = require('fs-extra');
var md5 = require('md5');
var mkdirp = require('mkdirp');
var rmdir = require('rimraf');
var readdir = require('readdir');
var asyncLoop = require('node-async-loop');
var forEach = require('async-foreach').forEach;
var sqlite3 = require('sqlite3').verbose();
var cheerio = require('cheerio');
var fileName;
var selectItem;
var quizNo;
var bookID, ExName;
var md5Id;
var md5Data;
var gpackdir;
var tools,Reporturl;
var PageNumDisplay = 2;
var closeFlag = 1;
var gContentDir, gUserDB;
var content_data = ["", ""];
var count = 0;
var colorcount = 0;
var colorCode = [
    ["#ED145B", "#F6989D"],
    ["#EC008C", "#F49AC2"],
    ["#92278F", "#BC8DBF"],
    ["#662D91", "#A187BE"],
    ["#2E3192", "#8882BE"],
    ["#0054A6", "#8493CA"],
    ["#0072BC", "#7EA7D8"],
    ["#00AEEF", "#6ECFF6"],
    ["#00A99D", "#7BCDC8"],
    ["#00A651", "#82CA9D"],
    ["#39B54A", "#A2D39C"],
    ["#8DC73F", "#C4DF9B"],
    ["#FFF200", "#FFF79A"],
    ["#F7941D", "#FDC68A"],
    ["#F26522", "#F9AD81"],
    ["#ED1C24", "#F7977A"]
];

(function($) {
    guiWindow.title = "Question Book Generator";
    // Create default menu items for OSX
    if (process.platform === 'darwin') {
        var mb = new gui.Menu({
            type: "menubar"
        });
        mb.createMacBuiltin(gui.App.manifest.productName);
        guiWindow.menu = mb;
    }

    async.waterfall(
        [
            openDirectory,
            createWorkingDir,
            createContentSyn,
            readTextfiles,
            copyRequireFiles,
            copyCoverProgressReport,
            generatecontentsDB,
            generatemarkExercise,
            searchDBGenerating,
            zipprocess
        ],
        function(error, success) {
            console.log(success)
            if (error) {
                alert('Something is wrong!');
            }
            $("#zipDir").html(chooseFilePath + '/' + bookID + '.zip');
            return alert('Done!');
        });

    function openDirectory(cb) {
        var Dirlaunch, homePath;
        homePath = process.env.HOME;
        if (homePath) {
            document.querySelector('#fileDialog').setAttribute("nwworkingdir", homePath);
            var chooser = document.querySelector('#fileDialog');
            $('title').text("Please Select text files to generate the book.");
            chooser.click();
            var choosefile = chooser.addEventListener("change", function(evt) {
                chooseFilePath = this.value;
                selectItem = getFiles(chooseFilePath);
                selectItem = selectItem.sort();
                console.log(selectItem);
                if ($.inArray("bookID.txt", selectItem) !== -1) {
                    var index = $.inArray("bookID.txt", selectItem);
                    selectItem.splice(index, 1);
                }
                $("#1 .preloaderImage").hide();
                $("#1 .statussample").show();
                if (selectItem == "" || selectItem == undefined) {
                    ErrorState(1);
                } else {
                    $("#1").addClass("activeSucceed");
                    $("#2").show();
                    var dir = chooseFilePath + '/WorkingDirectory';
                    if (fs.existsSync(dir)) {
                        var bookIdpath = chooseFilePath + '/WorkingDirectory/Contents';
                        var filenames = fs.readdirSync(bookIdpath);
                        if (filenames) {
                            bookID = filenames;
                            if (/.DS_Store,/g.test(bookID) == true) {
                                bookID = bookID.toString().replace(".DS_Store,", "");
                            }
                            rmdir(chooseFilePath + '/WorkingDirectory', function(error) {
                                cb(null, bookID);
                            });
                        }
                    } else {
                        cb(null, chooseFilePath);
                    }
                }

            });
        }
        $("#1").show();
    }

    function getFiles(dir, files_) {
        files_ = files_ || [];
        var fs = require("fs");
        var files = fs.readdirSync(dir);
        for (var i in files) {
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                getFiles(name, files_);
            } else {
                var path = require('path');
                if (path.extname(files[i]) === ".txt") {
                    files_.push(files[i]);
                }
            }
        }
        return files_;
    }

    function createWorkingDir(gpackdir, cb) {
        if (bookID) {
            cb(null, bookID);
        } else {
            var dirbookId = chooseFilePath + '/bookID.txt';
            fs.readFile(dirbookId, function(err, data) {
                if (err) {
                    data = chooseFilePath.split("/");
                    md5Data = data[data.length - 1];
                    md5Id = generatemd5Id(md5Data);
                    bookID = md5Id;
                } else {
                    bookID = data.toString();
                }
                cb(null, bookID);
            });
        }
    }

    function createContentSyn(bookID, cb) {
        console.log(bookID)
        var pack = 'WorkingDirectory';
        var packDir = chooseFilePath + '/' + pack + '/';
        async.parallel(
            [
                function(cb) {
                    var contentDir = packDir + 'Contents/' + bookID;
                    mkdirp(contentDir, function(err) {
                        if (err) cb(err);
                        else {
                            gContentDir = contentDir;
                            cb(null, "contentdir");
                        }
                    });
                },
                function(cb) {
                    var syncDir_Grading = packDir + 'Sync/' + bookID + '/Grading/';
                    mkdirp(syncDir_Grading, function(err) {
                        if (err) cb(err);
                        cb(null, "sync_grading");
                    });
                },
                function(cb) {
                    var syncDir_DB = packDir + 'Sync/' + bookID + '/userDB/';
                    mkdirp(syncDir_DB, function(err) {
                        if (err) cb(err);
                        else {
                            gUserDB = syncDir_DB;
                            cb(null, "sync_userdb");
                        }
                    });
                }
            ],
            function(err, results) {
                console.log("WorkingDir Results => ", results);
                if (err) {
                    console.log("WorkingDir Error => ", err);
                } else {
                    gpackdir = packDir;
                    console.log("Done createContentSyn")
                }
            }
        );
        $("#2 .preloaderImage").hide();
        $("#2 .statussample").show();
        $("#2").addClass("activeSucceed");
        $("#3").show();
        var confirmtool = confirm("Do you want to use Page level Tools for question!")
        if (confirmtool == true) {
            tools = './Template/version1_Pagelevel.html'; //Pagelevel
            Reporturl = './Template/progressreportPagelevel.html';

        } else {
            tools = './Template/version1.html'; //Individual
            Reporturl = './Template/progressreport.html';
        }
        selectCount = prompt("Please Enter the question count for each page.");
        cb(null, selectCount,tools);
    }

    function readTextfiles(selectCount, tools, cb) {
        console.log("tools " + tools);
        asyncLoop(selectItem, function(item, next) {
            var file = chooseFilePath + "/" + item;
            fs.readFile(file, 'utf8', function(err, data) {
                var dataArr = data.split("#");
                var existPageId = dataArr[0].indexOf("pageID");
                //Add unique Id for question
                for (var i = 1; i < dataArr.length; i++) {
                    eachline = dataArr[i].split("\n");
                    if (eachline[0] == 3) {
                        var typethree = dataArr[i].split("&&");
                        for (var j = 0; j < typethree.length; j++) {
                            var eachliQue = typethree[j].split("\n");
                            if (eachliQue[1].indexOf("uniqueID") == -1) {
                                if (eachliQue[0] != 3) {
                                    var uniqueIDQ = generateID(33);
                                    eachliQue[0] = eachliQue[0] + "\nuniqueID" + uniqueIDQ;
                                }
                            }
                            typethree[j] = eachliQue.join("\n");
                        }
                        dataArr[i] = typethree.join("&&");
                    } else {
                        if (eachline[1].indexOf("uniqueID") == -1) {
                            var uniqueIDQ = generateID(33);
                            eachline[0] = eachline[0] + "\nuniqueID" + uniqueIDQ;
                        }
                        dataArr[i] = eachline.join('\n');
                    }
                }

                var dataUpdate = dataArr.join('#');
                var pageID;
                if (existPageId != -1) {
                    pageIDArr = dataArr[0].split("\n");
                    pageID = pageIDArr[0].replace("pageID", "");
                } else {
                    pageID = generatemd5Id(item);
                    dataUpdate = "pageID" + pageID + "\n" + dataUpdate; //Add page Id and data
                }
                pageID = pageID.trim();
                fs.readFile(tools, function(err, data) {
                    if (err) return console.error(err);
                    if (data) {
                        ExName = selectItem.indexOf(item) + 1;
                        generatehtmlfiles(ExName, data, dataUpdate, pageID, item);
                    }
                });
                var dataBuffer = new Buffer(dataUpdate);
                fs.unlink(file, function(err) {
                    if (err) {
                        console.log(err)
                    } else {
                        fs.writeFile(file, dataBuffer, function(err) {
                            count = count + 1;
                            $("#3 #nametxt").html(count);
                            next();
                        });
                    }
                });
            });
        }, function(err) {
            if (err) {
                cb(err);
            } else {
                $("#3 .preloaderImage").hide();
                $("#3 .statussample").show();
                $("#3 .descriptionsample").html("Text files read/write for PageID and uniqueID finished. ");
                $("#3 #nametxt").html("");
                $("#3").addClass("activeSucceed");
                $("#4").show();
                cb(null, 'get_data');
            }

        });
    }

    function generatehtmlfiles(ExName, htmldata, data, pageID, fileName) {
        quizNo = [0];
        var noQue = data.split("#");
        noQue.shift();
        var noPages = parseInt(noQue.length / selectCount);
        var noLeftQue = noQue.length % selectCount;
        if (noLeftQue > 2) {
            noPages++;
        }

        for (var i = 0; i < noPages; i++) {
            var pageCount = i + 1;
            if (colorcount > colorCode.length - 1) {
                colorcount = 0;
            }
            var colorChoose = (i == 0 ? colorCode[colorcount][0] : colorCode[colorcount][1]);
            var pagepath = chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/' + pageID + '_' + pageCount + '.html';
            pagepath = pagepath.replace(/(\r\n|\n|\r)/gm, "");
            pagepath = pagepath.replace(/(\u000D)/g, "");
            var txtTitle = fileName.split("-");
            pageTitle = txtTitle[1].replace(".txt", "");
            var htmlnameArr = pagepath.split("/");
            htmlname = htmlnameArr[htmlnameArr.length - 1];
            if (i == noPages - 1) {
                var QList = [];
                if (noQue.length == 1) {
                    for (var j = 0; j < noQue.length; j++) {
                        noQueArr = noQue[(selectCount * i) + j];
                        QList.push(noQueArr);
                    }
                } else {
                    for (var j = (selectCount * i); j < noQue.length; j++) {
                        QList.push(noQue[j]);
                    }
                }
                var page_data = [pageID + '_' + pageCount, pageTitle, ExName, ++PageNumDisplay, pageID, QList.length, noQue.length, colorChoose];
                content_data.push(page_data);
                colorcount++;
                readFileandreplace(htmldata, QList, htmlname, ExName, (selectCount * i) + 1, fileName);
            } else {
                var QList = [];
                for (var j = 0; j < selectCount; j++) {
                    noQueArr = noQue[(selectCount * i) + j];
                    QList.push(noQueArr);
                }
                var page_data = [pageID + '_' + pageCount, pageTitle, ExName, ++PageNumDisplay, pageID, QList.length, noQue.length, colorChoose];
                content_data.push(page_data);
                console.log(content_data);
                readFileandreplace(htmldata, QList, htmlname, ExName, (selectCount * i) + 1, fileName);
            }
        }
    }

    function readFileandreplace(data, QList, htmlname, ExName, StartNo, pageTitle, cb) {
        var mystr = data.toString();
        // mystr = mystr.split("Exercise Number").join("Exercise " + ExName);
        var toolsSplitting = mystr.split("<!-- Question-->");
        var toolsnippet = toolsSplitting[1];
        var toolhtmlrealcode = "";
        var pageQC = [];

        //Question count loop 
        for (var i = 0; i < QList.length; i++) {
            var Q1answer = '';
            var serialno = 0;
            var mcqItem = '';
            var Qpart = QList[i].split("\n");
            var Q1 = toolsnippet;
            var addNumber;
            if (Qpart[0] == 3) {
                var StartNov3 = 0;
                var Qpart1 = QList[i].split("&&");
                var extrapart;

                //type 3 Question loop
                for (var k = 1; k < Qpart1.length; k++) {
                    var mcqItemv3 = '';
                    var serialnov3 = 0;
                    var Q1answer = "";
                    var Qpart2 = Qpart1[k].split("\n");
                    var Qpart0 = Qpart1[0].split("\n");

                    //add paragraph and image for type 3
                    if (k == 1) {
                        for (var t = 1; t < Qpart0.length; t++) {
                            if (Qpart0[t].match("&2")) {
                                var ParagraphText = Qpart0[t].substring(2, Qpart0[t].length);
                                if(ParagraphText.match("@@audio<")){
                                    parab = ParagraphText.split('@@audio<').join("<audio src='")
                                    extrapart = parab.split('@@audio>').join("' preload='auto'></audio>");
                                    if (ParagraphText.match("@@p<")) {
                                        extrapart = extrapart.split('@@p<').join("<div class='paragraph head'>")
                                        extrapart = extrapart.split('@@p>').join("</div>");
                                    }
                                }else{
                                    console.log("text")
                                    extrapart = "<div class='header'>" + ParagraphText + "</div>";
                                }
                            }else if (ParagraphText.match("@@pborder<")) {
                                parab = ParagraphText.split('@@pborder<').join("<div class='paragraphborder'>")
                                extrapart += parab.split('@@pborder>').join("</div>");
                            }else if (/^[\@@p<].*[\@@p>]$/m.test(Qpart0[t])) {
                                parab = Qpart0[t].split('@@p<').join("<div class='paragraph'>")
                                extrapart += parab.split('@@p>').join("</div>");
                            } else if (Qpart0[t].match("@@>")) {
                                parab = Qpart0[t].split('@@<').join('<div class="imgt3"><img src="./images/');
                                extrapart += parab.split("@@>").join('"></div>'); //<img src="">
                            }else if (Qpart0[t].match("@@audio<")) {
                                parab = Qpart0[t].split('@@audio<').join("<audio src='")
                                extrapart += parab.split('@@audio>').join("' preload='auto'></audio>");
                            }

                        }
                        // console.log(extrapart)
                        Q1 = '<div class="clearfix group">' + extrapart + '</div>' + Q1;
                    } else {
                        Q1 = toolsnippet;
                    }

                    //change question for type 3 
                    for (var j = 0; j < Qpart2.length; j++) {
                        if (Qpart2[j].trim()) {
                            var Qtitle = Qpart2[j].substring(0, Qpart2[j].length);
                            if (/^\d+$/.test(Qtitle.trim())) {
                                Q1 = Q1.toString().replace("Question1", "");
                            }else if(/^[\@@audio<].*[\@@audio>]$/m.test(Qpart2[j])) {
                                parabaudio = Qpart2[j].split('@@audio<').join("<audio src='")
                                parabaudio = parabaudio.split('@@audio>').join("' preload='auto'></audio>");
                                Q1 = Q1.toString().replace("Question1", parabaudio);
                            }else {
                                Q1 = Q1.toString().replace("Question1", Qtitle);
                            }
                        }
                        
                        if (/^[\+-]/.test(Qpart2[j])) {
                            serialnov3++;
                            if (Qpart2[j].substring(0, 1) == "+") {
                                Q1answer = Q1answer + serialnov3 + ",";
                            }
                            mcqItemv3 = mcqItemv3 + '<li><span class="choicemcqmulti"></span> <a class="mcqmultifirst">(' + Qpart2[j].substring(1, 2) + ')' + Qpart2[j].substring(2, Qpart2[j].length) + '</a></li>';
                        }else if (/^[\@].*[\@]$/m.test(Qpart2[j])) {
                            Q1 = Q1.toString().replace("Feedback Title", Qpart2[j].split("@").join(""));
                            Q1 = Q1.toString().replace("Feedback Paragraph", Qpart2[j + 1]);
                            j++;
                        }else {
                            var matchpara = Qpart2[j].match("@@p>");
                            var matchparab = Qpart2[j].match("@@pborder>");
                            if (matchpara) {
                                parab = Qpart2[j].split('@@p<').join("<div class='paragraph'>")
                                parab = parab.split('@@p>').join("</div><!--Paragraph-->");
                                Q1 = Q1.toString().replace("<!--Paragraph-->", parab);
                            } else if (matchparab) {
                                parab = Qpart2[j].split('@@pborder<').join("<div class='paragraphborder'>")
                                parab = parab.split('@@pborder>').join("</div><!--Paragraph-->");
                                Q1 = Q1.toString().replace("<!--Paragraph-->", parab);
                            }
                        }
                    }
                    pageNo = StartNo + i;
                    lasarr = quizNo[quizNo.length - 1];
                    Q1 = Q1.toString().split('<li><span class="choicemcqmulti"></span> <a class="mcqmultifirst">Q1.1</a></li>').join(mcqItemv3);
                    var feedbacRemoval = '<div class="mcqmulti_feedback" id="fb_Q1uniqueID"><div class="fbheader"><span>Feedback Title</span></div><div class="fbparagraph">Feedback Paragraph</div></div>';
                    Q1 = Q1.toString().replace(feedbacRemoval, "");
                    Q1answer = Q1answer.substring(0, Q1answer.length - 1);
                    Q1 = Q1.toString().replace("Q1answer", Q1answer);
                    Q1 = Q1.toString().replace("Number1", lasarr + 1);
                    quizNo.push(lasarr + 1)
                    pageQC.push(lasarr + 1)
                    Q1 = Q1.toString().split("@@<").join('<div class="imgt3"><img src="./images/'); //<img src="">
                    Q1 = Q1.toString().split("@@>").join('"></div>'); //<img src="">
                    var uniqueIDQ = Qpart2[1].replace("uniqueID", "");
                    Q1 = Q1.toString().split("Q1uniqueID").join(uniqueIDQ);
                    toolhtmlrealcode = toolhtmlrealcode + "" + Q1;
                }
            } 
            else {
                //type 1 and type 2 
                for (var j = 2; j < Qpart.length; j++) {
                    if (/^[\&12]/.test(Qpart[j])) {
                        var Qtitle = Qpart[j].substring(2, Qpart[j].length);
                        Q1 = Q1.toString().replace("Question1", Qtitle);
                    } else if (/^[\+-]/.test(Qpart[j])) {
                        serialno++;
                        if (Qpart[j].substring(0, 1) == "+") {
                            Q1answer = Q1answer + serialno + ",";
                        }
                        mcqItem = mcqItem + '<li><span class="choicemcqmulti"></span> <a class="mcqmultifirst">(' + Qpart[j].substring(1, 2) + ')' + Qpart[j].substring(2, Qpart[j].length) + '</a></li>';
                    } else if (/^[\@].*[\@]$/m.test(Qpart[j])) {
                        Q1 = Q1.toString().replace("Feedback Title", Qpart[j].split("@").join(""));
                        Q1 = Q1.toString().replace("Feedback Paragraph", Qpart[j + 1]);
                        j++;
                    } else if (Qpart[j].match("@@audio<")) {
                        parab = Qpart[j].split('@@audio<').join("<audio src='")
                        parab = parab.split('@@audio>').join("' preload='auto'></audio><!--Paragraph-->");
                        Q1 = Q1.toString().replace("<!--Paragraph-->", parab);
                    } else {
                        var matchpara = Qpart[j].match("@@p<");
                        var matchparab = Qpart[j].match("@@pborder<");
                        if (matchpara) {
                            parab = Qpart[j].split('@@p<').join("<div class='paragraphIn'>")
                            parab = parab.split('@@p>').join("</div><!--Paragraph-->");
                            Q1 = Q1.toString().replace("<!--Paragraph-->", parab);
                        } else if (matchparab) {
                            paraborder = Qpart[j].split('@@pborder<').join("<div class='paragraphborderIn'>")
                            paraborder = paraborder.split('@@pborder>').join("</div><!--Paragraph-->");
                            Q1 = Q1.toString().replace("<!--Paragraph-->", paraborder);
                        }
                    }
                }
                if (Qpart[0] == 2) {
                    Q1 = Q1.toString().replace('choicelimit="1"', "");
                }
                pageNo = StartNo + i;
                lasarr = quizNo[quizNo.length - 1];
                Q1 = Q1.toString().replace('<li><span class="choicemcqmulti"></span> <a class="mcqmultifirst">Q1.1</a></li>', mcqItem);
                var feedbacRemoval = '<div class="mcqmulti_feedback" id="fb_Q1uniqueID"><div class="fbheader"><span>Feedback Title</span></div><div class="fbparagraph">Feedback Paragraph</div></div>';
                Q1 = Q1.toString().replace(feedbacRemoval, "");
                Q1answer = Q1answer.substring(0, Q1answer.length - 1);
                Q1 = Q1.toString().replace("Q1answer", Q1answer);
                Q1 = Q1.toString().replace("Number1", lasarr + 1);
                quizNo.push(lasarr + 1)
                pageQC.push(lasarr + 1)
                Q1 = Q1.toString().split("@@<").join('<img src="./images/'); //<img src="">
                Q1 = Q1.toString().split("@@>").join('">'); //<img src="">
                var uniqueIDQ = Qpart[1].replace("uniqueID", "");
                Q1 = Q1.toString().split("Q1uniqueID").join(uniqueIDQ);
                toolhtmlrealcode = toolhtmlrealcode + "" + Q1;
            }
        }
        currentArr = [content_data.length - 1];
        currentArr[5] = pageQC.length;
        currentArr[6] = pageQC[pageQC.length - 1];
        var pidcut = htmlname.replace(".html", "");
        toolsSplitting[2] = toolsSplitting[2].split("pageID").join(pidcut);
        toolsSplitting[0] = toolsSplitting[0].split("Version1 Template").join(pidcut);
        toolsSplitting[0] = toolsSplitting[0].split("BaseMark").join(pageQC.length);
        mystr = toolsSplitting[0] + "" + toolhtmlrealcode + "" + toolsSplitting[2];
        mystr = mystr.split("pageID").join(pidcut);
        fs.writeFile(chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/' + htmlname, mystr, function(err) {
            if (err) {
                return console.log(err);
                cb(null, 'finishedhtml');
            }
        });
    }

    function copyRequireFiles(rtndata, cb) {
        console.log("copyRequireFiles")
        var cpFilesObj = {
            "images": {
                "srcpath": chooseFilePath + "/images",
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images'
            },
            "audiofiles": {
                "srcpath": chooseFilePath + "/audioAndVideo",
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/audioAndVideo'
            },
            "cssfiles": {
                "srcpath": './Template/css',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/css'
            },
            "copypwscript": {
                "srcpath": './Template/pwscripts',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/pwscripts'
            },
            "copyfont": {
                "srcpath": './Template/font',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/fonts'
            },
            "copyscripts": {
                "srcpath": './Template/scripts',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/scripts'
            },
            "copyshareedit": {
                "srcpath": './Template/img/shattered_edited.jpg',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images/shattered_edited.jpg'
            },
            "copycheckanswer": {
                "srcpath": './Template/img/checkanswerchinese.png',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images/checkanswerchinese.png'
            },
            "copyresetanswer": {
                "srcpath": './Template/img/resetanswer_chinese.png',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images/resetanswer_chinese.png'
            },
            "copychineselogo": {
                "srcpath": './Template/img/logo.png',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images/logo.png'
            },
            "copypwlogo": {
                "srcpath": './Template/img/pw_logo.png',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images/pw_logo.png'
            },
            "copymslogo": {
                "srcpath": './Template/img/ms_logo.png',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images/ms_logo.png'
            },
            "copypreloader": {
                "srcpath": './Template/img/preloader.gif',
                "destpath": chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/images/preloader.gif'
            }
        };

        asyncLoop(cpFilesObj, function(item, next) {
            srcpath = item.value.srcpath;
            destpath = item.value.destpath;
            fs.stat(srcpath, function(err, stats) {
                if (stats) {
                    fs.stat(destpath, function(err, stats) {
                        if (stats) {
                            fs.remove(destpath, function(err) {
                                if (err) next(err);
                                else {
                                    fs.copy(srcpath, destpath, function(err) {
                                        if (err) next(err);
                                        next();
                                    });
                                }
                            });
                        } else {
                            fs.copy(srcpath, destpath, function(err) {
                                if (err) next(err);
                                next();
                            });
                        }
                    });

                } else {
                    console.log(srcpath + " not exist ");
                    next();
                }
            })


        }, function(err) {
            if (err) {
                cb(err);
            } else {
                $("#4 .preloaderImage").hide();
                $("#4 .statussample").show();
                $("#4").addClass("activeSucceed");
                $("#5").show();
                cb(null, "copyRequireFiles_done");
            }

        });
    }

    function copyCoverProgressReport(rtxt, cb) {
        fs.createReadStream('./Template/cover.html').pipe(
            fs.createWriteStream(chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/cover.html')
        );
        content_data[0] = ["cover", "Cover Page", 1, 1, null, , , "#00AEEF"];
        $("#5 .preloaderImage").hide();
        $("#5 .statussample").show();
        $("#5").addClass("activeSucceed");
        $("#51").show();
        console.log("Reporturl " + Reporturl)
        fs.createReadStream(Reporturl).pipe(
            fs.createWriteStream(chooseFilePath + '/WorkingDirectory/Contents/' + bookID + '/progressreport.html')
        );
        content_data[1] = ["progressreport", "Progress Report", 1, 2, null, , , "#00AEEF"];
        $("#51 .preloaderImage").hide();
        $("#51 .statussample").show();
        $("#51").addClass("activeSucceed");
        $("#6").show();
        cb(null, "copyCoverProgressReport_done");
    }

    function generatecontentsDB(rtxt, cb) {
        var condb = new sqlite3.Database(gContentDir + "/contents.db");
        condb.serialize(function() {
            condb.run("CREATE TABLE IF NOT EXISTS Pages (PID VARCHAR(50), Title VARCHAR(50), SubTitle VARCHAR(50), ChapID VARCHAR(50), Contents TEXT, Type INTEGER, ColorHex VARCHAR(50), PageNum INTEGER, ActivityID VARCHAR(50), PageNumDisplay VARCHAR(50), isPrintable INTEGER, ExID VARCHAR(50))");
            condb.run("CREATE TABLE IF NOT EXISTS Activities (ActivityID VARCHAR(50), Name VARCHAR(50), Page VARCHAR(50))");
        });
        console.log(content_data)
        asyncLoop(content_data, function(item, next) {
            query = "INSERT INTO Pages(PID, Title, SubTitle, ChapID, Contents, Type, ColorHex, PageNum, ActivityID, PageNumDisplay, isPrintable, ExID) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
            condb.run(query, [item[0], item[1], "", "", "", 1, item[7], item[3], "", item[3], 0, item[4]], function(err) {
                if (err) {
                    console.log(err)
                }else{
                    next();
                }
            });

        },function (err) {
            if (err) {
                console.log(err)
            }else{
                condb.close();
                $("#6 .preloaderImage").hide();
                $("#6 .statussample").show();
                $("#6").addClass("activeSucceed");
                $("#6a").show();
                cb(null, 'generatecontentsDB_done');
            }
        });
    }

    function generatemarkExercise(rtxt, cb) {
        console.log("generatemarkExercise")
        var markdb = new sqlite3.Database(gUserDB + "/markExercise.db");
        markdb.serialize(function() {
            markdb.run("CREATE TABLE IF NOT EXISTS PagesMark (PID VARCHAR(50), QID VARCHAR(50), Title VARCHAR(50), PageScore INTEGER, ExerciseScore INTEGER, ScoreGain INTEGER, ExID VARCHAR(50), markDate VARCHAR(50))");
        });
        asyncLoop(content_data, function(item, next) {
            var btnCount = 0;
            var valuestr = [];
            filePath = gContentDir + "/"+ item[0] + ".html";
            fs.readFile(filePath, 'utf8', function(err, html){
                if(err){
                    callback(err);
                }
                else{
                    $ = cheerio.load(html);
                    var elements = $('.IndividualmcqBtn');
                    if(elements.length > 0){
                        btnCount += elements.length;
                        for(var e = 0; e < elements.length; e++){
                            var eleID = elements[e].attribs.id;
                            valuestr.push(eleID);
                        }
                        console.log(valuestr)
                        asyncLoop(valuestr, function(qID , next){
                            query = "INSERT INTO PagesMark(PID, QID , Title, PageScore, ExerciseScore, ScoreGain, ExID) VALUES (?,?,?,?,?,?,?)"
                            markdb.run(query, [item[0], qID , item[1], item[5], item[6], "", item[4]], function(err) {
                                if (err) {
                                    console.log(err)
                                }else{
                                    next();
                                }
                            });
                        }, function (err) {
                            if (err) {
                                console.log(err)
                            }else{
                                console.log("valuestr => " , valuestr);
                                next();
                            }
                        });
                    }
                    else{
                        query = "INSERT INTO PagesMark(PID, QID , Title, PageScore, ExerciseScore, ScoreGain, ExID) VALUES (?,?,?,?,?,?,?)"
                        markdb.run(query, [item[0], "" , item[1], item[5], item[6], "", item[4]], function(err) {
                            if (err) {
                                console.log(err)
                            }else{
                                next();
                            }
                        });
                    }
                }
                
            });
        }, function(err) {
            if (err) {
                cb(err);
            } else {
                markdb.close();
                contentId = document.getElementById('6a');
                tagspan = contentId.getElementsByTagName("span");
                tagspan[2].style.display = "none";
                tagspan[1].style.display = "block";
                contentId.className += " activeSucceed";
                var zipId = document.getElementById('6b');
                zipId.style.display = "block";
                console.log("done markExercises.db")
                cb(null, "markExercises_done");
            }
        });
    }

    //generate search.db 
    function searchDBGenerating(rtxt, cb) {
        console.log("searchDBGenerating")
        var db = new sqlite3.Database(gContentDir + '/contents.db');
        db.all("SELECT * FROM Pages;", function(err, rows) {
            if (rows) {
                var sdb = new sqlite3.Database(gContentDir + '/search.db');
                sdb.serialize(function() {
                    sdb.run("CREATE VIRTUAL TABLE contents USING fts4(file, content, tokenize=icu)"); //, tokenize=icu
                    sdb.run("CREATE TABLE contents_unicode (file text, content text)");
                });

                async.each(rows,
                    function(row, callback) {
                        fs.stat(gContentDir + "/" + row.PID + ".html", function(err, stats) {
                            if (stats) {
                                fs.readFile(gContentDir + "/" + row.PID + ".html", 'utf8', function(err, content) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        metadata = getmetadata(content);
                                        metadata = (metadata) ? metadata : "";
                                        rePattern = new RegExp("<[^<]+?>", "g");
                                        content = content.replace(rePattern, "") + metadata;
                                        query = "INSERT INTO contents(file, content) VALUES(?, ?)"
                                        unicode_query = "INSERT INTO contents_unicode(file, content) VALUES(?, ?)";
                                        sdb.run(query, [row.PID, content], function(err) {
                                            if (err) callback(err);
                                            else {
                                                sdb.run(unicode_query, [row.PID, content], function(err) {
                                                    if (err) callback(err);
                                                    callback();
                                                });
                                            }
                                        });
                                    }

                                });
                            } else {
                                fs.readFile(gContentDir + "/" + row.PID + ".html", 'utf8', function(err, content) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        console.log(gContentDir + "/" + row.PID + ".html")
                                    }
                                });
                                console.log("search.db can't work because html file missing in the folder")
                                callback();
                            }

                        });

                    },
                    function(err) {

                        if (err) {
                            console.log(err)
                        } else {
                            sdb.close();
                            db.close();
                            seardbId = document.getElementById('6b');
                            tagspan = seardbId.getElementsByTagName("span");
                            tagspan[2].style.display = "none";
                            tagspan[1].style.display = "block";
                            seardbId.className += " activeSucceed";
                            var zipId = document.getElementById('7');
                            zipId.style.display = "block";
                            cb(null, "createsearchdb_done");
                        }
                    }

                );
            } else {
                console.log("no pages found in contents.db");
                cb(null, "createsearchdb_done");
            }

        });
    }

    function zipprocess(rtndata, cb) {
        console.log("zipprocess")
        try {
            var archiver = require('archiver');
            var zipArchive = archiver('zip');
            var timestamp = Math.round(+new Date() / 1000);

            var tmpPath = process.env.HOME + "/" + timestamp;
            existzip = chooseFilePath + "/WorkingDirectory/" + bookID + ".zip";
            console.log(existzip)
            if (fs.existsSync(existzip)) {
                fs.remove(existzip),
                    function(err) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('clear zip file!');
                        }
                    }
            }

            fs.mkdirs(tmpPath, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    fs.copy(chooseFilePath + '/WorkingDirectory', tmpPath, function(err) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("copy success");
                            var outputPath = tmpPath + '/' + bookID + '.zip';


                            zipArchive.bulk([{
                                src: ['**/*'],
                                cwd: tmpPath,
                                expand: true
                            }]);

                            var output = fs.createWriteStream(outputPath);
                            output.on('error', function(err) {
                                console.log(err)
                            });

                            output.on('close', function() {

                                fs.move(outputPath, chooseFilePath + "/WorkingDirectory/" + bookID + ".zip", function(err) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("move success!");
                                        fs.remove(tmpPath, function(err) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                console.log('tmp remove success!');
                                                document.getElementById('zipDir').innerHTML = chooseFilePath + '/WorkingDirectory/' + bookID + '.zip';
                                                var zipId = document.getElementById('7');
                                                tagspan = zipId.getElementsByTagName("span");
                                                tagspan[2].style.display = "none";
                                                tagspan[1].style.display = "block";
                                                zipId.className += " activeSucceed";
                                                document.getElementById('success').style.display = "block";
                                                cb(null, 'zipping_done');
                                            }

                                        });
                                    }

                                });

                            });

                            zipArchive.pipe(output);
                            zipArchive.finalize(function(err, bytes) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log("finalize success");
                                }

                            });
                        }

                    });
                }

            });

        } catch (err) {
            console.log(err)
        }

    }
    //getmetadata
    function getmetadata(content) {
        $ = cheerio.load(content);
        var metacontent = $('meta[name="keywords"]').attr('content');
        return metacontent;
    }

    //generatemd5
    function generatemd5Id(md5Data) {
        md5Id = md5(md5Data);
        return md5Id;
    }

    //generateuniqueId
    function generateID(limitno) {
        var text = "";
        var possible = "mnopqrstuvwxyzabcdefghijkmnopqrstuvwxyzabcdefghijk0123456789";

        for (var i = 0; i < limitno; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

})(jQuery);