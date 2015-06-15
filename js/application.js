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
    if (this.fiftyOtherOption === undefined) {
        this.fiftyOtherOption = null;
    }
};
Question.prototype.content = null;
Question.prototype.options = [null, null, null, null];
Question.prototype.correctOption = null;
Question.prototype.fiftyOtherOption = null;
Question.prototype.fifty = function () {
    if (this.fiftyOtherOption === null || this.fiftyOtherOption === undefined) {
        // randomly
        return shuffleArray([this.correctOption,
            this.options.indexOf(this.options.filter(function (element, index) {
                return (index !== this.correctOption);
            }.bind(this))[parseInt(Math.floor(Math.random() * 3), 10)])
            ]);
    }
    return shuffleArray([this.correctOption, this.fiftyOtherOption]);

};
var Ac = function (receivedData, order) { this.init(receivedData, order); };
Ac.prototype.data = []; //collection of questions
Ac.prototype.currentQuestion = null;
Ac.prototype.checkAnswer = function (answer) {
    if (this.currentQuestion.correctOption === answer) {
        return true;
    }
    return false;
};
Ac.prototype.getNextQuestion = function () {
    if (this.data.indexOf(this.currentQuestion) + 1 >= this.data.length || this.data.indexOf(this.currentQuestion) === -1) {
        return undefined;
    }
    this.currentQuestion = this.data[this.data.indexOf(this.currentQuestion) + 1];
    return this.currentQuestion;
};
Ac.prototype.getPrevQuestion = function () {
    if (this.data.indexOf(this.currentQuestion) - 1 < 0 || this.data.indexOf(this.currentQuestion) === -1) {
        return undefined;
    }
    this.currentQuestion = this.data[this.data.indexOf(this.currentQuestion) - 1];
    return this.currentQuestion;
};
Ac.prototype.getQuestion = function (number) {
    number -= 1;
    if (number < 0 || number >= this.data.length) {
        return undefined;
    }
    this.currentQuestion = this.data[number];
    return this.currentQuestion;
};
Ac.prototype.init = function (receivedData, order) {
    var item;
    for (item in receivedData) {
        if (receivedData.hasOwnProperty(item)) {
            this.data.push(new Question(receivedData[item]));
        }
    }
    if (order === 'random') {
    //if (order !== 'order' || order === 'random' || order === undefined) {
        this.data = shuffleArray(this.data);
    }

    this.currentQuestion = this.data[0];
};