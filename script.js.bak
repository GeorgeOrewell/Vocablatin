let vocabList = []; // Vokabeln der aktuellen Lektion
let currentIndex = 0;
let score = 0;
let progress = {};
let questionStartTime; // Startzeit für die aktuelle Frage
let lessonStartTime; // Startzeit für die Lektion
let incorrectVocabList = []; // Liste für falsch beantwortete Vokabeln
let reviewMode = false; // Flag, um den Wiederholungsmodus anzuzeigen

const languageSelect = document.getElementById('language-select');
const lessonSelect = document.getElementById('lesson-select');
const revertModeCheckbox = document.getElementById('revert-mode'); // Checkbox für Revert Mode

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
    
    // Überprüfung, ob Revert Mode aktiv ist
    if (revertModeCheckbox.checked) {
        document.getElementById('question').textContent = `Übersetze: ${vocab.translation}`; // Deutsch -> Latein
    } else {
        document.getElementById('question').textContent = `Übersetze: ${vocab.word}`; // Latein -> Deutsch
    }

    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
    questionStartTime = new Date().getTime(); // Zeit beim Stellen der Frage setzen
}

function checkAnswer() {
    const answerInput = document.getElementById('answer').value.trim().toLowerCase();
    const vocab = vocabList[currentIndex];
    let correctAnswer;

    // Überprüfung, ob Revert Mode aktiv ist
    if (revertModeCheckbox.checked) {
        correctAnswer = vocab.word.toLowerCase(); // Deutsch -> Latein
    } else {
        correctAnswer = vocab.translation.toLowerCase(); // Latein -> Deutsch
    }

    if (!progress[vocab.word]) {
        progress[vocab.word] = { correct: 0, incorrect: 0 };
    }

    if (answerInput === correctAnswer) {
        const answerTime = new Date().getTime() - questionStartTime;

        // Unterschiedliche Punktvergabe je nach Modus
        if (reviewMode) {
            score += 4; // 4 Punkte für wiederholte Vokabeln
        } else {
            score += 5; // 5 Punkte für normale Vokabeln
            if (answerTime <= 8000) {
                score += 2; // Bonuspunkte für schnelle Antwort
            }
        }
        
        progress[vocab.word].correct++;
        document.getElementById('result').textContent = 'Richtig!';
        correctSound.play(); // Richtig-Antwort-Sound abspielen
        document.getElementById('score-display').style.color = 'green'; // Punkteanzeige grün
    } else {
        score -= 3;
        progress[vocab.word].incorrect++;
        document.getElementById('result').textContent = `Falsch! Die richtige Antwort ist: ${correctAnswer}`;
        wrongSound.play(); // Falsch-Antwort-Sound abspielen
        document.getElementById('score-display').style.color = 'red'; // Punkteanzeige rot

        // Falsch beantwortete Vokabel zur Liste hinzufügen, nur im normalen Modus
        if (!reviewMode) {
            incorrectVocabList.push(vocabList[currentIndex]);
        }
    }

    // Fortschritt speichern
    localStorage.setItem('progress', JSON.stringify(progress));
    updateScoreDisplay();

    // 2 Sekunden Pause, bevor die nächste Frage gestellt wird
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < vocabList.length) {
            askQuestion();
        } else if (!reviewMode && incorrectVocabList.length > 0) {
            startReview(); // Wenn die Lektion vorbei ist und es falsch beantwortete Vokabeln gibt, Review starten
        } else {
            endLesson();
        }
    }, 2000); // 2-sekündige Verzögerung
}

function startReview() {
    reviewMode = true; // Review-Modus aktivieren
    vocabList = incorrectVocabList; // Vokabeln durch falsch beantwortete ersetzen
    currentIndex = 0;
    incorrectVocabList = []; // Leeren, um doppelte Einträge zu verhindern
    askQuestion();
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
    if (reviewMode && incorrectVocabList.length > 0) {
        // Wenn im Review-Modus noch falsche Vokabeln vorhanden sind, erneut starten
        startReview();
    } else {
        document.getElementById('vocabulary-container').style.display = 'none';
        showProgress();

        // Berechnung der benötigten Zeit
        const lessonEndTime = new Date().getTime();
        const totalTime = Math.floor((lessonEndTime - lessonStartTime) / 1000); // In Sekunden
        alert(`Lektion abgeschlossen! Benötigte Zeit: ${totalTime} Sekunden`);

        backgroundMusic.pause(); // Hintergrundmusik stoppen
        backgroundMusic.currentTime = 0; // Zurücksetzen

        reviewMode = false; // Wiederholungsmodus zurücksetzen
    }
}
