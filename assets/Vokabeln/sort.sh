#!/bin/bash

# Alle .txt Dateien im aktuellen Verzeichnis auflisten
txt_files=(*.txt)

# Überprüfen, ob .txt Dateien vorhanden sind
if [ ${#txt_files[@]} -eq 0 ]; then
  echo "Keine .txt Dateien im aktuellen Verzeichnis gefunden."
  exit 1
fi

# Dateien zur Auswahl anzeigen
echo "Wähle eine Datei aus:"
select file in "${txt_files[@]}"; do
  # Überprüfen, ob eine gültige Auswahl getroffen wurde
  if [ -n "$file" ]; then
    echo "Du hast die Datei '$file' ausgewählt."
    
    # Datei alphabetisch sortieren und überschreiben
    sort "$file" -o "$file"
    
    echo "Die Datei '$file' wurde alphabetisch sortiert und überschrieben."
    break
  else
    echo "Ungültige Auswahl. Bitte versuche es erneut."
  fi
done
