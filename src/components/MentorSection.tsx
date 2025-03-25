
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, AlertTriangle, Lightbulb, Brain } from "lucide-react";

interface MentorSectionProps {
  data: any[];
}

const MentorSection: React.FC<MentorSectionProps> = ({ data }) => {
  const generateMentorInsights = () => {
    // Process data to generate insights
    const insights = [];
    
    // Calculate basic metrics
    const totalImpressions = data.reduce((sum, item) => {
      const impressions = typeof item.impressions === 'number' 
        ? item.impressions 
        : parseFloat(item.impressions) || 0;
      return sum + impressions;
    }, 0);
    
    const totalClicks = data.reduce((sum, item) => {
      const clicks = typeof item.clicks === 'number' 
        ? item.clicks 
        : parseFloat(item.clicks) || 0;
      return sum + clicks;
    }, 0);
    
    const overallCTR = totalImpressions > 0 
      ? (totalClicks / totalImpressions) * 100 
      : 0;
    
    // 1. Educational insights (green) - Always include at least one
    const educationalInsights = [
      {
        type: 'educational',
        title: 'Conceptos básicos',
        description: `Has generado más de ${(totalImpressions/1000000).toFixed(1)} millones de impresiones. Eso significa que tus anuncios se han mostrado muchas veces. Buen trabajo de alcance.`,
        icon: <BookOpen className="h-5 w-5" />
      },
      {
        type: 'educational',
        title: 'Sobre el CTR',
        description: `Un CTR por encima del 2% es una buena señal: indica que la gente está haciendo clic en tus anuncios. Tu CTR actual es ${overallCTR.toFixed(2)}%.`,
        icon: <BookOpen className="h-5 w-5" />
      },
      {
        type: 'educational',
        title: 'Sobre el ROI',
        description: `El ROI indica la rentabilidad. Un ROI de 1 significa que has recuperado lo invertido. Un ROI de 2, que has duplicado tu inversión.`,
        icon: <BookOpen className="h-5 w-5" />
      }
    ];
    
    // Pick one educational insight
    insights.push(educationalInsights[Math.floor(Math.random() * educationalInsights.length)]);
    
    // 2. Alerts (amber) - Platform-specific issues
    // Group data by platform
    const platformData: Record<string, {
      impressions: number;
      clicks: number;
      conversions: number;
      cost: number;
      revenue: number;
    }> = {};
    
    data.forEach(item => {
      const platform = item.platform || 'Unknown';
      
      if (!platformData[platform]) {
        platformData[platform] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          cost: 0,
          revenue: 0
        };
      }
      
      platformData[platform].impressions += parseFloat(item.impressions) || 0;
      platformData[platform].clicks += parseFloat(item.clicks) || 0;
      platformData[platform].conversions += parseFloat(item.conversions) || 0;
      platformData[platform].cost += parseFloat(item.cost) || 0;
      platformData[platform].revenue += parseFloat(item.revenue) || 0;
    });
    
    // Calculate metrics by platform
    const platformMetrics = Object.entries(platformData).map(([platform, data]) => {
      const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
      const roi = data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0;
      
      return {
        platform,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        cost: data.cost,
        revenue: data.revenue,
        ctr,
        conversionRate,
        roi
      };
    });
    
    // Find platforms with low CTR
    const lowCtrPlatforms = platformMetrics
      .filter(p => p.impressions > 1000) // Only consider platforms with significant impressions
      .filter(p => p.ctr < 1)
      .sort((a, b) => a.ctr - b.ctr);
    
    if (lowCtrPlatforms.length > 0) {
      insights.push({
        type: 'alert',
        title: 'CTR bajo detectado',
        description: `Tu CTR en ${lowCtrPlatforms[0].platform} está por debajo del 1% (${lowCtrPlatforms[0].ctr.toFixed(2)}%). Es posible que tu anuncio no esté generando suficiente interés.`,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }
    
    // Find platforms with low conversion but high impressions
    const lowConversionPlatforms = platformMetrics
      .filter(p => p.impressions > 5000) // Only platforms with significant impressions
      .filter(p => p.conversionRate < 1) // Low conversion rate
      .sort((a, b) => b.impressions - a.impressions); // Sort by highest impressions
    
    if (lowConversionPlatforms.length > 0) {
      insights.push({
        type: 'alert',
        title: 'Conversiones bajas',
        description: `${lowConversionPlatforms[0].platform} tiene muchas impresiones pero pocas conversiones. Puede que tu mensaje no esté conectando con el público.`,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }
    
    // Find platforms with high cost but low ROI
    const lowRoiHighCostPlatforms = platformMetrics
      .filter(p => p.cost > 0) // Only platforms with cost
      .filter(p => p.roi < 50) // Low ROI
      .sort((a, b) => b.cost - a.cost); // Sort by highest cost
    
    if (lowRoiHighCostPlatforms.length > 0) {
      insights.push({
        type: 'alert',
        title: 'Inversión ineficiente',
        description: `Inviertes bastante en ${lowRoiHighCostPlatforms[0].platform} pero el ROI es bajo (${lowRoiHighCostPlatforms[0].roi.toFixed(2)}%). Considera redistribuir el presupuesto.`,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }
    
    // 3. Strategic suggestions (blue)
    // Find platform with highest ROI
    const highRoiPlatforms = [...platformMetrics]
      .filter(p => p.cost > 100) // Only consider platforms with significant spend
      .sort((a, b) => b.roi - a.roi);
    
    if (highRoiPlatforms.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Mejor ROI',
        description: `${highRoiPlatforms[0].platform} es la más rentable: ROI de ${highRoiPlatforms[0].roi.toFixed(2)}%. Valora aumentar la inversión en esta plataforma.`,
        icon: <Lightbulb className="h-5 w-5" />
      });
    }
    
    // Find platform with highest CTR
    const highCtrPlatforms = [...platformMetrics]
      .filter(p => p.impressions > 1000) // Only consider platforms with significant impressions
      .sort((a, b) => b.ctr - a.ctr);
    
    if (highCtrPlatforms.length > 0 && highCtrPlatforms[0].ctr > 1.5) {
      insights.push({
        type: 'suggestion',
        title: 'Mejor CTR',
        description: `${highCtrPlatforms[0].platform} tiene el CTR más alto (${highCtrPlatforms[0].ctr.toFixed(2)}%). Ideal para aumentar visibilidad.`,
        icon: <Lightbulb className="h-5 w-5" />
      });
    }
    
    // Find platform with highest impressions
    const highImpressionPlatforms = [...platformMetrics]
      .sort((a, b) => b.impressions - a.impressions);
    
    if (highImpressionPlatforms.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Mayor alcance',
        description: `${highImpressionPlatforms[0].platform} destaca por volumen de impresiones (${Math.round(highImpressionPlatforms[0].impressions).toLocaleString()}). Buena opción para campañas de notoriedad.`,
        icon: <Lightbulb className="h-5 w-5" />
      });
    }
    
    // Find platform with high revenue and low cost
    const highRevenueEfficiencyPlatforms = [...platformMetrics]
      .filter(p => p.revenue > 0 && p.cost > 0) // Only consider platforms with revenue and cost
      .sort((a, b) => (b.revenue / b.cost) - (a.revenue / a.cost));
    
    if (highRevenueEfficiencyPlatforms.length > 0 && (highRevenueEfficiencyPlatforms[0].revenue / highRevenueEfficiencyPlatforms[0].cost) > 2) {
      insights.push({
        type: 'suggestion',
        title: 'Eficiencia máxima',
        description: `Ingresas mucho en ${highRevenueEfficiencyPlatforms[0].platform} con bajo coste. Excelente opción para escalar resultados.`,
        icon: <Lightbulb className="h-5 w-5" />
      });
    }
    
    // 4. General mentorship (purple) - Always include one
    const mentorshipInsights = [
      {
        type: 'mentorship',
        title: 'Consejo de mentor',
        description: `Haz de tu dashboard un aliado: revísalo cada semana, no solo cuando algo falla.`,
        icon: <Brain className="h-5 w-5" />
      },
      {
        type: 'mentorship',
        title: 'Reflexión estratégica',
        description: `No siempre se trata de llegar a más gente, sino de llegar a la adecuada.`,
        icon: <Brain className="h-5 w-5" />
      },
      {
        type: 'mentorship',
        title: 'Perspectiva ganadora',
        description: `Si una plataforma no está funcionando, no es un fracaso: es información. Ajusta, prueba y vuelve.`,
        icon: <Brain className="h-5 w-5" />
      }
    ];
    
    // Add one mentorship insight
    insights.push(mentorshipInsights[Math.floor(Math.random() * mentorshipInsights.length)]);
    
    // Extra: check if "revenue" column exists and add a card about it
    const hasRevenue = data.some(item => 
      (typeof item.revenue === 'number' && item.revenue > 0) || 
      (typeof item.revenue === 'string' && parseFloat(item.revenue) > 0)
    );
    
    if (hasRevenue) {
      insights.push({
        type: 'educational',
        title: 'Sobre los ingresos',
        description: `Los ingresos representan el dinero generado por tus campañas. Has generado ${totalRevenue.toLocaleString('es-ES')} € a partir del ROI y el coste total.`,
        icon: <BookOpen className="h-5 w-5" />
      });
    }
    
    // Limit to 6 insights, prioritizing alerts and suggestions
    return insights
      .sort((a, b) => {
        // Prioritize alerts and suggestions
        const priority = {
          'alert': 0,
          'suggestion': 1,
          'educational': 2,
          'mentorship': 3
        };
        return priority[a.type as keyof typeof priority] - priority[b.type as keyof typeof priority];
      })
      .slice(0, 6);
  };

  const insights = generateMentorInsights();

  return (
    <div className="mentor-section my-8 animate-fade-in" style={{ animationDelay: '900ms' }}>
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-semibold mr-2">Tu mentor de campaña dice...</h2>
        <span className="text-2xl">🧠</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <Card 
            key={index} 
            className={`insight-card card-glow border-l-4 ${
              insight.type === 'educational' ? 'border-l-green-500' :
              insight.type === 'alert' ? 'border-l-amber-500' :
              insight.type === 'suggestion' ? 'border-l-blue-500' :
              'border-l-purple-500'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'educational' ? 'bg-green-100 text-green-700' :
                  insight.type === 'alert' ? 'bg-amber-100 text-amber-700' :
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

export default MentorSection;
