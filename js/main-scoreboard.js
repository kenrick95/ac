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
    var options = {}, i, just_on = true, scoreboard = {},
        questionNumber = 1,
        setName = getQuerystring('set', 'test');

    function show(clients) {
        var idx;
        for (idx in clients) {
            options[map(idx)].innerHTML = clients[idx];
        }
    }
    // TODO: better scoreboard styling; do more testing; digitize qna
    // TODO: list of sets available
    myFirebaseRef = new Firebase("https://ac-kenrick95.firebaseio.com/" + setName);
    function init() {
        myFirebaseRef.once("value", function (snapshot) {
            var data = snapshot.val();
            questionNumber = data.questionNumber;
            elemId('questionNumber').textContent = questionNumber;
            show();
        });
        just_on = false;
    }
    function checkAns() {
        //elemId('question').classList.add("pending");
        var idx;
        for (idx in options) {
            options[idx].classList.add("animate");
        }
    }
    function releaseAns() {
        //elemId('question').classList.remove("pending");
        var idx;
        for (idx in options) {
            options[idx].classList.remove("animate");
        }
    }
    function nextQn() {
        var idx;
        for (idx in options) {
            options[idx].classList.remove("correct");
            options[idx].classList.remove("fiftyHide");
        }
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
    myFirebaseRef.child("client").on("value", function (snapshot) {
        var clients = snapshot.val(), idx;
        for (idx in clients) {
            if (!options.hasOwnProperty(idx)) {
                options[idx] = document.createElement('div');
                options[idx].classList.add("option");
                elemId('options').appendChild(options[idx]);
            } else if (scoreboard[idx] !== clients[idx].score) {
                options[idx].classList.add("correct");
            }
            scoreboard[idx] = clients[idx].score;
            options[idx].innerHTML = clients[idx].name + ": " + clients[idx].score;
        }
        for (idx in options) {
            if (clients === null || !clients.hasOwnProperty(idx)) {
                elemId('options').removeChild(options[idx]);
                delete options[idx];
            }
        }
    });
    myFirebaseRef.child("action").on("value", function (snapshot) {
        var action = snapshot.val();
        if (just_on) {
            init();
            if (action === "check") {
                setTimeout(checkAns, 1000);
            } else if (action === "release") {
                setTimeout(releaseAns, 1000);
            }
            return false;
        }
        if (action === "next") {
            nextQn();
        } else if (action === "check") {
            checkAns();
        } else if (action === "release") {
            setTimeout(releaseAns, 1000);
        } else if (action === "show") {
            init();
        } else if (action === "close") {
            alert("There is no host");
        }
    });
}, false);