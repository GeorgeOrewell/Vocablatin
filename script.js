let vocabList = []; // Vokabeln der aktuellen Lektion
let currentIndex = 0;
let score = 0;
let progress = {};
let questionStartTime; // Startzeit für die aktuelle Frage
let lessonStartTime; // Startzeit für die Lektion
const languageSelect = document.getElementById('language-select');
const lessonSelect = document.getElementById('lesson-select');

// Audio-Dateien für Soundeffekte
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
const backgroundMusic = new Audio('background.mp3');
backgroundMusic.loop = true;

// Fortschritt aus localStorage beim Laden der Seite
window.onload = function() {
    if (localStorage.getItem('progress')) {
        progress = JSON.parse(localStorage.getItem('progress'));
    } else {
        progress = {};
    }
};

// Fortgeschrittener Cache-Speicher für den Fortschritt
if (localStorage.getItem('progress')) {
    progress = JSON.parse(localStorage.getItem('progress'));
} else {
    progress = {};
}

function startLesson() {
    const language = languageSelect.value;
    const lesson = lessonSelect.value;
    loadLesson(language, lesson);
    backgroundMusic.play(); // Hintergrundmusik starten
    lessonStartTime = new Date().getTime(); // Zeit beim Start der Lektion setzen
}

function loadLesson(language, lesson) {
    const lessonPath = `${language}/${lesson}`;
    fetch(lessonPath)
        .then(response => response.json())
        .then(data => {
            vocabList = data.vocab;
            currentIndex = 0;
            document.getElementById('vocabulary-container').style.display = 'block';
            askQuestion();
        });
}

function askQuestion() {
    const vocab = vocabList[currentIndex];
    document.getElementById('question').textContent = `Übersetze: ${vocab.word}`;
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
    questionStartTime = new Date().getTime(); // Zeit beim Stellen der Frage setzen
}

function checkAnswer() {
    const answerInput = document.getElementById('answer').value.trim().toLowerCase();
    const correctAnswer = vocabList[currentIndex].translation.toLowerCase();
    const vocabWord = vocabList[currentIndex].word;

    if (!progress[vocabWord]) {
        progress[vocabWord] = { correct: 0, incorrect: 0 };
    }

    if (answerInput === correctAnswer) {
        score += 5;
        const answerTime = new Date().getTime() - questionStartTime;
        if (answerTime <= 8000) {
            score += 2; // Bonuspunkte für schnelle Antwort
        }
        progress[vocabWord].correct++;
        document.getElementById('result').textContent = 'Richtig!';
        correctSound.play(); // Richtig-Antwort-Sound abspielen
        document.getElementById('score-display').style.color = 'green'; // Punkteanzeige grün
    } else {
        score -= 3;
        progress[vocabWord].incorrect++;
        document.getElementById('result').textContent = `Falsch! Die richtige Antwort ist: ${correctAnswer}`;
        wrongSound.play(); // Falsch-Antwort-Sound abspielen
        document.getElementById('score-display').style.color = 'red'; // Punkteanzeige rot
    }

    // Fortschritt speichern
    localStorage.setItem('progress', JSON.stringify(progress));
    updateScoreDisplay();

    // 2 Sekunden Pause, bevor die nächste Frage gestellt wird
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < vocabList.length) {
            askQuestion();
        } else {
            endLesson();
        }
    }, 2000); // 2-sekündige Verzögerung
}

function updateScoreDisplay() {
    document.getElementById('score-display').textContent = score;
}

function showProgress() {
    const lesson = lessonSelect.value;
    let learnedCount = 0;

    vocabList.forEach(vocab => {
        const vocabProgress = progress[vocab.word] || { correct: 0, incorrect: 0 };
        if (vocabProgress.correct > 3 * vocabProgress.incorrect) {
            learnedCount++;
        }
    });

    const learnedPercentage = (learnedCount / vocabList.length) * 100;
    alert(`Fortschritt in ${lesson}: ${learnedCount}/${vocabList.length} gelernt (${learnedPercentage.toFixed(2)}%)`);
}

function endLesson() {
    document.getElementById('vocabulary-container').style.display = 'none';
    showProgress();

    // Berechnung der benötigten Zeit
    const lessonEndTime = new Date().getTime();
    const totalTime = Math.floor((lessonEndTime - lessonStartTime) / 1000); // In Sekunden
    alert(`Lektion abgeschlossen! Benötigte Zeit: ${totalTime} Sekunden`);
    
    backgroundMusic.pause(); // Hintergrundmusik stoppen
    backgroundMusic.currentTime = 0; // Zurücksetzen
}
