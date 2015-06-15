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
var myFirebaseRef;
document.addEventListener("DOMContentLoaded", function () {
    var options = elemId('options').children, i, just_on = true,
        curQn = null, questionNumber = 1,
        setName = getQuerystring('set', 'test');

    function show() {
        elemId('question').innerHTML = curQn.content;
        for (i = 0; i < 4; i++) {
            options[i].innerHTML = curQn.options[i];
        }
    }
    myFirebaseRef = new Firebase("https://ac-kenrick95.firebaseio.com/" + setName);
    function init() {
        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            curQn = data.question;
            questionNumber = data.questionNumber;
            elemId('questionNumber').textContent = questionNumber;
            show();
        });
        just_on = false;
        for (i = 0; i < 4; i++) {
            options[i].classList.add("optionDisabled");
            options[i].classList.remove("correct");
        }
        elemId('question').classList.remove("pending");
    }
    function checkAns() {
        //elemId('question').classList.add("pending");
        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val(),
                clients = data.client,
                optStats = {},
                client;
            curQn = data.question;
            for (client in clients) {
                console.log(client);
                if (optStats.hasOwnProperty(clients[client].selectedAnswer)) {
                    optStats[clients[client].selectedAnswer]++;
                } else {
                    optStats[clients[client].selectedAnswer] = 1;
                }
            }
            for (i = 0; i < 4; i++) {
                if (optStats[i] !== null && optStats[i] !== undefined) {
                    options[i].innerHTML = "(" + optStats[i] + ")&nbsp;" + options[i].innerHTML;
                    options[i].classList.add("animate");
                }
            }

        });
    }
    function releaseAns() {
        //elemId('question').classList.remove("pending");
        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            curQn = data.question;
            options[curQn.correctOption].classList.add("correct");
            for (i = 0; i < 4; i++) {
                options[i].classList.add("optionDisabled");
                options[i].classList.remove("active");
                options[i].classList.remove("animate");
            }
        });
    }
    function nextQn() {
        for (i = 0; i < 4; i++) {
            options[i].classList.remove("fiftyHide");
        }
        options[curQn.correctOption].classList.remove("correct");

        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            curQn = data.question;
            questionNumber = data.questionNumber;

            if (curQn === null || curQn === undefined) {
                window.alert("End of AC");
                //elemId('checkAns').setAttribute('disabled', 'disabled');
            } else {
                show();
                elemId('questionNumber').textContent = questionNumber;
                //elemId('nextQn').setAttribute('disabled', 'disabled');
                for (i = 0; i < 4; i++) {
                    options[i].classList.remove("optionDisabled");
                    options[i].classList.add("active");
                }
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
    //elemId('checkAns').addEventListener('click', checkAns);

    //elemId('nextQn').addEventListener('click', nextQn);
/*
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
            } else if (action === "release") {
                releaseAns();
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
}, false);