/*jslint browser:true, plusplus: true */
/*globals Ac*/
"use strict";
// http://stackoverflow.com/a/18278346
function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success) {
                    success(JSON.parse(xhr.responseText));
                }
            } else {
                if (error) {
                    error(xhr);
                }
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}
function getQuerystring(key, default_value) {
    if (default_value === null || default_value === undefined) {
        default_value = "";
    }
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
        qs = regex.exec(window.location.href);
    if (qs === null || qs === undefined) {
        return default_value;
    }
    return qs[1];
}
function elemId(id) {
    return document.getElementById(id);
}
var myFirebaseRef, clientRef;
document.addEventListener("DOMContentLoaded", function () {
    // get question from somewhere, and process it
    var options = elemId('options').children, i,
        curQn = null, selectedAnswer = null, score = 0, questionNumber = 1, questionFinished = false,
        help = ['helpFifty', 'helpAudience', 'helpFriend'],
        setName = getQuerystring('set', 'test'),
        just_on = true, name = null;

    function show() {
        elemId('question').innerHTML = curQn.content;
        for (i = 0; i < 4; i++) {
            options[i].innerHTML = curQn.options[i];
        }
    }
    myFirebaseRef = new Firebase("https://ac-kenrick95.firebaseio.com/" + setName);
    clientRef = myFirebaseRef.child("client").push();
    function init() {
        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            curQn = data.question;
            questionNumber = data.questionNumber;
            elemId('questionNumber').textContent = questionNumber;
            show();
            selectedAnswer = null;
            /*help.forEach(function (value) {
                elemId(value).removeAttribute('disabled');
            });*/
            questionFinished = false;
        });
        name = prompt("What's your name?", "Anonymous");
        clientRef.set({
            score: 0,
            helpLines: help,
            selectedAnswer: -1,
            name: name
        });
        just_on = false;
        for (i = 0; i < 4; i++) {
            options[i].classList.add("active");
            options[i].classList.remove("animate");
            options[i].classList.remove("correct");
            options[i].classList.remove("wrongNoAnimation");
            options[i].classList.remove("pending");
            options[i].classList.remove("optionDisabled");
        }
    }

    function optClick() {
        console.log("clicked option: " + this.dataset.value);
        // prevent click if question is finished
        if (questionFinished) {
            return;
        }
        console.log(questionFinished);

        // remove previous lock
        if (selectedAnswer !== null && selectedAnswer > -1) {
            options[selectedAnswer].classList.remove("pending");
        }

        // lock the box
        selectedAnswer = parseInt(this.dataset.value, 10);
        options[selectedAnswer].classList.add("pending");

        clientRef.update({
            selectedAnswer: selectedAnswer,
            name: name,
            score: score
        });
    }
    for (i = 0; i < 4; i++) {
        options[i].addEventListener("click", optClick);
        options[i].classList.add("active");
    }
    function releaseAns() {
        for (i = 0; i < 4; i++) {
            options[i].classList.add("optionDisabled");
            options[i].classList.remove("active");
        }
        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            curQn = data.question;
            if (curQn.correctOption === selectedAnswer) {
                // correct
                if (selectedAnswer !== null && selectedAnswer > -1) {
                    options[selectedAnswer].classList.remove("animate");
                    options[selectedAnswer].classList.add("correct");
                    //elemId('nextQn').removeAttribute('disabled');
                    score++;
                    elemId('score').textContent = score;
                    clientRef.update({
                        score: score,
                        name: name
                    });
                }
            } else {
                // wrong
                if (selectedAnswer !== null && selectedAnswer > -1) {
                    options[selectedAnswer].classList.remove("animate");
                    options[selectedAnswer].classList.add("wrongNoAnimation");
                    options[curQn.correctOption].classList.add("correct");
                } else {
                    options[curQn.correctOption].classList.remove("animate");
                    options[curQn.correctOption].classList.add("correct");
                }
            }
        });
    }
    function checkAns() {
        questionFinished = true;
        for (i = 0; i < 4; i++) {
            options[i].classList.add("optionDisabled");
            options[i].classList.remove("active");
        }
        console.log(selectedAnswer);
        if (selectedAnswer !== null && selectedAnswer > -1) {
            options[selectedAnswer].classList.remove("pending");
            options[selectedAnswer].classList.add("animate");
        }
        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            curQn = data.question;
            //elemId('checkAns').setAttribute('disabled', 'disabled');
        });
    }
    function nextQn() {
        //elemId('checkAns').removeAttribute('disabled');
        if (selectedAnswer !== null && selectedAnswer > -1) {
            options[selectedAnswer].classList.remove("pending");
            options[selectedAnswer].classList.remove("wrongNoAnimation");
        }
        questionFinished = false;
        for (i = 0; i < 4; i++) {
            options[i].classList.remove("fiftyHide");
        }
        options[curQn.correctOption].classList.remove("correct");

        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            curQn = data.question;
            questionNumber = data.questionNumber;
            elemId('questionNumber').textContent = questionNumber;

            if (curQn === undefined || curQn === null) {
                window.alert("End of AC");
                elemId('checkAns').setAttribute('disabled', 'disabled');
            } else {
                show();
            }
            selectedAnswer = null;
            clientRef.update({
                selectedAnswer: -1,
                name: name,
                score: score
            });
            //elemId('nextQn').setAttribute('disabled', 'disabled');
            for (i = 0; i < 4; i++) {
                options[i].classList.remove("optionDisabled");
                options[i].classList.add("active");
            }
        });
    }
    if (getQuerystring('keyboard', false)) {
        document.addEventListener("keypress", function (event) {
            if (event.charCode === 122 && !elemId('checkAns').disabled) { // z
                checkAns();
            } else if (event.charCode === 120 && !elemId('nextQn').disabled) { // x
                nextQn();
            }
        }, false);
    }
    /*
    elemId('checkAns').addEventListener('click', checkAns);

    elemId('nextQn').addEventListener('click', nextQn);

    elemId('helpFifty').addEventListener('click', function () {
        if (!this.disabled) {
            var fiftyOptions = curQn.fifty();
            console.log(fiftyOptions);
            for (i = 0; i < 4; i++) {
                if (fiftyOptions.indexOf(i) === -1) {
                    options[i].classList.add("fiftyHide");
                }
            }
        }
        this.setAttribute('disabled', 'disabled');
    });

    elemId('helpAudience').addEventListener('click', function () {
        if (!this.disabled) {
            window.alert("Ask the audience");
        }
        this.setAttribute('disabled', 'disabled');
    });

    elemId('helpFriend').addEventListener('click', function () {
        if (!this.disabled) {
            window.alert("Call a friend.");
        }
        this.setAttribute('disabled', 'disabled');
    });*/
    myFirebaseRef.child("action").on("value", function (snapshot) {
        var action = snapshot.val();
        if (just_on) {
            init();
            if (action === "check") {
                checkAns();
                questionFinished = true;
            } else if (action === "release") {
                releaseAns();
                questionFinished = true;
            }
            return false;
        }
        if (action === "next") {
            nextQn();
        } else if (action === "check") {
            checkAns();
        } else if (action === "release") {
            releaseAns();
        } else if (action === "show") {
            init();
        } else if (action === "close") {
            alert("There is no host");
        }
    });
    window.addEventListener("beforeunload", function () {
        clientRef.update({
            selectedAnswer: -1
        });
    });
}, false);