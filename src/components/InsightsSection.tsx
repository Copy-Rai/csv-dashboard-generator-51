
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    }> = {};
    
    data.forEach(item => {
      const platform = item.platform || 'Unknown';
      const cost = typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0;
      const revenue = typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0;
      const impressions = typeof item.impressions === 'number' ? item.impressions : parseFloat(item.impressions) || 0;
      const clicks = typeof item.clicks === 'number' ? item.clicks : parseFloat(item.clicks) || 0;
      
      if (!platformData[platform]) {
        platformData[platform] = {
          roi: [],
          ctr: [],
          cost: 0,
          revenue: 0,
          impressions: 0,
          clicks: 0
        };
      }
      
      // Calculate ROI for this item
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
      platformData[platform].roi.push(roi);
      
      // Calculate CTR for this item
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      platformData[platform].ctr.push(ctr);
      
      // Accumulate costs, revenue, impressions, and clicks
      platformData[platform].cost += cost;
      platformData[platform].revenue += revenue;
      platformData[platform].impressions += impressions;
      platformData[platform].clicks += clicks;
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
      clicks: metrics.clicks
    }));
    
    // Generate insights based on the metrics
    const insights = [];
    
    // Find platform with highest ROI
    const highestRoiPlatform = [...platformMetrics].sort((a, b) => b.roi - a.roi)[0];
    if (highestRoiPlatform) {
      insights.push({
        type: 'positive',
        title: 'Mejor ROI',
        description: `${highestRoiPlatform.platform} tiene el mejor ROI (${highestRoiPlatform.roi.toFixed(2)}%). Considera aumentar la inversión en esta plataforma.`,
        icon: <TrendingUp className="h-5 w-5" />
      });
    }
    
    // Find platform with lowest CTR
    const lowestCtrPlatform = [...platformMetrics]
      .filter(p => p.impressions > 100) // Ensure enough data
      .sort((a, b) => a.ctr - b.ctr)[0];
    
    if (lowestCtrPlatform) {
      insights.push({
        type: 'warning',
        title: 'Bajo CTR',
        description: `El CTR en ${lowestCtrPlatform.platform} es bajo (${lowestCtrPlatform.ctr.toFixed(2)}%). Considera revisar la creatividad o el llamado a la acción.`,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }
    
    // Find platform with highest cost but low ROI
    const inefficientPlatforms = platformMetrics
      .filter(p => p.cost > 0)
      .filter(p => p.roi < (highestRoiPlatform?.roi / 2) && p.cost > (highestRoiPlatform?.cost / 2));
    
    if (inefficientPlatforms.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Eficiencia de inversión',
        description: `${inefficientPlatforms[0].platform} tiene un alto costo pero bajo ROI. Considera optimizar o redistribuir el presupuesto.`,
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
    
    // Add general insight about conversion optimization
    const totalImpressions = platformMetrics.reduce((sum, p) => sum + p.impressions, 0);
    const totalClicks = platformMetrics.reduce((sum, p) => sum + p.clicks, 0);
    const totalConversions = platformMetrics.reduce((sum, p) => sum + (p.revenue > 0 ? 1 : 0), 0);
    
    if (totalImpressions > 0 && totalClicks > 0) {
      const overallCtr = (totalClicks / totalImpressions) * 100;
      const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      
      insights.push({
        type: 'insight',
        title: 'Visión general',
        description: `La tasa general de clics es ${overallCtr.toFixed(2)}% y la tasa de conversión es ${overallConversionRate.toFixed(2)}%. ${overallCtr < 2 ? 'Considera mejorar la relevancia de tus anuncios.' : 'Estos números están dentro del promedio de la industria.'}`,
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
