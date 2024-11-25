import { app } from "electron";
import path from "path";

class CommandParser {
  constructor() {
    // Mapear palabras clave a valores dinámicos
    this.keywords = {
      "(desktop)": path.join(app.getPath("desktop")), // Ruta del escritorio
      "(documents)": path.join(app.getPath("documents")),
    };
  }

  /**
   * Analiza un comando y devuelve un objeto con las opciones y valores extraídos.
   * @param {string} input - El comando a analizar, por ejemplo: "toPNG --file=/file.jpg --dest=(desktop)"
   * @returns {object} Un objeto con el comando, opciones, y valores.
   */
  parse(input) {
    const args = input.trim().split(/\s+/);
    const options = {};

    args.forEach((arg) => {
      const [key, value] = arg.split("=");

      if (key.startsWith("--")) {
        let cleanKey = key.slice(2); // Remover los "--"

        if (cleanKey == "remove") {
          options[cleanKey] = true;
        } else {
          options[cleanKey] = this.resolveKeywords(value);
        }
      }
    });

    return options;
  }

  /**
   * Resuelve palabras clave dinámicas como (desktop) en las rutas y convierte valores booleanos o numéricos.
   * @param {string} value - El valor a procesar.
   * @returns {string|boolean|number|null} El valor con las palabras clave resueltas o convertido.
   */
  resolveKeywords(value) {
    if (!value) return null;
    let resolvedValue = value;

    // Reemplazar palabras clave dinámicas
    for (const [keyword, pathValue] of Object.entries(this.keywords)) {
      resolvedValue = resolvedValue.replace(keyword, pathValue);
    }

    // Detectar y convertir booleanos
    if (typeof resolvedValue === "string") {
      if (resolvedValue.toLowerCase() === "true") return true;
      if (resolvedValue.toLowerCase() === "false") return false;

      // Detectar y convertir números
      const parsedNumber = Number(resolvedValue);
      if (!isNaN(parsedNumber)) return parsedNumber;
    }

    // Devolver el valor procesado o el original si no se pudo convertir
    return resolvedValue;
  }
}

export const commandParse = new CommandParser();
