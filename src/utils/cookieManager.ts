/**
 * Utilitário para gerenciar alertas lidos usando localStorage
 * (localStorage é mais confiável que cookies em contextos de preview/iframe)
 */

const STORAGE_KEY = 'readAlerts';
const STORAGE_DURATION_HOURS = 50;

export const cookieManager = {
  /**
   * Salva IDs de alertas lidos no localStorage
   */
  saveReadAlert: (alertId: string): void => {
    const readAlerts = cookieManager.getReadAlerts();
    console.log('🔵 Salvando alerta como lido:', alertId);
    console.log('🔵 Alertas já lidos:', readAlerts);
    
    if (!readAlerts.includes(alertId)) {
      readAlerts.push(alertId);
      
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + STORAGE_DURATION_HOURS);
      
      const data = {
        alerts: readAlerts,
        expiry: expiryDate.getTime()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('✅ Storage salvo. Novos alertas lidos:', readAlerts);
      console.log('✅ Expira em:', expiryDate.toLocaleString());
      
      // Verificar se foi realmente salvo
      const verification = cookieManager.getReadAlerts();
      console.log('🔍 Verificação imediata:', verification);
    } else {
      console.log('⚠️ Alerta já estava marcado como lido');
    }
  },

  /**
   * Recupera todos os IDs de alertas lidos do localStorage
   */
  getReadAlerts: (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        console.log('🔍 Nenhum alerta salvo encontrado');
        return [];
      }

      const data = JSON.parse(stored);
      
      // Verificar se não expirou
      if (data.expiry && new Date().getTime() > data.expiry) {
        console.log('⏰ Alertas lidos expiraram, limpando...');
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      
      console.log('🔍 Alertas lidos do storage:', data.alerts);
      return data.alerts || [];
    } catch (error) {
      console.error('❌ Erro ao ler alertas:', error);
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
    expiryDate.setHours(expiryDate.getHours() + STORAGE_DURATION_HOURS);
    
    const data = {
      alerts: updatedAlerts,
      expiry: expiryDate.getTime()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  /**
   * Limpa todos os alertas lidos do localStorage
   */
  clearReadAlerts: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
