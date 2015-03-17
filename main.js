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
function elemId(id) {
    return document.getElementById(id);
}
document.addEventListener("DOMContentLoaded", function () {
    // get question from somewhere, and process it
    var options = elemId('options').children, i,
        ac = null, curQn = null, selectedAnswer = null, score = 0, questionFinished = false,
        help = ['helpFifty', 'helpAudience', 'helpFriend'];

    function show() {
        elemId('question').textContent = curQn.content;
        for (i = 0; i < 4; i++) {
            options[i].textContent = curQn.options[i];
        }
    }

    function init(data) {
        ac = new Ac(data);
        curQn = ac.currentQuestion;
        show();
        selectedAnswer = null;
        elemId('checkAns').removeAttribute('disabled');
        help.forEach(function (value) {
            elemId(value).removeAttribute('disabled');
        });
        elemId('nextQn').setAttribute('disabled', 'disabled');
        questionFinished = false;
    }

    loadJSON('test.json',
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

    elemId('checkAns').addEventListener('click', function () {
        console.log(selectedAnswer);
        if (selectedAnswer !== null) {
            options[selectedAnswer].classList.remove("pending");
        }

        questionFinished = true;


        if (ac.checkAnswer(selectedAnswer)) {
            // correct
            if (selectedAnswer !== null) {
                options[selectedAnswer].classList.add("correctAnim");
                options[selectedAnswer].addEventListener("animationend", function () {
                    options[selectedAnswer].classList.remove("correctAnim");
                    options[selectedAnswer].classList.add("correct");
                    elemId('nextQn').removeAttribute('disabled');
                    score++;
                }, false);
            }
            elemId('score').textContent = score;
        } else {
            // wrong
            if (selectedAnswer !== null) {
                options[selectedAnswer].classList.add("wrong");
                options[selectedAnswer].addEventListener("animationend", function () {
                    options[curQn.correctOption].classList.add("correct");
                    elemId('nextQn').removeAttribute('disabled');
                }, false);
            } else {
                options[curQn.correctOption].classList.add("correct");
                elemId('nextQn').removeAttribute('disabled');
            }
        }
        this.setAttribute('disabled', 'disabled');
        for (i = 0; i < 4; i++) {
            options[i].classList.add("optionDisabled");
            options[i].classList.remove("active");
        }
    });

    elemId('nextQn').addEventListener('click', function () {
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
        curQn = ac.getNextQuestion();
        if (curQn === undefined) {
            window.alert("End of AC");
            elemId('checkAns').setAttribute('disabled', 'disabled');
        } else {
            show();
        }
        selectedAnswer = null;
        this.setAttribute('disabled', 'disabled');
        for (i = 0; i < 4; i++) {
            options[i].classList.remove("optionDisabled");
            options[i].classList.add("active");
        }
    });

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