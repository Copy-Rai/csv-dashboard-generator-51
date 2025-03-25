import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import { Toaster } from "@/components/ui/sonner";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const [data, setData] = useState<any[] | null>(null);

  const handleFileUploaded = (processedData: any[]) => {
    setData(processedData);
    console.log('Data processed:', processedData);
  };

  const mentorUrl = 'https://chatgpt.com/g/g-67e26ff502f881919b802f3ff8a77605-mentor-de-campanas-genia';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Toaster position="top-right" />
      
      <header className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full flex items-center justify-center md:justify-start mb-6">
            <img 
              src="/lovable-uploads/1be870f7-11db-4f87-979c-e2d428cbe6c0.png" 
              alt="Coonic Logo" 
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
                      <span className="text-primary mr-2">•</span>
                      <span><strong>platform</strong> (Facebook, Instagram, Google, etc.)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>campaign_name</strong> (opcional)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>date</strong> (opcional)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Métricas de desempeño</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>impressions</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>clicks</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>conversions</strong></span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Métricas financieras</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>cost</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span><strong>revenue</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-[#FFF9E6] p-6 rounded-lg border border-primary/30 mb-10">
                <p className="flex items-start">
                  <strong className="font-semibold mr-2">Consejo:</strong>
                  <span>Puedes exportar estos datos directamente desde las plataformas de publicidad como Google Ads, Facebook Ads, etc. o combinarlos en una hoja de cálculo.</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <Dashboard data={data} />
        )}
      </main>
      
      {/* Footer with Coonic branding */}
      {!data && (
        <footer className="w-full py-4 text-center border-t border-gray-200 mt-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/1be870f7-11db-4f87-979c-e2d428cbe6c0.png" 
                alt="Coonic Logo" 
                className="h-8 mr-2" 
              />
              <span className="text-sm text-muted-foreground">
                © 2023 Coonic Communication Designers. Todos los derechos reservados.
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
