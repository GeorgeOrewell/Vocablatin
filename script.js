let vocab = [];
let currentWordIndex = 0;
let score = 0;
let timer;
const scoreDisplay = document.getElementById('score');

// Sound-Effekte
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');

function startTimer() {
    timer = setTimeout(() => {
        // Keine Bonuspunkte wenn nicht rechtzeitig
    }, 8000);  // 8 Sekunden
}

function checkAnswer(userAnswer, correctAnswer) {
    clearTimeout(timer); // Stoppe den Timer

    if (userAnswer === correctAnswer) {
        score += 5;  // Grundpunkte

        // Prüfe, ob Antwort rechtzeitig war
        if (timer) {
            score += 2;  // Bonuspunkte
        }
        correctSound.play();  // Spiele richtigen Sound
    } else {
        score -= 3;  // Punkteabzug
        wrongSound.play();  // Spiele falschen Sound
    }

    updateScoreDisplay();
}

function updateScoreDisplay() {
    scoreDisplay.textContent = score;

    // Optische Darstellung, z.B. Farbe ändern je nach Punktzahl
    if (score >= 0) {
        scoreDisplay.style.color = 'green';
    } else {
        scoreDisplay.style.color = 'red';
    }
}

function startLesson() {
    const lessonFile = document.getElementById('lesson-select').value;

    fetch(lessonFile)
        .then(response => response.json())
        .then(data => {
            vocab = data.vocab;
            currentWordIndex = 0;
            document.getElementById('vocabulary-container').style.display = 'block';
            showNextWord();
        })
        .catch(error => {
            console.error('Fehler beim Laden der Lektion:', error);
        });
}

function showNextWord() {
    startTimer();
    if (currentWordIndex < vocab.length) {
        document.getElementById('question').innerText = `Übersetze: ${vocab[currentWordIndex].word}`;
        document.getElementById('answer').value = '';
        document.getElementById('result').innerText = '';
    } else {
        document.getElementById('question').innerText = 'Lektion abgeschlossen!';
        document.getElementById('answer').style.display = 'none';
        document.getElementById('result').innerText = '';
    }
}

function checkAnswer() {
    const userAnswer = document.getElementById('answer').value.trim().toLowerCase();
    const correctAnswer = vocab[currentWordIndex].translation.toLowerCase();

    if (userAnswer === correctAnswer) {
        document.getElementById('result').innerText = 'Richtig!';
    } else {
        document.getElementById('result').innerText = `Falsch! Die richtige Antwort ist: ${vocab[currentWordIndex].translation}`;
    }

    currentWordIndex++;
    setTimeout(showNextWord, 2000); // Nächste Vokabel nach 2 Sekunden
}
