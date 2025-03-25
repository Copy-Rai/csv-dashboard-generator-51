
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MentorSectionProps {
  data: any[];
}

// Helper functions to analyze data
const hasManyImpressions = (data: any[]) => {
  const totalImpressions = data.reduce((sum, item) => {
    const impressions = typeof item.impressions === 'number' 
      ? item.impressions 
      : parseFloat(item.impressions) || 0;
    return sum + impressions;
  }, 0);
  
  return totalImpressions > 10000; // Assuming 10k is "many" for this demo
};

const hasRevenueData = (data: any[]) => {
  return data.some(item => 
    (typeof item.revenue === 'number' && item.revenue > 0) || 
    (typeof item.revenue === 'string' && parseFloat(item.revenue) > 0)
  );
};

const calculatePlatformMetrics = (data: any[]) => {
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
    
    // Accumulate metrics
    platformData[platform].impressions += typeof item.impressions === 'number' 
      ? item.impressions 
      : parseFloat(item.impressions) || 0;
      
    platformData[platform].clicks += typeof item.clicks === 'number' 
      ? item.clicks 
      : parseFloat(item.clicks) || 0;
      
    platformData[platform].conversions += typeof item.conversions === 'number' 
      ? item.conversions 
      : parseFloat(item.conversions) || 0;
      
    platformData[platform].cost += typeof item.cost === 'number' 
      ? item.cost 
      : parseFloat(item.cost) || 0;
      
    platformData[platform].revenue += typeof item.revenue === 'number' 
      ? item.revenue 
      : parseFloat(item.revenue) || 0;
  });
  
  // Calculate CTR and ROI for each platform
  return Object.entries(platformData).map(([platform, metrics]) => {
    const ctr = metrics.impressions > 0 
      ? (metrics.clicks / metrics.impressions) * 100 
      : 0;
      
    const roi = metrics.cost > 0 
      ? ((metrics.revenue - metrics.cost) / metrics.cost) * 100 
      : 0;
      
    const conversionRate = metrics.clicks > 0 
      ? (metrics.conversions / metrics.clicks) * 100 
      : 0;
      
    return {
      platform,
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      conversions: metrics.conversions,
      cost: metrics.cost,
      revenue: metrics.revenue,
      ctr,
      roi,
      conversionRate
    };
  });
};

