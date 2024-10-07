import os
import json

def convert_to_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    vocab_list = []
    for line in lines:
        word, translation = line.strip().split(':')
        vocab_list.append({"word": word, "translation": translation})

    # Teile die Vokabeln in Lektionen zu je 20 Vokabeln auf
    lesson_size = 20
    lessons = [vocab_list[i:i + lesson_size] for i in range(0, len(vocab_list), lesson_size)]

    # Speichere jede Lektion in einer separaten JSON-Datei
    lesson_num = 1
    for lesson in lessons:
        while os.path.exists(f'deklination{lesson_num}.json'):
            lesson_num += 1

        lesson_data = {
            "title": f"deklination {lesson_num}",
            "vocab": lesson
        }

        with open(f'deklination{lesson_num}.json', 'w', encoding='utf-8') as json_file:
            json.dump(lesson_data, json_file, ensure_ascii=False, indent=4)

        print(f"deklination {lesson_num} gespeichert.")

if __name__ == "__main__":
    file_path = input("Pfad zur Vokabel-Datei eingeben: ")
    convert_to_json(file_path)
