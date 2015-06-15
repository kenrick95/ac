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
document.addEventListener("DOMContentLoaded", function () {
    // get question from somewhere, and process it
    var options = elemId('options').children, i,
        ac = null, curQn = null, selectedAnswer = null, score = 0, questionNumber = 1, questionFinished = false,
        help = ['helpFifty', 'helpAudience', 'helpFriend'],
        fileName = 'json/' + getQuerystring('set', 'test') + '.json',
        order = getQuerystring('order', 'order');

    function show() {
        elemId('question').innerHTML = curQn.content;
        for (i = 0; i < 4; i++) {
            options[i].innerHTML = curQn.options[i];
        }
    }

    function init(data) {
        ac = new Ac(data, order);
        curQn = ac.currentQuestion;
        var num = getQuerystring('num', false);
        console.log(num);
        if (num !== false) {
            curQn = ac.getQuestion(parseInt(num, 10));
            questionNumber = parseInt(num, 10);
            elemId('questionNumber').textContent = questionNumber;
        }
        show();
        selectedAnswer = null;
        elemId('checkAns').removeAttribute('disabled');
        help.forEach(function (value) {
            elemId(value).removeAttribute('disabled');
        });
        // elemId('nextQn').setAttribute('disabled', 'disabled');
        questionFinished = false;
    }
    loadJSON(fileName,
        function (data) {
            console.log(data);
            init(data);
        },
        function (xhr) { console.error(xhr); }
        );

    function optClick() {
        console.log("clicked option: " + this.dataset.value);
        // prevent click if question is finished
        if (questionFinished) {
            return;
        }

        // remove previous lock
        if (selectedAnswer !== null) {
            options[selectedAnswer].classList.remove("pending");
        }

        // lock the box
        selectedAnswer = parseInt(this.dataset.value, 10);
        options[selectedAnswer].classList.add("pending");
    }
    for (i = 0; i < 4; i++) {
        options[i].addEventListener("click", optClick);
        options[i].classList.add("active");
    }
    function checkAns() {
        function correctHandler(e) {
            if (e.animationName === "blink") {
                options[selectedAnswer].classList.remove("correctAnim");
                options[selectedAnswer].classList.add("correct");
                elemId('nextQn').removeAttribute('disabled');
                score++;
                elemId('score').textContent = score;
            }
        }
        function wrongHandler(e) {
            //console.log(e);
            if (e.animationName === "blink") {
                options[curQn.correctOption].classList.add("correct");
                elemId('nextQn').removeAttribute('disabled');
            }
        }
        console.log(selectedAnswer);
        if (selectedAnswer !== null) {
            options[selectedAnswer].classList.remove("pending");
        }

        questionFinished = true;


        if (ac.checkAnswer(selectedAnswer)) {
            // correct
            if (selectedAnswer !== null) {
                options[selectedAnswer].classList.add("correctAnim");
                options[selectedAnswer].addEventListener("animationend", correctHandler, false);
                options[selectedAnswer].addEventListener("webkitAnimationEnd", correctHandler, false);
            }
        } else {
            // wrong
            if (selectedAnswer !== null) {
                options[selectedAnswer].classList.add("wrong");
                options[selectedAnswer].addEventListener("animationend", wrongHandler, false);
                options[selectedAnswer].addEventListener("webkitAnimationEnd", wrongHandler, false);
            } else {
                options[curQn.correctOption].classList.add("correct");
                elemId('nextQn').removeAttribute('disabled');
            }
        }
        elemId('checkAns').setAttribute('disabled', 'disabled');
        for (i = 0; i < 4; i++) {
            options[i].classList.add("optionDisabled");
            options[i].classList.remove("active");
        }
    }
    function prevQn() {
        var tempQn;
        elemId('checkAns').removeAttribute('disabled');
        if (selectedAnswer !== null) {
            options[selectedAnswer].classList.remove("pending");
            options[selectedAnswer].classList.remove("wrong");
        }
        questionFinished = false;
        for (i = 0; i < 4; i++) {
            options[i].classList.remove("fiftyHide");
        }
        options[curQn.correctOption].classList.remove("correct");
        tempQn = ac.getPrevQuestion();
        if (tempQn === undefined) {
            window.alert("End of AC");
            // elemId('checkAns').setAttribute('disabled', 'disabled');
        } else {
            questionNumber--;
            elemId('questionNumber').textContent = questionNumber;
            curQn = tempQn;
            show();
        }
        selectedAnswer = null;
        // elemId('prevQn').setAttribute('disabled', 'disabled');
        for (i = 0; i < 4; i++) {
            options[i].classList.remove("optionDisabled");
            options[i].classList.add("active");
        }
    }
    function nextQn() {
        var tempQn;
        elemId('checkAns').removeAttribute('disabled');
        if (selectedAnswer !== null) {
            options[selectedAnswer].classList.remove("pending");
            options[selectedAnswer].classList.remove("wrong");
        }
        questionFinished = false;
        for (i = 0; i < 4; i++) {
            options[i].classList.remove("fiftyHide");
        }
        options[curQn.correctOption].classList.remove("correct");
        tempQn = ac.getNextQuestion();
        if (tempQn === undefined) {
            window.alert("End of AC");
            // elemId('checkAns').setAttribute('disabled', 'disabled');
        } else {
            questionNumber++;
            elemId('questionNumber').textContent = questionNumber;
            curQn = tempQn;
            show();
        }
        selectedAnswer = null;
        // elemId('nextQn').setAttribute('disabled', 'disabled');
        for (i = 0; i < 4; i++) {
            options[i].classList.remove("optionDisabled");
            options[i].classList.add("active");
        }
    }
    if (getQuerystring('keyboard', false)) {
        document.addEventListener("keypress", function (event) {
            if (event.charCode === 122 && !elemId('checkAns').disabled) { // z
                checkAns();
            } else if (event.charCode === 120 && !elemId('nextQn').disabled) { // x
                nextQn();
            } else if (event.charCode === 97 && !elemId('prevQn').disabled) { // x
                prevQn();
            }
        }, false);
    }

    elemId('checkAns').addEventListener('click', checkAns);

    elemId('nextQn').addEventListener('click', nextQn);
    elemId('prevQn').addEventListener('click', prevQn);

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
    });
}, false);