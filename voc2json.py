import json
import os

def get_next_filename(base_output_file):
    lesson_num = 1
    while True:
        output_file = f"{base_output_file}{lesson_num}.json"
        if not os.path.exists(output_file):
            return output_file
        lesson_num += 1

def convert_to_json(input_file, base_output_file, words_per_lesson=20):
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    vocab = []
    word_count = 0
    
    for line in lines:
        if ":" in line:
            latin_word, german_translation = line.strip().split(":")
            vocab.append({"word": latin_word, "translation": german_translation})
            word_count += 1
        
        # Sobald wir die Anzahl der Wörter pro Lektion erreichen
        if word_count == words_per_lesson:
            output_file = get_next_filename(base_output_file)
            with open(output_file, 'w', encoding='utf-8') as json_file:
                json.dump(vocab, json_file, ensure_ascii=False, indent=4)
            print(f"Lektion gespeichert: {output_file}")
            
            # Zurücksetzen für die nächste Lektion
            vocab = []
            word_count = 0
    
    # Speichert die letzte Lektion, wenn noch Wörter übrig sind
    if vocab:
        output_file = get_next_filename(base_output_file)
        with open(output_file, 'w', encoding='utf-8') as json_file:
            json.dump(vocab, json_file, ensure_ascii=False, indent=4)
        print(f"Lektion gespeichert: {output_file}")

if __name__ == "__main__":
    input_file = "vokabeln.txt"  # Eingabedatei mit Vokabeln im gewünschten Format
    base_output_file = "lektion"  # Basisname für Ausgabedateien
    convert_to_json(input_file, base_output_file)
