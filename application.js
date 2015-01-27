/*jslint browser:true */
"use strict";
var Question = function (item) {
    this.content = item.content;
    this.options = item.options;
    this.correctOption = item.correctOption;
};
Question.prototype.content = null;
Question.prototype.options = [null, null, null, null];
Question.prototype.correctOption = null;
Question.prototype.fifty = function () {
    // randomly? or purposely?
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

    this.currentQuestion = this.data[0];
};