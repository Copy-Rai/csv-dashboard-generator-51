
import React from 'react';
import { Eye, MousePointer, ArrowRightLeft, DollarSign } from "lucide-react";
import MetricCard from './MetricCard';
import ChartSection from './ChartSection';
import InsightsSection from './InsightsSection';
import MentorSection from './MentorSection';

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

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4 py-8">
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
    </div>
  );
};

export default Dashboard;