const MentorSection: React.FC<MentorSectionProps> = ({ data }) => {
  // Skip if no data
  if (!data || data.length === 0) {
    return null;
  }
  
  // Calculate platform-specific metrics
  const platformMetrics = calculatePlatformMetrics(data);
  
  // Calculate overall metrics
  const totalImpressions = platformMetrics.reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = platformMetrics.reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = platformMetrics.reduce((sum, p) => sum + p.conversions, 0);
  const totalCost = platformMetrics.reduce((sum, p) => sum + p.cost, 0);
  const totalRevenue = platformMetrics.reduce((sum, p) => sum + p.revenue, 0);
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageROI = platformMetrics.length > 0
    ? platformMetrics.reduce((sum, p) => sum + p.roi, 0) / platformMetrics.length
    : 0;
  
  // Format large numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(Math.round(num));
  };
  
  // Format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };
  
  // 1. EDUCATIONAL PHRASES (green)
  const educationalPhrases = [
    {
      type: 'educational',
      icon: <BookOpen className="h-5 w-5" />,
      title: "Alcance de tus campañas",
      content: `Has generado más de ${formatNumber(totalImpressions)} impresiones. Eso significa que tus anuncios se han mostrado muchas veces. ${totalImpressions > 1000000 ? 'Excelente' : 'Buen'} trabajo de alcance.`
    },
    {
      type: 'educational',
      icon: <BookOpen className="h-5 w-5" />,
      title: "Entendiendo el CTR",
      content: `Un CTR ${overallCTR > 2 ? 'por encima del 2% es una buena señal' : 'del ' + overallCTR.toFixed(2) + '%'}: indica que la gente está haciendo clic en tus anuncios.`
    },
    {
      type: 'educational',
      icon: <BookOpen className="h-5 w-5" />,
      title: "Entendiendo el ROI",
      content: `El ROI indica la rentabilidad. Un ROI de ${Math.abs(averageROI).toFixed(2)}% significa ${averageROI > 0 
        ? `que por cada euro invertido, has recuperado ${(1 + averageROI/100).toFixed(2)} euros` 
        : 'que aún no has recuperado tu inversión'}.`
    }
  ];
  
  // Add revenue phrase if detected
  if (hasRevenueData(data)) {
    educationalPhrases.push({
      type: 'educational',
      icon: <BookOpen className="h-5 w-5" />,
      title: "Ingresos generados",
      content: `Los ingresos de ${formatCurrency(totalRevenue)} representan el dinero generado por tus campañas. Se calculan a partir del ROI y el coste total.`
    });
  }
  
  // 2. ALERT PHRASES (amber)
  const alertPhrases = [];
  
  // Check for platforms with high impressions but low conversions
  const platformsWithLowConversions = platformMetrics
    .filter(p => p.impressions > 1000 && p.conversionRate < 0.5)
    .sort((a, b) => b.impressions - a.impressions);
    
  if (platformsWithLowConversions.length > 0) {
    alertPhrases.push({
      type: 'alert',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Revisión de contenido",
      content: `${platformsWithLowConversions[0].platform} tiene muchas impresiones pero pocas conversiones. Revisa si el contenido está alineado con la audiencia.`
    });
  }
  
  // Check for platforms with low CTR
  const platformsWithLowCTR = platformMetrics
    .filter(p => p.impressions > 500 && p.ctr < 1)
    .sort((a, b) => a.ctr - b.ctr);
    
  if (platformsWithLowCTR.length > 0) {
    alertPhrases.push({
      type: 'alert',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "CTR bajo",
      content: `Tu CTR en ${platformsWithLowCTR[0].platform} está por debajo del 1% (${platformsWithLowCTR[0].ctr.toFixed(2)}%). Puede que tu anuncio no esté generando interés.`
    });
  }
  
  // Check for high cost but low ROI
  const platformsWithLowROI = platformMetrics
    .filter(p => p.cost > 100 && p.roi < 50)
    .sort((a, b) => a.roi - b.roi);
    
  if (platformsWithLowROI.length > 0) {
    alertPhrases.push({
      type: 'alert',
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Revisión de inversión",
      content: `Inviertes bastante en ${platformsWithLowROI[0].platform}, pero el ROI es bajo (${platformsWithLowROI[0].roi.toFixed(2)}%). Considera redistribuir el presupuesto.`
    });
  }
  
  // 3. STRATEGIC RECOMMENDATION PHRASES (blue)
  const recommendationPhrases = [];
  
  // Best ROI platform
  if (platformMetrics.length > 1) {
    const bestROIPlatform = [...platformMetrics]
      .filter(p => p.cost > 50) // Only consider platforms with significant spend
      .sort((a, b) => b.roi - a.roi)[0];
      
    if (bestROIPlatform && bestROIPlatform.roi > 0) {
      recommendationPhrases.push({
        type: 'recommendation',
        icon: <Lightbulb className="h-5 w-5" />,
        title: "Optimización de inversión",
        content: `${bestROIPlatform.platform} es la más rentable: ROI de ${bestROIPlatform.roi.toFixed(2)}%. Valora aumentar la inversión.`
      });
    }
    
    // Best CTR platform
    const bestCTRPlatform = [...platformMetrics]
      .filter(p => p.impressions > 500) // Only consider platforms with significant impressions
      .sort((a, b) => b.ctr - a.ctr)[0];
      
    if (bestCTRPlatform && bestCTRPlatform.ctr > 1) {
      recommendationPhrases.push({
        type: 'recommendation',
        icon: <Lightbulb className="h-5 w-5" />,
        title: "Enfoque en visibilidad",
        content: `${bestCTRPlatform.platform} tiene el CTR más alto (${bestCTRPlatform.ctr.toFixed(2)}%). Ideal para aumentar visibilidad.`
      });
    }
    
    // Best impressions platform
    const bestImpressionsPlatform = [...platformMetrics]
      .sort((a, b) => b.impressions - a.impressions)[0];
      
    if (bestImpressionsPlatform && bestImpressionsPlatform.impressions > 1000) {
      recommendationPhrases.push({
        type: 'recommendation',
        icon: <Lightbulb className="h-5 w-5" />,
        title: "Potencial de notoriedad",
        content: `${bestImpressionsPlatform.platform} destaca por volumen de impresiones (${formatNumber(bestImpressionsPlatform.impressions)}). Buena opción para campañas de notoriedad.`
      });
    }
    
    // Platform with high revenue and low cost
    const efficientPlatforms = platformMetrics
      .filter(p => p.revenue > 500 && p.cost > 0 && p.revenue / p.cost > 2)
      .sort((a, b) => (b.revenue / b.cost) - (a.revenue / a.cost))[0];
      
    if (efficientPlatforms) {
      recommendationPhrases.push({
        type: 'recommendation',
        icon: <Lightbulb className="h-5 w-5" />,
        title: "Escalar resultados",
        content: `Ingresas mucho en ${efficientPlatforms.platform} con bajo coste. Excelente opción para escalar resultados.`
      });
    }
  }
  
  // 4. MENTORSHIP PHRASES (purple)
  const mentorPhrases = [
    {
      type: 'mentor',
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Calidad vs Cantidad",
      content: "No siempre se trata de llegar a más gente, sino de llegar a la adecuada."
    },
    {
      type: 'mentor',
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Aprendizaje constante",
      content: "Si una plataforma no está funcionando, no es un fracaso: es información. Ajusta, prueba y vuelve."
    },
    {
      type: 'mentor',
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Hábito analítico",
      content: "Haz de tu dashboard un aliado: revísalo cada semana, no solo cuando algo falla."
    }
  ];
  
  // Combine all phrases and limit to max 6, prioritizing alerts and recommendations
  // We want a mix of different types, so we'll select them in order of priority
  const allPhrases = [];
  
  // Add at least one educational phrase
  if (educationalPhrases.length > 0) {
    allPhrases.push(educationalPhrases[0]);
  }
  
  // Add alerts (high priority)
  allPhrases.push(...alertPhrases);
  
  // Add recommendations (medium priority)
  allPhrases.push(...recommendationPhrases);
  
  // Add one more educational phrase if available
  if (educationalPhrases.length > 1) {
    allPhrases.push(educationalPhrases[1]);
  }
  
  // Add mentor phrases (always good to have)
  allPhrases.push(...mentorPhrases);
  
  // Limit to 6 phrases
  const displayedPhrases = allPhrases.slice(0, 6);

  return (
    <div className="my-8 animate-fade-in" style={{ animationDelay: '800ms' }}>
      <div className="flex items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold">Tu mentor de campaña dice…</h2>
        <span className="text-2xl">🧠</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedPhrases.map((phrase, index) => (
          <Card key={index} className={`card-glow border-l-4 ${
            phrase.type === 'educational' ? 'border-l-green-500' :
            phrase.type === 'alert' ? 'border-l-amber-500' :
            phrase.type === 'recommendation' ? 'border-l-blue-500' :
            'border-l-purple-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className={`p-2 rounded-lg ${
                  phrase.type === 'educational' ? 'bg-green-100 text-green-700' :
                  phrase.type === 'alert' ? 'bg-amber-100 text-amber-700' :
                  phrase.type === 'recommendation' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {phrase.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium">{phrase.title}</h3>
                    <Badge variant="outline" className={`text-xs ${
                      phrase.type === 'educational' ? 'bg-green-50 text-green-700' :
                      phrase.type === 'alert' ? 'bg-amber-50 text-amber-700' :
                      phrase.type === 'recommendation' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {phrase.type === 'educational' ? 'Concepto' :
                       phrase.type === 'alert' ? 'Alerta' :
                       phrase.type === 'recommendation' ? 'Sugerencia' :
                       'Consejo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{phrase.content}</p>
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
