/**
 * Utilitário para gerenciar cookies de alertas lidos
 */

const COOKIE_NAME = 'readAlerts';
const COOKIE_DURATION_HOURS = 48;

export const cookieManager = {
  /**
   * Salva IDs de alertas lidos no cookie
   */
  saveReadAlert: (alertId: string): void => {
    const readAlerts = cookieManager.getReadAlerts();
    if (!readAlerts.includes(alertId)) {
      readAlerts.push(alertId);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + COOKIE_DURATION_HOURS);
      
      document.cookie = `${COOKIE_NAME}=${JSON.stringify(readAlerts)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    }
  },

  /**
   * Recupera todos os IDs de alertas lidos do cookie
   */
  getReadAlerts: (): string[] => {
    const cookies = document.cookie.split(';');
    const readAlertsCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );

    if (!readAlertsCookie) {
      return [];
    }

    try {
      const value = readAlertsCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(value));
    } catch (error) {
      console.error('Erro ao ler cookie de alertas:', error);
      return [];
    }
  },

  /**
   * Verifica se um alerta específico está marcado como lido
   */
  isAlertRead: (alertId: string): boolean => {
    const readAlerts = cookieManager.getReadAlerts();
    return readAlerts.includes(alertId);
  },

  /**
   * Remove um alerta específico dos alertas lidos
   */
  removeReadAlert: (alertId: string): void => {
    const readAlerts = cookieManager.getReadAlerts();
    const updatedAlerts = readAlerts.filter(id => id !== alertId);
    
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + COOKIE_DURATION_HOURS);
    
    document.cookie = `${COOKIE_NAME}=${JSON.stringify(updatedAlerts)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  },

  /**
   * Limpa todos os alertas lidos do cookie
   */
  clearReadAlerts: (): void => {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
  }
};
