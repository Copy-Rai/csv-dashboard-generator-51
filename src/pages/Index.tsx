
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import { Toaster } from "@/components/ui/sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, FileText, Brain } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const [data, setData] = useState<any[] | null>(null);

  const handleFileUploaded = (processedData: any[]) => {
    setData(processedData);
    console.log('Data processed:', processedData);
  };

  const mentorUrl = 'https://chatgpt.com/g/g-67e26ff502f881919b802f3ff8a77605-mentor-de-campanas-genia';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Toaster position="top-right" />
      
      <header className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full flex items-center justify-center md:justify-start mb-6">
            <img 
              src="/lovable-uploads/845ba33d-1143-42dd-bd16-75d19bdbff27.png" 
              alt="GenIA Logo" 
              className="h-16 md:h-20 animate-fade-in" 
            />
          </div>
          
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
            Marketing Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight animate-fade-in text-center">
            Dashboard de campañas de marketing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in text-center">
            Sube tus datos y obtén un análisis automático de tus campañas
          </p>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 pb-16">
        {!data ? (
          <>
            {/* File Upload Section */}
            <FileUpload onFileUploaded={handleFileUploaded} />
            
            {/* Tooltip for CSV requirements */}
            <div className="max-w-2xl mx-auto -mt-2 mb-10 text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground cursor-help">
                      <HelpCircle className="h-4 w-4 mr-1" />
                      ¿Qué información debe contener mi CSV?
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Acepta archivos CSV con métricas de campañas: impresiones, clics, conversiones, coste, ingresos...</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* "How to prepare your data" section - Redesigned */}
            <div className="w-full max-w-6xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-6">¿Cómo preparar tus datos?</h2>
              
              <p className="text-lg mb-8">
                Tu archivo CSV debe contener las siguientes columnas:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Identificadores</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>platform</strong> (Facebook, Instagram, Google, etc.)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>campaign_name</strong> (opcional)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>date</strong> (opcional)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Métricas de desempeño</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>impressions</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>clicks</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>conversions</strong></span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Métricas financieras</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>cost</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#FFC400] mr-2">•</span>
                      <span><strong>revenue</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-[#FFF9E6] p-6 rounded-lg border border-[#FFC400]/30 mb-10">
                <p className="flex items-start">
                  <strong className="font-semibold mr-2">Consejo:</strong>
                  <span>Puedes exportar estos datos directamente desde las plataformas de publicidad como Google Ads, Facebook Ads, etc. o combinarlos en una hoja de cálculo.</span>
                </p>
              </div>
            </div>
            
            {/* Action cards - Export and Mentor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
              {/* Export PDF Card */}
              <Card className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FFC400]/20 flex items-center justify-center mb-5">
                    <FileText className="h-8 w-8 text-[#FFC400]" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 font-display">¿Quieres guardar este análisis?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Exporta el informe en formato PDF para revisarlo más tarde o compartirlo con tu equipo.
                  </p>
                  <Button 
                    onClick={() => window.open("#exportar-pdf", "_self")}
                    className="bg-[#FFC400] hover:bg-[#E5B200] text-black shadow-md px-6 py-6 w-full font-medium"
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" /> Exportar informe como PDF
                  </Button>
                </CardContent>
              </Card>
              
              {/* Mentor Card */}
              <Card className="rounded-xl border border-gray-200 shadow-sm bg-[#FFF9E6]">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FFC400]/20 flex items-center justify-center mb-5">
                    <Brain className="h-8 w-8 text-[#FFC400]" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 font-display">¿Tienes dudas con tu informe?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Habla con tu mentor GenIA y te ayudará a interpretar los resultados paso a paso.
                  </p>
                  <Button 
                    onClick={() => window.open(mentorUrl, '_blank')}
                    className="bg-[#FFC400] hover:bg-[#E5B200] text-black shadow-md px-6 py-6 w-full font-medium"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> 🧠 Habla con tu mentor GenIA
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Dashboard data={data} />
        )}
      </main>
      
      {/* Footer with GenIA branding */}
      {!data && (
        <footer className="w-full py-4 text-center border-t border-gray-200 mt-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/845ba33d-1143-42dd-bd16-75d19bdbff27.png" 
                alt="GenIA Logo" 
                className="h-8 mr-2" 
              />
              <span className="text-sm text-muted-foreground">
                © 2023 GenIA Communication Designers. Todos los derechos reservados.
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
