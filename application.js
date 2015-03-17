/*jslint browser:true */
"use strict";
// Helper functions
function shuffleArray(array) {
    var i, j, temp;
    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
var Question = function (item) {
    this.content = item.content;
    this.options = item.options;
    this.correctOption = item.correctOption;
    this.fiftyOtherOption = item.fiftyOtherOption;
};
Question.prototype.content = null;
Question.prototype.options = [null, null, null, null];
Question.prototype.correctOption = null;
Question.prototype.fiftyOtherOption = null;
Question.prototype.fifty = function () {
    if (this.fiftyOtherOption === null) {
        // randomly
        return shuffleArray([this.correctOption,
            this.options.indexOf(this.options.filter(function (element, index) {
                return (index !== this.correctOption);
            }.bind(this))[Math.floor(Math.random() * 3)])
            ]);
    }
    return shuffleArray([this.correctOption, this.fiftyOtherOption]);

};
var Ac = function (receivedData) { this.init(receivedData); };
Ac.prototype.data = []; //collection of questions
Ac.prototype.currentQuestion = null;
Ac.prototype.checkAnswer = function (answer) {
    if (this.currentQuestion.correctOption === answer) {
        return true;
    }
    return false;
};
Ac.prototype.getNextQuestion = function () {
    this.currentQuestion = this.data[this.data.indexOf(this.currentQuestion) + 1];
    return this.currentQuestion;
};
Ac.prototype.init = function (receivedData) {
    var item;
    for (item in receivedData) {
        if (receivedData.hasOwnProperty(item)) {
            this.data.push(new Question(receivedData[item]));
        }
    }
    this.data = shuffleArray(this.data);
    this.currentQuestion = this.data[0];
};