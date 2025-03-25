
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('es-ES');
  };

  const handleExport = async () => {
    toast.info("Preparando el informe para exportación...");
    
    try {
      // Crear un nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;
      
      // Título y fecha
      pdf.setFontSize(20);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Informe de Campañas de Marketing", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Fecha: ${formatDate()}`, pageWidth / 2, yPosition, { align: "center" });
      
      // Resumen numérico
      yPosition += 20;
      pdf.setFontSize(16);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Resumen de métricas", 14, yPosition);
      
      // Calcular métricas para el resumen
      const totalImpressions = data.reduce((sum, item) => sum + (parseFloat(item.impressions) || 0), 0);
      const totalClicks = data.reduce((sum, item) => sum + (parseFloat(item.clicks) || 0), 0);
      const totalConversions = data.reduce((sum, item) => sum + (parseFloat(item.conversions) || 0), 0);
      const totalCost = data.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
      const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
      
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
      
      // Formatear números para el resumen
      const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(Math.round(num));
      const formatPercent = (num: number) => `${num.toFixed(2)}%`;
      const formatCurrency = (num: number) => new Intl.NumberFormat('es-ES', {
        style: 'currency', currency: 'EUR', minimumFractionDigits: 0
      }).format(num);
      
      // Añadir métricas al PDF
      yPosition += 10;
      const metrics = [
        `Impresiones totales: ${formatNumber(totalImpressions)}`,
        `Clics totales: ${formatNumber(totalClicks)}`,
        `Conversiones totales: ${formatNumber(totalConversions)}`,
        `CTR promedio: ${formatPercent(ctr)}`,
        `Inversión total: ${formatCurrency(totalCost)}`,
        `Ingresos totales: ${formatCurrency(totalRevenue)}`,
        `ROI promedio: ${formatPercent(roi)}`
      ];
      
      metrics.forEach(metric => {
        yPosition += 8;
        pdf.setFontSize(11);
        pdf.text(metric, 20, yPosition);
      });
      
      // Capturar gráficos desde la página
      yPosition += 20;
      pdf.setFontSize(16);
      pdf.text("Gráficos por plataforma", 14, yPosition);
      
      // Capturar los gráficos del DOM
      const chartElements = document.querySelectorAll(".card-glow");
      
      if (chartElements.length > 0) {
        let chartsProcessed = 0;
        
        for (let i = 0; i < chartElements.length && i < 4; i++) {
          try {
            // Nueva página si no hay suficiente espacio
            if (yPosition > 200) {
              pdf.addPage();
              yPosition = 20;
            }
            
            const canvas = await html2canvas(chartElements[i] as HTMLElement, {
              scale: 2,
              logging: false,
              useCORS: true,
              allowTaint: true
            });
            
            // Ajustar el tamaño de la imagen al PDF
            const imgWidth = pageWidth - 30;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            yPosition += 10;
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
            
            chartsProcessed++;
          } catch (error) {
            console.error("Error al capturar gráfico:", error);
          }
        }
        
        if (chartsProcessed === 0) {
          yPosition += 8;
          pdf.setFontSize(11);
          pdf.text("No se pudieron generar los gráficos para el informe.", 20, yPosition);
        }
      } else {
        yPosition += 8;
        pdf.setFontSize(11);
        pdf.text("No hay gráficos disponibles para mostrar.", 20, yPosition);
      }
      
      // Capturar insights del mentor
      yPosition += 15;
      // Nueva página si no hay suficiente espacio
      if (yPosition > 210) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.text("Insights del mentor de campaña 🧠", 14, yPosition);
      yPosition += 10;
      
      const mentorSection = document.querySelector(".mentor-section");
      if (mentorSection) {
        try {
          const insightCards = mentorSection.querySelectorAll(".insight-card");
          
          if (insightCards.length > 0) {
            for (let i = 0; i < insightCards.length && i < 6; i++) {
              try {
                // Nueva página si no hay suficiente espacio
                if (yPosition > 240) {
                  pdf.addPage();
                  yPosition = 20;
                }
                
                const canvas = await html2canvas(insightCards[i] as HTMLElement, {
                  scale: 2,
                  logging: false,
                  useCORS: true,
                  allowTaint: true
                });
                
                // Ajustar el tamaño de la imagen al PDF
                const imgWidth = pageWidth - 30;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
              } catch (error) {
                console.error("Error al capturar insight:", error);
              }
            }
          } else {
            pdf.setFontSize(11);
            pdf.text("No hay insights disponibles para mostrar.", 20, yPosition);
          }
        } catch (error) {
          console.error("Error al procesar insights:", error);
          pdf.setFontSize(11);
          pdf.text("No se pudieron generar los insights para el informe.", 20, yPosition);
        }
      } else {
        pdf.setFontSize(11);
        pdf.text("No hay insights disponibles para mostrar.", 20, yPosition);
      }
      
      // Guardar el PDF
      pdf.save(`informe_marketing_${formatDate().replace(/\//g, '-')}.pdf`);
      toast.success("Informe exportado con éxito");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("Error al generar el informe. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <Button 
        onClick={handleExport} 
        className="shadow-lg"
        size="lg"
      >
        <Download className="mr-2 h-4 w-4" /> Exportar informe
      </Button>
    </div>
  );
};

export default ExportButton;

