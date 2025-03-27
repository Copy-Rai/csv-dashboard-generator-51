
import React from 'react';
import { Eye, MousePointer, ArrowRightLeft, DollarSign, MessageCircle, FileText } from "lucide-react";
import MetricCard from './MetricCard';
import ChartSection from './ChartSection';
import InsightsSection from './InsightsSection';
import MentorSection from './MentorSection';
import ExportButton from './ExportButton';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

interface DashboardProps {
  data: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const calculateMetrics = () => {
    console.log("Calculando métricas con", data.length, "registros");
    
    // Debug para ver todos los estados de campaña
    const campaignStatuses = data.map(item => item.campaign_name).filter(Boolean);
    console.log("Estados de campaña encontrados:", [...new Set(campaignStatuses)]);
    
    // Convertir y asegurar que todos los valores sean numéricos
    const ensureNumber = (value: any): number => {
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      }
      
      if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(',', '.'));
        return !isNaN(parsed) ? parsed : 0;
      }
      
      return 0;
    };
    
    // Calcular totales sumando todos los registros, independientemente del estado
    const totalImpressions = data.reduce((sum, item) => {
      const impressions = ensureNumber(item.impressions);
      return sum + impressions;
    }, 0);
    
    const totalClicks = data.reduce((sum, item) => {
      const clicks = ensureNumber(item.clicks);
      return sum + clicks;
    }, 0);
    
    const totalConversions = data.reduce((sum, item) => {
      const conversions = ensureNumber(item.conversions);
      return sum + conversions;
    }, 0);
    
    const totalCost = data.reduce((sum, item) => {
      const cost = ensureNumber(item.cost);
      return sum + cost;
    }, 0);
    
    const totalRevenue = data.reduce((sum, item) => {
      const revenue = ensureNumber(item.revenue);
      return sum + revenue;
    }, 0);
    
    // Calcular métricas derivadas
    const overallCTR = totalImpressions > 0 
      ? (totalClicks / totalImpressions) * 100 
      : 0;
    
    // Calcular ROI agregado o promedio según sea necesario
    let averageROI;
    
    if (totalCost > 0) {
      // Cálculo directo del ROI agregado
      averageROI = ((totalRevenue - totalCost) / totalCost) * 100;
    } else {
      // Alternativa: promedio de ROIs individuales, filtrando valores no válidos
      const roiValues = data
        .filter(item => {
          const roi = typeof item.roi === 'number' ? item.roi : 
                    typeof item.roi === 'string' ? parseFloat(item.roi) : NaN;
          return !isNaN(roi) && typeof roi === 'number';
        })
        .map(item => typeof item.roi === 'number' ? item.roi : parseFloat(item.roi));
      
      if (roiValues.length > 0) {
        averageROI = roiValues.reduce((sum, roi) => sum + roi, 0) / roiValues.length;
      } else {
        averageROI = 0;
      }
    }
    
    // Log de depuración
    console.log("Métricas calculadas:", {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalCost,
      totalRevenue,
      overallCTR,
      averageROI
    });
    
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const mentorUrl = 'https://chatgpt.com/g/g-67e28bab27048191943a7bd55b84f667-mentor-de-campanas-coonic';
  
  const handleExportPDF = () => {
    try {
      const exportButtonElement = document.querySelector('button[data-export-pdf="true"]');
      if (exportButtonElement instanceof HTMLButtonElement) {
        exportButtonElement.click();
      } else {
        console.error("Export button element not found or not a button");
        toast.error("No se pudo generar el PDF. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error triggering PDF export:", error);
      toast.error("Error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <img 
          src="/lovable-uploads/51309a7b-a98d-4a9f-a6b1-343b96146037.png" 
          alt="Coonic Logo" 
          className="h-12" 
        />
        <h2 className="text-2xl font-bold">Dashboard de Marketing</h2>
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
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-5">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">¿Quieres guardar este análisis?</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Exporta el informe en formato PDF para revisarlo más tarde o compartirlo con tu equipo.
            </p>
            <Button 
              onClick={handleExportPDF}
              className="bg-primary hover:bg-primary/80 text-white shadow-md px-6 py-6 font-medium"
              size="lg"
            >
              <FileText className="mr-2 h-5 w-5" /> Exportar informe como PDF
            </Button>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-[#FFF9E6]">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17.5C15.5899 17.5 18.5 14.5899 18.5 11C18.5 7.41015 15.5899 4.5 12 4.5C8.41015 4.5 5.5 7.41015 5.5 11C5.5 14.5899 8.41015 17.5 12 17.5Z" stroke="#D52B1E" strokeWidth="1.5"/>
                <path d="M7 13.5L7.5 12M17 13.5L16.5 12M11 7.5L9.5 9.5M13 7.5L14.5 9.5" stroke="#D52B1E" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8.5 17.5L7.5 21.5M15.5 17.5L16.5 21.5" stroke="#D52B1E" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-2">¿Tienes dudas con tu informe?</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Habla con tu mentor y te ayudará a interpretar los resultados paso a paso.
            </p>
            <Button 
              onClick={() => window.open(mentorUrl, '_blank')}
              className="bg-primary hover:bg-primary/80 text-white shadow-md px-6 py-6 font-medium"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> 🧠💬 Habla con tu mentor
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden">
        <ExportButton data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
