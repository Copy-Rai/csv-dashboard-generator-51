
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, TrendingUp, ChartBar, Target } from "lucide-react";

interface InsightsSectionProps {
  data: any[];
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ data }) => {
  // Process data for insights
  const generateInsights = () => {
    // First, organize data by platform
    const platformData: Record<string, {
      roi: number[];
      ctr: number[];
      cost: number;
      revenue: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }> = {};
    
    data.forEach(item => {
      const platform = item.platform || 'Unknown';
      const cost = typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0;
      const revenue = typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0;
      const impressions = typeof item.impressions === 'number' ? item.impressions : parseFloat(item.impressions) || 0;
      const clicks = typeof item.clicks === 'number' ? item.clicks : parseFloat(item.clicks) || 0;
      const conversions = typeof item.conversions === 'number' ? item.conversions : parseFloat(item.conversions) || 0;
      
      if (!platformData[platform]) {
        platformData[platform] = {
          roi: [],
          ctr: [],
          cost: 0,
          revenue: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        };
      }
      
      // Get or calculate ROI
      let roi = 0;
      if (typeof item.roi === 'number' || parseFloat(item.roi)) {
        roi = typeof item.roi === 'number' ? item.roi : parseFloat(item.roi);
      } else if (cost > 0) {
        roi = ((revenue - cost) / cost) * 100;
      }
      platformData[platform].roi.push(roi);
      
      // Get or calculate CTR
      let ctr = 0;
      if (typeof item.ctr === 'number' || parseFloat(item.ctr)) {
        ctr = typeof item.ctr === 'number' ? item.ctr : parseFloat(item.ctr);
      } else if (impressions > 0) {
        ctr = (clicks / impressions) * 100;
      }
      platformData[platform].ctr.push(ctr);
      
      // Accumulate other metrics
      platformData[platform].cost += cost;
      platformData[platform].revenue += revenue;
      platformData[platform].impressions += impressions;
      platformData[platform].clicks += clicks;
      platformData[platform].conversions += conversions;
    });
    
    // Calculate average metrics by platform
    const platformMetrics = Object.entries(platformData).map(([platform, metrics]) => ({
      platform,
      // Average ROI across all entries for this platform
      roi: metrics.roi.length > 0 
        ? metrics.roi.reduce((sum, val) => sum + val, 0) / metrics.roi.length 
        : 0,
      // Average CTR across all entries for this platform
      ctr: metrics.ctr.length > 0 
        ? metrics.ctr.reduce((sum, val) => sum + val, 0) / metrics.ctr.length 
        : 0,
      cost: metrics.cost,
      revenue: metrics.revenue,
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      conversions: metrics.conversions,
      // Also calculate conversion rate
      convRate: metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0
    }));
    
    // Calculate platform averages for comparison
    const avgCTR = platformMetrics.length > 0
      ? platformMetrics.reduce((sum, p) => sum + p.ctr, 0) / platformMetrics.length
      : 0;
      
    const avgROI = platformMetrics.length > 0
      ? platformMetrics.reduce((sum, p) => sum + p.roi, 0) / platformMetrics.length
      : 0;
      
    const avgConvRate = platformMetrics.length > 0
      ? platformMetrics.reduce((sum, p) => sum + p.convRate, 0) / platformMetrics.length
      : 0;
    
    // Generate insights based on the metrics
    const insights = [];
    
    // Find platform with highest ROI
    const highestRoiPlatform = [...platformMetrics].sort((a, b) => b.roi - a.roi)[0];
    if (highestRoiPlatform && highestRoiPlatform.roi > 0) {
      insights.push({
        type: 'positive',
        title: 'Mejor ROI',
        description: `${highestRoiPlatform.platform} tiene el mejor ROI (${highestRoiPlatform.roi.toFixed(2)}%). Considera aumentar la inversión en esta plataforma.`,
        icon: <TrendingUp className="h-5 w-5" />
      });
    }
    
    // Find platforms with CTR below average
    const lowCtrPlatforms = platformMetrics
      .filter(p => p.impressions > 100) // Ensure enough data
      .filter(p => p.ctr < avgCTR * 0.8) // Less than 80% of average
      .sort((a, b) => a.ctr - b.ctr);
    
    if (lowCtrPlatforms.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Bajo CTR',
        description: `${lowCtrPlatforms[0].platform} tiene un CTR por debajo de la media (${lowCtrPlatforms[0].ctr.toFixed(2)}% vs ${avgCTR.toFixed(2)}%). Considera revisar la creatividad o el llamado a la acción.`,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }
    
    // Find platform with high impressions but low conversions
    const inefficientPlatforms = platformMetrics
      .filter(p => p.impressions > avgCTR * 1.5) // More than 150% of average impressions
      .filter(p => p.convRate < avgConvRate * 0.8) // Less than 80% of average conversion rate
      .sort((a, b) => b.impressions - a.impressions);
    
    if (inefficientPlatforms.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Impresiones sin conversiones',
        description: `${inefficientPlatforms[0].platform} ha generado muchas impresiones pero pocas conversiones. Revisa la calidad del tráfico y la experiencia post-clic.`,
        icon: <ChartBar className="h-5 w-5" />
      });
    }
    
    // Suggest budget allocation
    if (platformMetrics.length > 1) {
      // Sort platforms by ROI
      const sortedByRoi = [...platformMetrics].sort((a, b) => b.roi - a.roi);
      
      if (sortedByRoi[0].roi > sortedByRoi[sortedByRoi.length - 1].roi * 1.5) {
        insights.push({
          type: 'suggestion',
          title: 'Sugerencia de asignación',
          description: `Considera reasignar parte del presupuesto de ${sortedByRoi[sortedByRoi.length - 1].platform} a ${sortedByRoi[0].platform} para maximizar el retorno.`,
          icon: <Target className="h-5 w-5" />
        });
      }
    }
    
    // Add general insight about overall performance
    const totalImpressions = platformMetrics.reduce((sum, p) => sum + p.impressions, 0);
    const totalClicks = platformMetrics.reduce((sum, p) => sum + p.clicks, 0);
    const totalConversions = platformMetrics.reduce((sum, p) => sum + p.conversions, 0);
    
    if (totalImpressions > 0 && totalClicks > 0) {
      const overallCtr = (totalClicks / totalImpressions) * 100;
      const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      
      let performanceText = "";
      if (overallCtr < 1) {
        performanceText = "La tasa general de clics está por debajo del promedio recomendado. Considera mejorar la relevancia de tus anuncios.";
      } else if (overallConversionRate < 1) {
        performanceText = "La tasa de conversión es baja. Revisa la experiencia post-clic y las páginas de destino.";
      } else {
        performanceText = "Estos números están dentro del promedio de la industria.";
      }
      
      insights.push({
        type: 'insight',
        title: 'Visión general',
        description: `La tasa general de clics es ${overallCtr.toFixed(2)}% y la tasa de conversión es ${overallConversionRate.toFixed(2)}%. ${performanceText}`,
        icon: <Lightbulb className="h-5 w-5" />
      });
    }
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="my-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
      <h2 className="text-2xl font-semibold mb-4">Insights y recomendaciones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className={`card-glow border-l-4 ${
            insight.type === 'positive' ? 'border-l-green-500' :
            insight.type === 'warning' ? 'border-l-amber-500' :
            insight.type === 'suggestion' ? 'border-l-blue-500' :
            'border-l-purple-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'positive' ? 'bg-green-100 text-green-700' :
                  insight.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                  insight.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {insight.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InsightsSection;
