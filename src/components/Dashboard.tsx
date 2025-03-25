import React from 'react';
import { Eye, MousePointer, ArrowRightLeft, DollarSign, MessageCircle } from "lucide-react";
import MetricCard from './MetricCard';
import ChartSection from './ChartSection';
import InsightsSection from './InsightsSection';
import MentorSection from './MentorSection';
import ExportButton from './ExportButton';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface DashboardProps {
  data: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Calculate key metrics
  const calculateMetrics = () => {
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
    
    const totalConversions = data.reduce((sum, item) => {
      const conversions = typeof item.conversions === 'number' 
        ? item.conversions 
        : parseFloat(item.conversions) || 0;
      return sum + conversions;
    }, 0);
    
    const totalCost = data.reduce((sum, item) => {
      const cost = typeof item.cost === 'number' 
        ? item.cost 
        : parseFloat(item.cost) || 0;
      return sum + cost;
    }, 0);
    
    const totalRevenue = data.reduce((sum, item) => {
      const revenue = typeof item.revenue === 'number' 
        ? item.revenue 
        : parseFloat(item.revenue) || 0;
      return sum + revenue;
    }, 0);
    
    // Calculate overall CTR
    const overallCTR = totalImpressions > 0 
      ? (totalClicks / totalImpressions) * 100 
      : 0;
      
    // Calculate average ROI (either from direct ROI values or from cost/revenue)
    let averageROI;
    
    // First check if we have direct ROI values
    const roiValues = data
      .filter(item => typeof item.roi === 'number' || parseFloat(item.roi))
      .map(item => typeof item.roi === 'number' ? item.roi : parseFloat(item.roi));
      
    if (roiValues.length > 0) {
      // Calculate average of ROI values
      averageROI = roiValues.reduce((sum, roi) => sum + roi, 0) / roiValues.length;
    } else {
      // Calculate ROI from cost and revenue
      averageROI = totalCost > 0 
        ? ((totalRevenue - totalCost) / totalCost) * 100 
        : 0;
    }
    
    return {
      totalImpressions,
      totalClicks,
      totalConversions,
      overallCTR,
      averageROI,
      totalCost,
      totalRevenue
    };
  };

  const metrics = calculateMetrics();

  // Format numbers for display
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

  const mentorUrl = 'https://chatgpt.com/g/g-67e26ff502f881919b802f3ff8a77605-mentor-de-campanas-genia';

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <img 
          src="/lovable-uploads/845ba33d-1143-42dd-bd16-75d19bdbff27.png" 
          alt="GenIA Logo" 
          className="h-12 md:h-16" 
        />
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Impresiones totales" 
            value={formatNumber(metrics.totalImpressions)}
            icon={<Eye className="h-5 w-5" />}
            description="Total de veces que se han mostrado tus anuncios"
            delay={0}
          />
          <MetricCard 
            title="Clics totales" 
            value={formatNumber(metrics.totalClicks)}
            icon={<MousePointer className="h-5 w-5" />}
            description="Total de clics en tus anuncios"
            delay={100}
          />
          <MetricCard 
            title="Conversiones totales" 
            value={formatNumber(metrics.totalConversions)}
            icon={<ArrowRightLeft className="h-5 w-5" />}
            description="Total de conversiones generadas"
            delay={200}
          />
          <MetricCard 
            title="ROI promedio" 
            value={`${metrics.averageROI.toFixed(2)}%`}
            icon={<DollarSign className="h-5 w-5" />}
            description={`Basado en ${formatCurrency(metrics.totalRevenue)} de ingresos`}
            delay={300}
          />
        </div>
      </div>

      <ChartSection data={data} />
      <InsightsSection data={data} />
      <MentorSection data={data} />
      
      <div className="mt-16 mb-8 text-center">
        <p className="text-muted-foreground mb-4">
          ¿Tienes dudas sobre tu informe? Sube tu PDF o CSV y habla con tu mentor GenIA. Te lo explicará paso a paso.
        </p>
        <Button 
          onClick={() => window.open(mentorUrl, '_blank')}
          className="bg-[#FFC400] hover:bg-[#E5B200] text-black shadow-md px-6 py-6"
          size="lg"
        >
          <MessageCircle className="mr-2 h-5 w-5" /> 🧠 Habla con tu mentor GenIA
        </Button>
      </div>
      
      <ExportButton data={data} />
    </div>
  );
};

export default Dashboard;
