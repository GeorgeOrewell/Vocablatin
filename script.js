let vocabList = []; // Vokabeln der aktuellen Lektion
let currentIndex = 0;
let score = loadScore();
let progress = {};
let questionStartTime; // Startzeit für die aktuelle Frage
let lessonStartTime; // Startzeit für die Lektion
let shuffleMode = true; // Standardmäßig nicht im Shuffle-Modus
let revertMode = false; // Standardmäßig nicht im Revert-Modus
let soundEnabled = true; // Standardmäßig Soundeffekte aktiviert
let musicEnabled = true; // Standardmäßig Hintergrundmusik aktiviert
let retryIncorrect = false; // Standardmäßig nicht wiederholen
let incorrectAnswers = []; // Liste für falsch beantwortete Fragen
const languageSelect = document.getElementById('language-select');
const lessonSelect = document.getElementById('lesson-select');

// Audio-Dateien für Soundeffekte
const correctSound = new Audio('./assets/correct.mp3');
const wrongSound = new Audio('./assets/wrong2.mp3');
let backgroundMusic = new Audio('./assets/background4.mp3'); // Standard-Hintergrundmusik
backgroundMusic.loop = true;


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Fortschritt aus localStorage beim Laden der Seite
window.onload = function() {
//    saveSettings();
    setSoundVolume(0.1);
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
    retryIncorrect = document.getElementById('retry-checkbox').checked;
    shuffleMode = document.getElementById('shuffle-checkbox').checked;
    revertMode = document.getElementById('revert-checkbox').checked;
    soundEnabled = document.getElementById('sound-checkbox').checked;
    musicEnabled = document.getElementById('music-checkbox').checked;

    // Einstellungen in localStorage speichern
    localStorage.setItem('settings', JSON.stringify({
        shuffleMode,
        revertMode,
        retryIncorrect,
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
        document.getElementById('retry-checkbox').checked = settings.retryIncorrect;
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Lektion konnte nicht geladen werden');
            }
            return response.json();
        })
        .then(data => {
            vocabList = data.vocab;
            currentIndex = 0;

            if (shuffleMode) {
                shuffleVocabulary(vocabList); // Vokabeln zufällig anordnen
            }

            document.getElementById('vocabulary-container').style.display = 'block';
            askQuestion();
        })
        .catch(error => {
            alert('Fehler beim Laden der Lektion: ' + error.message);
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

    const currentLanguage = languageSelect.value; // Aktuelle Sprache ermitteln

    if (!progress[currentLanguage]) {
        progress[currentLanguage] = {}; // Fortschritt für Sprache initialisieren
    }

    if (!progress[currentLanguage][vocabList[currentIndex].word]) {
        progress[currentLanguage][vocabList[currentIndex].word] = { correct: 0, incorrect: 0 }; // Vokabel initialisieren
    }

    if (answerInput === correctAnswer) {
        score += 5;
        const answerTime = new Date().getTime() - questionStartTime;
        if (retryIncorrect && incorrectAnswers.includes(vocabList[currentIndex])) {
            score += 3; // Weniger Punkte für richtig beantwortete Fragen in der Wiederholung
        } else {
            if (answerTime <= 8000) {
                score += 2; // Bonuspunkte für schnelle Antwort
            }
        }
        progress[currentLanguage][vocabList[currentIndex].word].correct++; // Fortschritt für richtige Antwort speichern
        document.getElementById('result').textContent = 'Richtig!';
        if (soundEnabled) correctSound.play(); // Richtig-Antwort-Sound abspielen
        document.getElementById('score-display').style.color = 'green'; // Punkteanzeige grün
    } else {
        incorrectAnswers.push(vocabList[currentIndex]); // Falsch beantwortete Frage speichern
        score -= 3;
        progress[currentLanguage][vocabList[currentIndex].word].incorrect++; // Fortschritt für falsche Antwort speichern
        document.getElementById('result').textContent = `Falsch! Die richtige Antwort ist: ${correctAnswer}`;
        if (soundEnabled) wrongSound.play(); // Falsch-Antwort-Sound abspielen
        document.getElementById('score-display').style.color = 'red'; // Punkteanzeige rot
    }

    // Fortschritt speichern
    setScore(score);
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


function toggleProgressPopup() {
    const popup = document.getElementById('progress-popup');
    popup.style.display = (popup.style.display === 'none' || popup.style.display === '') ? 'block' : 'none';
}

function showProgressTab(language) {
    if (!progress[language]) {
        document.getElementById('progress-content').innerHTML = `<p>Kein Fortschritt für ${language}.</p>`;
        return;
    }

    const vocab = Object.keys(progress[language]); // Liste der Vokabeln mit Fortschritt in dieser Sprache
    let totalCorrect = 0;
    let totalAnswered = 0;

    vocab.forEach(vocabWord => {
        const vocabProgress = progress[language][vocabWord];
        totalCorrect += vocabProgress.correct;
        totalAnswered += vocabProgress.correct + vocabProgress.incorrect;
    });

    const percentageCorrect = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    let content = `<h4>Fortschritt in ${language}:</h4>`;
    content += `<p>Richtig beantwortete Vokabeln: ${percentageCorrect.toFixed(2)}%</p>`;    


//    vocab.forEach(vocabWord => {
//        const vocabProgress = progress[language][vocabWord];
//        content += `<p>${vocabWord}: Richtig: ${vocabProgress.correct}, Falsch: ${vocabProgress.incorrect}</p>`;
//    });

    document.getElementById('progress-content').innerHTML = content;
}
// Funktion zum Beenden der Lektion und ggf. Vokabeln Wiederholen
function endLesson() {
    if (retryIncorrect && incorrectAnswers.length > 0) {
        alert('Deine 2. Chance.');
        vocabList = incorrectAnswers; // Nur falsche Fragen wiederholen
        incorrectAnswers = []; // Liste leeren
        currentIndex = 0;
        askQuestion(); // Nächste Frage stellen
    } else {
        document.getElementById('vocabulary-container').style.display = 'none';
    }
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

// Funktion zum Ändern der Hintergrundmusik
function changeMusic() {
    const selectedMusic = document.getElementById('music-select').value;
    backgroundMusic.pause(); // Aktuelle Musik stoppen
    backgroundMusic.src = selectedMusic; // Neue Musikquelle setzen
    if (musicEnabled) {
        backgroundMusic.play(); // Neue Musik abspielen
    }
}

// Funktion zum Umschalten der Hintergrundmusik (Ein/Aus)
function toggleMusic() {
    musicEnabled = !musicEnabled; // Status umkehren
    if (musicEnabled) {
        backgroundMusic.play(); // Musik abspielen, falls aktiviert
    } else {
        backgroundMusic.pause(); // Musik pausieren, falls deaktiviert
    }
}

// Funktion zum Zurücksetzen des Fortschritts
function resetProgress() {
    if (confirm('Möchtest du den Fortschritt wirklich zurücksetzen?')) {
        progress = {};
        localStorage.removeItem('progress');
        alert('Fortschritt zurückgesetzt.');
    }
}
// Funktion zur Anpassung der Lautstärke der Soundeffekte
function setSoundVolume(volume) {
    correctSound.volume = volume;
    wrongSound.volume = volume;
}

// Speichert die Punkte im localStorage
function saveScore(score) {
    localStorage.setItem('score', score);
}

// Lädt die Punkte aus dem localStorage
function loadScore() {
    let score = localStorage.getItem('score');
    return score ? parseInt(score) : 0;
}

// Setzt die Punkte zurück
function resetScore() {
    localStorage.removeItem('Score');
}
