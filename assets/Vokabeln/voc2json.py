import os
import json

def convert_to_json(file_path, prefix):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    vocab_list = []
    for line in lines:
        word, translation = line.strip().split(':')
        vocab_list.append({"word": word, "translation": translation})

    # Teile die Vokabeln in Lektionen auf
    lesson_size = 20
    lessons = [vocab_list[i:i + lesson_size] for i in range(0, len(vocab_list), lesson_size)]

    # Speichere jede Lektion in einer separaten JSON-Datei
    lesson_num = 1
    for lesson in lessons:
        while os.path.exists(f'{prefix}{lesson_num}.json'):
            lesson_num += 1

        lesson_data = {
            "title": f"{prefix} {lesson_num}",
            "vocab": lesson
        }

        with open(f'{prefix}{lesson_num}.json', 'w', encoding='utf-8') as json_file:
            json.dump(lesson_data, json_file, ensure_ascii=False, indent=4)

        print(f"{prefix} {lesson_num} gespeichert.")

if __name__ == "__main__":
    # Alle verfügbaren .txt-Dateien anzeigen und auswählen lassen
    txt_files = [f for f in os.listdir() if f.endswith('.txt')]
    if not txt_files:
        print("Keine .txt-Dateien im Verzeichnis gefunden.")
    else:
        print("Verfügbare Textdateien:")
        for i, file in enumerate(txt_files, start=1):
            print(f"{i}: {file}")
        
        file_choice = int(input("Wähle eine Datei aus (Nummer eingeben): ")) - 1
        selected_file = txt_files[file_choice]

        # Präfix abfragen
        prefix = input("Bitte den gewünschten Präfix eingeben: ")

        # Umwandlung starten
        convert_to_json(selected_file, prefix)
