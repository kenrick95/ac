<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>AC</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        AC
    </header><!-- /header -->
    <aside>Quiz answering application, with some help (WWtBaM-like)[TODO], question from JSON file, no jQuery allowed, support IE.</aside>
    <div id="main">
        <div id="question">Lorem ipsum dolor sit amet?</div>
        <div id="options">
            <div class="option" data-value="0">A. Lorem!</div>
            <div class="option" data-value="1">B. Ipsum :$</div>
            <div class="option" data-value="2">C. Dolor :]</div>
            <div class="option" data-value="3">D. Sit Amet :/</div>
        </div>
        <div id="controls">
            <button id="checkAns" type="button">Check answer</button>
            <button id="nextQn" disabled="disabled" type="button">Next question</button>
        </div>
        <div id="helps">
            <button id="helpFifty" type="button">50:50</button>
            <button id="helpFriend" type="button">Call your friend</button>
            <button id="helpAudience" type="button">Ask the audience</button>
        </div>
        <div id="score">0</div>
    </div>
    <footer>
        Project 2015 #2: AC, started on 14 January 2015
    </footer>
    <script src="application.js" type="text/javascript" charset="utf-8"></script>
    <script src="main.js" type="text/javascript" charset="utf-8"></script>
</body>
</html>