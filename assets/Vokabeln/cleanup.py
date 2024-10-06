import os

def list_text_files(directory):
    """Listet alle .txt-Dateien im angegebenen Verzeichnis auf und lässt den Nutzer eine auswählen."""
    text_files = [f for f in os.listdir(directory) if f.endswith('.txt')]
    
    if not text_files:
        print("Keine .txt-Dateien gefunden.")
        return None
    
    print("Bitte wähle eine Datei aus:")
    for idx, file in enumerate(text_files):
        print(f"{idx + 1}: {file}")

    choice = int(input("Gib die Nummer der gewählten Datei ein: ")) - 1
    if 0 <= choice < len(text_files):
        return os.path.join(directory, text_files[choice])  # Gibt den vollständigen Pfad zurück
    else:
        print("Ungültige Auswahl.")
        return None

def remove_duplicates(input_file, output_file):
    """Entfernt doppelte Einträge aus der Eingabedatei und speichert die eindeutigen Zeilen in der Ausgabedatei."""
    seen = set()
    with open(input_file, 'r', encoding='utf-8') as infile, open(output_file, 'w', encoding='utf-8') as outfile:
        for line in infile:
            line = line.strip()
            if line and line not in seen:
                outfile.write(line + '\n')
                seen.add(line)

def main():
    directory = '.'  # Das aktuelle Verzeichnis, in dem nach .txt-Dateien gesucht wird
    user_choice = list_text_files(directory)

    if user_choice:
        output_file = user_choice.replace('.txt', '_neu.txt')  # Ausgabedatei mit neuem Namen
        remove_duplicates(user_choice, output_file)
        print(f"Doppelte Einträge wurden entfernt. Eindeutige Zeilen wurden in {output_file} gespeichert.")

if __name__ == "__main__":
    main()
