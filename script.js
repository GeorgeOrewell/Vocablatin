let vocabList = []; // Vokabeln der aktuellen Lektion
let currentIndex = 0;
let score = 0;
let progress = {};
let questionStartTime; // Startzeit für die aktuelle Frage
let lessonStartTime; // Startzeit für die Lektion
let shuffleMode = false; // Standardmäßig nicht im Shuffle-Modus
let revertMode = false; // Standardmäßig nicht im Revert-Modus
let soundEnabled = true; // Standardmäßig Soundeffekte aktiviert
let musicEnabled = true; // Standardmäßig Hintergrundmusik aktiviert
const languageSelect = document.getElementById('language-select');
const lessonSelect = document.getElementById('lesson-select');

// Audio-Dateien für Soundeffekte
const correctSound = new Audio('./assets/correct.mp3');
const wrongSound = new Audio('./assets/wrong2.mp3');
let backgroundMusic = new Audio('./assets/background1.mp3'); // Standard-Hintergrundmusik
backgroundMusic.loop = true;

// Fortschritt aus localStorage beim Laden der Seite
window.onload = function() {
    if (localStorage.getItem('progress')) {
        progress = JSON.parse(localStorage.getItem('progress'));
    } else {
        progress = {};
    }

    // Einstellungen aus localStorage laden
    loadSettings();
};

// Funktion zum Speichern der Einstellungen
function saveSettings() {
    shuffleMode = document.getElementById('shuffle-checkbox').checked;
    revertMode = document.getElementById('revert-checkbox').checked;
    soundEnabled = document.getElementById('sound-checkbox').checked;
    musicEnabled = document.getElementById('music-checkbox').checked;

    // Einstellungen in localStorage speichern
    localStorage.setItem('settings', JSON.stringify({
        shuffleMode,
        revertMode,
        soundEnabled,
        musicEnabled,
        language: languageSelect.value,
    }));

    toggleSettingsPopup(); // Pop-up schließen
}

// Funktion zum Laden der Einstellungen
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings'));
    if (settings) {
        document.getElementById('shuffle-checkbox').checked = settings.shuffleMode;
        document.getElementById('revert-checkbox').checked = settings.revertMode;
        document.getElementById('sound-checkbox').checked = settings.soundEnabled;
        document.getElementById('music-checkbox').checked = settings.musicEnabled;
        languageSelect.value = settings.language;
    }
}

// Funktion zum Setzen der Lautstärke der Hintergrundmusik
function setMusicVolume(volume) {
    backgroundMusic.volume = volume; // Lautstärke setzen
}

// Funktion zum Öffnen/Schließen des Einstellungs-Pop-ups
function toggleSettingsPopup() {
    const popup = document.getElementById('settings-popup');
    popup.style.display = (popup.style.display === 'none' || popup.style.display === '') ? 'block' : 'none';
}

// Funktion zum Starten der Lektion
function startLesson() {
    const lesson = lessonSelect.value;
    loadLesson(languageSelect.value, lesson);

    if (musicEnabled) {
        backgroundMusic.play(); // Hintergrundmusik starten
    }
    lessonStartTime = new Date().getTime(); // Zeit beim Start der Lektion setzen
}

// Funktion zum Laden der Lektion
function loadLesson(language, lesson) {
    const lessonPath = `${language}/${lesson}`;
    fetch(lessonPath)
        .then(response => response.json())
        .then(data => {
            vocabList = data.vocab;
            currentIndex = 0;

            if (shuffleMode) {
                shuffleVocabulary(vocabList); // Vokabeln zufällig anordnen
            }

            document.getElementById('vocabulary-container').style.display = 'block';
            askQuestion();
        });
}

// Funktion zum Mischen der Vokabeln
function shuffleVocabulary(vocabArray) {
    for (let i = vocabArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vocabArray[i], vocabArray[j]] = [vocabArray[j], vocabArray[i]];
    }
}

// Funktion zum Stellen der Frage
function askQuestion() {
    const vocab = vocabList[currentIndex];
    document.getElementById('question').textContent = `Übersetze: ${revertMode ? vocab.translation : vocab.word}`;
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
    questionStartTime = new Date().getTime(); // Zeit beim Stellen der Frage setzen
}

// Funktion zum Überprüfen der Antwort
function checkAnswer() {
    const answerInput = document.getElementById('answer').value.trim().toLowerCase();
    const correctAnswer = revertMode
        ? vocabList[currentIndex].word.toLowerCase()
        : vocabList[currentIndex].translation.toLowerCase();

    if (!progress[vocabList[currentIndex].word]) {
        progress[vocabList[currentIndex].word] = { correct: 0, incorrect: 0 };
    }

    if (answerInput === correctAnswer) {
        score += 5;
        const answerTime = new Date().getTime() - questionStartTime;
        if (answerTime <= 8000) {
            score += 2; // Bonuspunkte für schnelle Antwort
        }
        progress[vocabList[currentIndex].word].correct++;
        document.getElementById('result').textContent = 'Richtig!';
        if (soundEnabled) correctSound.play(); // Richtig-Antwort-Sound abspielen
        document.getElementById('score-display').style.color = 'green'; // Punkteanzeige grün
    } else {
        score -= 3;
        progress[vocabList[currentIndex].word].incorrect++;
        document.getElementById('result').textContent = `Falsch! Die richtige Antwort ist: ${correctAnswer}`;
        if (soundEnabled) wrongSound.play(); // Falsch-Antwort-Sound abspielen
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

// Funktion zur Aktualisierung der Punkteanzeige
function updateScoreDisplay() {
    document.getElementById('score-display').textContent = score;
}

// Funktion zur Anzeige des Fortschritts
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

// Funktion zum Beenden der Lektion
function endLesson() {
    document.getElementById('vocabulary-container').style.display = 'none';
    // Weitere Aktionen beim Beenden der Lektion (z.B. Fortschritt speichern, Ergebnisse anzeigen, etc.)
}

// Funktion zum Ändern der Hintergrundmusik
function changeMusic() {
    const selectedMusic = document.getElementById('music-select').value;
    backgroundMusic.src = selectedMusic;
    backgroundMusic.play(); // Neue Musik abspielen
}

// Funktion zur Anpassung der Lautstärke der Soundeffekte
function setSoundVolume(volume) {
    correctSound.volume = volume;
    wrongSound.volume = volume;
}
