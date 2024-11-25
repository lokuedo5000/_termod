/**
 * Formatea el mensaje en Markdown según el tipo
 * @param {string} message - Mensaje base
 * @param {string} type - Tipo de mensaje ('info', 'error', 'success', 'progress')
 * @param {Object} stats - Estadísticas actuales
 * @returns {string} Mensaje formateado en Markdown
 */
function formatMarkdownMessage(message, type, stats) {
    const timestamp = new Date().toLocaleTimeString();
    let markdown = '';
  
    // Iconos para cada tipo de mensaje
    const icons = {
      info: 'ℹ️',
      error: '❌',
      success: '✅',
      progress: '⏳',
      warning: '⚠️'
    };
  
    // Formateo según el tipo
    switch (type) {
      case 'error':
        markdown = `${icons.error} Error (${timestamp})\n\`\`\`\n${message}\n\`\`\``;
        break;
      case 'success':
        markdown = `${icons.success} Éxito (${timestamp})\n${message}`;
        break;
      case 'progress':
        const progressData = `\n\n**Estadísticas actuales:**\n` +
          `- Procesados: ${stats.processed}\n` +
          `- Fallidos: ${stats.failed}\n` +
          `- Omitidos: ${stats.skipped}\n` +
          `- Ahorro: ${(stats.savedSize / 1024 / 1024).toFixed(2)}MB`;
        markdown = `${icons.progress} Progreso (${timestamp})\n${message}${progressData}`;
        break;
      case 'warning':
        markdown = `${icons.warning} Advertencia (${timestamp})\n> ${message}`;
        break;
      case 'info':
      default:
        markdown = `${icons.info} Info (${timestamp})\n${message}`;
    }
    
    return markdown;
  }
  
  /**
   * Clase para gestionar la emisión de eventos con formato Markdown
   */
  class MarkdownEmitter {
    constructor() {
      this.eventEmitter = null;
      this.stats = {
        processed: 0,
        failed: 0,
        skipped: 0,
        totalSize: 0,
        savedSize: 0,
      };
    }
  
    /**
     * Emite un mensaje formateado en Markdown
     * @param {string} message - Mensaje a enviar
     * @param {string} type - Tipo de mensaje ('info', 'error', 'success', 'progress')
     */
    emit(message, type = 'info') {
      if (this.eventEmitter?.reply) {
        const markdownMessage = formatMarkdownMessage(message, type, this.stats);
        console.log(markdownMessage);
        
        this.eventEmitter.reply(markdownMessage, type);
      }
    }
  
    /**
     * Emite un resumen final en formato Markdown
     */
    emitSummary() {
      if (!this.eventEmitter?.reply) return;
  
      const summary = 
        `# 📊 Resumen Final\n\n` +
        `## Estadísticas\n` +
        `| Métrica | Valor |\n` +
        `|---------|-------|\n` +
        `| ✅ Archivos procesados | ${this.stats.processed} |\n` +
        `| ❌ Archivos fallidos | ${this.stats.failed} |\n` +
        `| ⏭️ Archivos omitidos | ${this.stats.skipped} |\n` +
        `| 📁 Tamaño original | ${(this.stats.totalSize / 1024 / 1024).toFixed(2)}MB |\n` +
        `| 💾 Ahorro total | ${(this.stats.savedSize / 1024 / 1024).toFixed(2)}MB |\n` +
        `| 📉 Porcentaje de ahorro | ${((this.stats.savedSize / this.stats.totalSize) * 100).toFixed(1)}% |\n\n` +
        `## Detalles Adicionales\n` +
        `- Tiempo de finalización: ${new Date().toLocaleString()}\n` +
        `- Duración total: ${this.getDuration()}`;
  
      this.eventEmitter.reply(summary, "md-result");
    }
  
    /**
     * Actualiza las estadísticas
     * @param {Object} newStats - Nuevas estadísticas a incorporar
     */
    updateStats(newStats) {
      this.stats = { ...this.stats, ...newStats };
    }
  
    /**
     * Obtiene la duración del proceso
     * @returns {string} Duración formateada
     */
    getDuration() {
      if (!this.startTime) return 'N/A';
      const duration = Date.now() - this.startTime;
      const minutes = Math.floor(duration / 60000);
      const seconds = ((duration % 60000) / 1000).toFixed(0);
      return `${minutes}:${seconds.padStart(2, '0')}`;
    }
  
    /**
     * Inicia el temporizador del proceso
     */
    startTimer() {
      this.startTime = Date.now();
    }
  }
  
  export { MarkdownEmitter };