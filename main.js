/*jslint browser:true, plusplus: true */
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
document.addEventListener("DOMContentLoaded", function () {
    // get question from somewhere, and process it
    var options = document.getElementById('options').children, i,
        ac = null, curQn = null, selectedAnswer = null, score = 0;
    function show() {
        document.getElementById('question').textContent = curQn.content;
        for (i = 0; i < 4; i++) {
            options[i].textContent = curQn.options[i];
        }
    }
    function init(data) {
        ac = new Ac(data);
        curQn = ac.currentQuestion;
        show();
        selectedAnswer = null;
        document.getElementById('checkAns').removeAttribute('disabled');
        document.getElementById('nextQn').setAttribute('disabled', 'disabled');
    }
    loadJSON('test.json',
        function (data) {
            console.log(data);
            init(data);
        },
        function (xhr) { console.error(xhr); }
        );
    function optClick (e) {
        console.log(this.dataset.value);
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
    }
    document.getElementById('checkAns').addEventListener('click', function (e) {
        console.log(selectedAnswer);
        if (selectedAnswer !== null) {
            options[selectedAnswer].classList.remove("pending");
        }
        document.getElementById('nextQn').removeAttribute('disabled');
        if (ac.checkAnswer(selectedAnswer)) {
            // correct
            if (selectedAnswer !== null) {
                options[selectedAnswer].classList.add("correct");
            }
            score++;
            document.getElementById('score').textContent = score;
        } else {
            // wrong
            if (selectedAnswer !== null) {
                options[selectedAnswer].classList.add("wrong");
            }
            options[curQn.correctOption].classList.add("correct");
        }
    });
    document.getElementById('nextQn').addEventListener('click', function (e) {
        if (selectedAnswer !== null) {
            options[selectedAnswer].classList.remove("pending");
            options[selectedAnswer].classList.remove("wrong");
        }
        options[curQn.correctOption].classList.remove("correct");
        curQn = ac.getNextQuestion();
        if (curQn === undefined) {
            alert("End of AC");
            document.getElementById('checkAns').setAttribute('disabled', 'disabled');
        } else {
            show();
        }
        selectedAnswer = null;
        this.setAttribute('disabled', 'disabled');
    });
}, false);