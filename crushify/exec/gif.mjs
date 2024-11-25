import { app } from "electron";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { commandParse } from "../js/parser.mjs";

// Formatos de imagen soportados para convertir a GIF
const SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".bmp"];

class ImageConverter {
  constructor() {
    this.event = null;
    this.stats = {
      processed: 0,
      failed: 0,
      skipped: 0,
    };
  }

  /**
   * Procesa un archivo individual
   */
  async processFile(filePath, options) {
    try {
      // Crear nombre del archivo de salida
      const fileName = path.basename(filePath, path.extname(filePath));
      const outputPath = path.join(options.dest, `${fileName}.gif`);

      // Configurar opciones de conversión para GIF
      const gifOptions = {
        colours: options.colors || 256, // Número de colores en la paleta (2-256)
        dither: options.dither || 1.0, // Factor de difuminado (0-1)
        interFrameMaxError: options.interFrameMaxError || 0, // Error máximo entre frames
        interPaletteMaxError: options.interPaletteMaxError || 3, // Error máximo entre paletas
        effort: options.effort || 7, // Nivel de esfuerzo en la optimización (1-10)
        loop: options.loop || 0, // 0 = loop infinito
        delay: options.delay || 100, // Retraso entre frames en ms (para animaciones)
      };

      // Convertir la imagen
      await sharp(filePath)
        .gif(gifOptions)
        .toFile(outputPath);

      // Obtener tamaños para mostrar el ahorro
      const inputSize = (await fs.stat(filePath)).size;
      const outputSize = (await fs.stat(outputPath)).size;
      const savedSize = inputSize - outputSize;
      const savingPercent = ((savedSize / inputSize) * 100).toFixed(1);

      // Eliminar original si se solicitó
      if (options.remove) {
        await fs.unlink(filePath);
      }

      this.stats.processed++;

      if (savedSize < 0) {
        this.event.reply(
          `⚠️ El archivo convertido (${fileName}) ha aumentado de tamaño.\n\n` +
            `   Original: ${(inputSize / 1024).toFixed(2)}KB\n\n` +
            `   Nuevo: ${(outputSize / 1024).toFixed(2)}KB\n\n` +
            `   Aumento: ${Math.abs(savingPercent)}%`,
          "md-result"
        );

        return {
          success: true,
          inputSize,
          outputSize,
          savedSize,
          savingPercent: `+${Math.abs(savingPercent)}`,
        };
      }

      // Si hubo ahorro
      return {
        success: true,
        inputSize,
        outputSize,
        savedSize,
        savingPercent: `-${Math.abs(savingPercent)}`,
      };
    } catch (error) {
      this.stats.failed++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Procesa una carpeta completa
   */
  async processFolder(folderPath, options) {
    try {
      // Leer archivos de la carpeta
      const files = await fs.readdir(folderPath);

      // Filtrar solo archivos de imagen soportados
      const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_FORMATS.includes(ext);
      });

      // Procesar cada archivo
      for (const file of imageFiles) {
        const filePath = path.join(folderPath, file);
        const result = await this.processFile(filePath, options);

        if (result.success) {
          this.event.reply(
            `✅ Convertido: ${file}\n` +
              `   Original: ${(result.inputSize / 1024).toFixed(2)}KB\n` +
              `   Nuevo: ${(result.outputSize / 1024).toFixed(2)}KB\n` +
              `   Ahorro: ${result.savingPercent}%`
          );
        } else {
          this.event.reply(`❌ Error en ${file}: ${result.error}`);
        }
      }

      // Enviar resumen final
      this.event.reply(
        `\n📊 Resumen:\n` +
          `   Procesados: ${this.stats.processed}\n` +
          `   Fallidos: ${this.stats.failed}\n` +
          `   Total: ${imageFiles.length}`
      );
    } catch (error) {
      this.event.reply(`❌ Error procesando carpeta: ${error.message}`);
      throw error;
    }
  }

  /**
   * Método principal para iniciar la conversión
   */
  async convert(args) {
    try {
      // Parsear argumentos
      const options = commandParse.parse(args.join(" "));

      // Configurar opciones por defecto
      options.dest = options.dest || app.getPath("pictures");

      // Crear carpeta de destino si no existe
      await fs.mkdir(options.dest, { recursive: true });

      // Procesar según el tipo de entrada (archivo o carpeta)
      if (options.file) {
        const result = await this.processFile(options.file, options);
        if (result.success) {
          this.event.reply(
            `✅ Archivo convertido exitosamente\n` +
              `   Ahorro: ${result.savingPercent}%`
          );
        } else {
          this.event.reply(`❌ Error: ${result.error}`);
        }
      } else if (options.folder) {
        await this.processFolder(options.folder, options);
      } else {
        throw new Error("Debe especificar --file o --folder");
      }
    } catch (error) {
      this.event.reply(`❌ Error: ${error.message}`);
    }
  }
}

const converter = new ImageConverter();

// Función principal exportada
export default async function toGIF(event, args) {
  converter.event = event;
  await converter.convert(args);
}