import os
import random

def list_txt_files():
    """Liste alle .txt Dateien im aktuellen Verzeichnis auf."""
    txt_files = [f for f in os.listdir() if f.endswith('.txt')]
    if not txt_files:
        print("Keine .txt Dateien gefunden.")
        return []
    for idx, file in enumerate(txt_files, 1):
        print(f"{idx}. {file}")
    return txt_files

def shuffle_file_lines(input_file, output_file=None):
    """Mische die Zeilen einer Datei und speichere sie."""
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    random.shuffle(lines)

    output_file = output_file or input_file
    with open(output_file, 'w', encoding='utf-8') as file:
        file.writelines(lines)

    print(f"Die Zeilen wurden erfolgreich in '{output_file}' zufällig angeordnet.")

def main():
    # Liste alle .txt Dateien auf
    txt_files = list_txt_files()
    
    if not txt_files:
        return
    
    # Nutzer fragt, welche Datei gemischt werden soll
    while True:
        try:
            choice = int(input(f"Wähle die Nummer der Datei (1-{len(txt_files)}): "))
            if 1 <= choice <= len(txt_files):
                input_file = txt_files[choice - 1]
                break
            else:
                print(f"Bitte wähle eine gültige Nummer zwischen 1 und {len(txt_files)}.")
        except ValueError:
            print("Bitte gib eine gültige Nummer ein.")

    # Nachfragen, ob die Datei überschrieben werden soll
    overwrite = input(f"Soll die Datei '{input_file}' überschrieben werden? (j/n): ").strip().lower()

    if overwrite == 'j':
        output_file = input_file
    else:
        output_file = input(f"Gib den Namen der Ausgabedatei an (z.B. 'output.txt'): ").strip()

    # Mische die Zeilen
    shuffle_file_lines(input_file, output_file)

if __name__ == "__main__":
    main()
