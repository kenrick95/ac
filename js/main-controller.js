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
    // get question from somewhere, and process it
    var //options = elemId('options').children,
        //i,
        ac = null, curQn = null, questionNumber = 1,
        //help = ['helpFifty', 'helpAudience', 'helpFriend'],
        setName = getQuerystring('set', 'test'),
        fileName = 'json/' + setName + '.json',
        order = 'order';
        //order = getQuerystring('order', 'random');

    function init(data) {
        ac = new Ac(data, order);
        curQn = ac.currentQuestion;
        elemId('qn-loop').loop = true;
        elemId('qn-loop').play();

        elemId('checkAns').removeAttribute('disabled');
        /*help.forEach(function (value) {
            elemId(value).removeAttribute('disabled');
        });*/
        elemId('nextQn').setAttribute('disabled', 'disabled');
        myFirebaseRef = new Firebase("https://ac-kenrick95.firebaseio.com/" + setName);
        myFirebaseRef.set({
            set: setName,
            action: 'show', // show (init; accepting ans) --> check (tell "c" and "q" to check ans) --> release (broadcast answer & status) --> next (tell "q" to go to next question, tell "c" to reset options; accepting answer)
            question: curQn,
            questionNumber: questionNumber
        });
        myFirebaseRef.child("question").update({
            correctOption: -1
        });

        // kill clients when this window is closed or refreshed
        window.addEventListener("beforeunload", function () {
            myFirebaseRef.update({
                action: "close"
            });
        });
    }
    loadJSON(fileName,
        function (data) {
            console.log(data);
            init(data);
        },
        function (xhr) { console.error(xhr); }
        );

    function releaseAns() {
        myFirebaseRef.update({
            action: "release"
        });
        myFirebaseRef.child("question").update({
            correctOption: curQn.correctOption
        });
    }
    function playDoneSound() {
        elemId('check-done').play();
        elemId('check-start').removeEventListener('ended', playDoneSound);
        releaseAns();
    }
    function checkAns() {
        elemId('qn-loop').pause();
        myFirebaseRef.update({
            action: "check"
        });
        elemId('nextQn').removeAttribute('disabled');
        elemId('checkAns').setAttribute('disabled', 'disabled');
        elemId('check-start').play();
        elemId('check-start').addEventListener('ended', playDoneSound);
    }
    function nextQn() {
        elemId('checkAns').removeAttribute('disabled');
        curQn = ac.getNextQuestion();
        if (curQn === undefined) {
            window.alert("End of AC");
            elemId('checkAns').setAttribute('disabled', 'disabled');
            curQn = null;
        } else {
            elemId('next-qn').play();
            elemId('next-qn').addEventListener('ended', function () {
                elemId('qn-loop').loop = true;
                elemId('qn-loop').play();
            });
            questionNumber++;
            elemId('questionNumber').textContent = questionNumber;

        }
        myFirebaseRef.update({
            action: "next",
            question: curQn,
            questionNumber: questionNumber
        });
        elemId('nextQn').setAttribute('disabled', 'disabled');
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
    elemId('resetClient').addEventListener('click', function () {
        myFirebaseRef.update({
            client: []
        });
    });

    elemId('checkAns').addEventListener('click', checkAns);

    elemId('nextQn').addEventListener('click', nextQn);

    document.addEventListener("keypress", function (event) {
        if (event.charCode === 122 && !elemId('checkAns').disabled) { // z
            checkAns();
        } else if (event.charCode === 120 && !elemId('nextQn').disabled) { // x
            nextQn();
        }
    }, false);
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
}, false);