
import { calculatePlatformMetrics } from './dataProcessing';

interface CampaignData {
  platform: string;
  campaign_name?: string;
  date?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
}

interface Insight {
  type: 'positive' | 'warning' | 'suggestion' | 'insight';
  title: string;
  description: string;
}

export const generateInsights = (data: CampaignData[]): Insight[] => {
  const insights: Insight[] = [];
  
  // Skip if no data
  if (!data || data.length === 0) {
    return [
      {
        type: 'warning',
        title: 'Datos insuficientes',
        description: 'No hay suficientes datos para generar insights significativos.'
      }
    ];
  }
  
  // Get platform metrics
  const platformMetrics = calculatePlatformMetrics(data);
  
  // Skip if no valid platform metrics
  if (platformMetrics.length === 0) {
    return [
      {
        type: 'warning',
        title: 'Datos insuficientes',
        description: 'No hay suficientes datos por plataforma para generar insights significativos.'
      }
    ];
  }
  
  // Find best ROI platform
  const highestRoiPlatform = [...platformMetrics].sort((a, b) => b.roi - a.roi)[0];
  if (highestRoiPlatform && highestRoiPlatform.roi > 0) {
    insights.push({
      type: 'positive',
      title: 'Mejor ROI',
      description: `${highestRoiPlatform.platform} tiene el mejor ROI (${highestRoiPlatform.roi.toFixed(2)}%). Considera aumentar la inversión en esta plataforma.`
    });
  }
  
  // Find worst CTR platform (but only if it has meaningful impressions)
  const relevantPlatforms = platformMetrics.filter(p => p.totalImpressions > 100);
  if (relevantPlatforms.length > 0) {
    const lowestCtrPlatform = [...relevantPlatforms].sort((a, b) => a.ctr - b.ctr)[0];
    
    if (lowestCtrPlatform && lowestCtrPlatform.ctr < 1) {
      insights.push({
        type: 'warning',
        title: 'Bajo CTR',
        description: `El CTR en ${lowestCtrPlatform.platform} es bajo (${lowestCtrPlatform.ctr.toFixed(2)}%). Considera revisar la creatividad o el llamado a la acción.`
      });
    }
  }
  
  // Find platform with high cost but low ROI
  const expensivePlatforms = platformMetrics.filter(p => p.totalCost > 0);
  if (expensivePlatforms.length > 1) {
    // Find platforms with below average ROI but above average cost
    const avgRoi = expensivePlatforms.reduce((sum, p) => sum + p.roi, 0) / expensivePlatforms.length;
    const avgCost = expensivePlatforms.reduce((sum, p) => sum + p.totalCost, 0) / expensivePlatforms.length;
    
    const inefficientPlatforms = expensivePlatforms.filter(
      p => p.roi < avgRoi && p.totalCost > avgCost
    );
    
    if (inefficientPlatforms.length > 0) {
      const platform = inefficientPlatforms[0];
      insights.push({
        type: 'warning',
        title: 'Eficiencia de inversión',
        description: `${platform.platform} tiene un alto costo pero bajo ROI. Considera optimizar o redistribuir el presupuesto.`
      });
    }
  }
  
  // Overall conversion rate insights
  const totalClicks = platformMetrics.reduce((sum, p) => sum + p.totalClicks, 0);
  const totalConversions = platformMetrics.reduce((sum, p) => sum + p.totalConversions, 0);
  
  if (totalClicks > 100) {
    const overallConversionRate = (totalConversions / totalClicks) * 100;
    
    if (overallConversionRate < 1) {
      insights.push({
        type: 'suggestion',
        title: 'Tasa de conversión baja',
        description: `La tasa de conversión general es ${overallConversionRate.toFixed(2)}%. Considera mejorar la experiencia de landing page o las ofertas.`
      });
    } else if (overallConversionRate > 5) {
      insights.push({
        type: 'positive',
        title: 'Buena tasa de conversión',
        description: `La tasa de conversión general es ${overallConversionRate.toFixed(2)}%, lo cual es excelente. Mantén las estrategias actuales.`
      });
    }
  }
  
  // ROI trend insights
  if (platformMetrics.length > 0) {
    const totalCost = platformMetrics.reduce((sum, p) => sum + p.totalCost, 0);
    const totalRevenue = platformMetrics.reduce((sum, p) => sum + p.totalRevenue, 0);
    
    if (totalCost > 0) {
      const overallRoi = ((totalRevenue - totalCost) / totalCost) * 100;
      
      if (overallRoi < 0) {
        insights.push({
          type: 'warning',
          title: 'ROI negativo',
          description: `El ROI general es negativo (${overallRoi.toFixed(2)}%). Considera revisar tu estrategia general de marketing.`
        });
      } else if (overallRoi > 100) {
        insights.push({
          type: 'positive',
          title: 'ROI excelente',
          description: `El ROI general es muy bueno (${overallRoi.toFixed(2)}%). Tu estrategia actual está funcionando bien.`
        });
      }
    }
  }
  
  // If we don't have enough insights, add a general one
  if (insights.length < 2) {
    insights.push({
      type: 'insight',
      title: 'Análisis continuo',
      description: 'Continúa recopilando datos para obtener insights más precisos. Considera realizar pruebas A/B para mejorar los resultados.'
    });
  }
  
  return insights;
};
