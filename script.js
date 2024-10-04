let vocab = [];
let currentWordIndex = 0;

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
