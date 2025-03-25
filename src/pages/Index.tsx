
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const [data, setData] = useState<any[] | null>(null);

  const handleFileUploaded = (processedData: any[]) => {
    setData(processedData);
    console.log('Data processed:', processedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Toaster position="top-right" />
      
      <header className="w-full max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
          Marketing Analytics
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight animate-fade-in">
          Dashboard de campañas de marketing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
          Sube tus datos y obtén un análisis automático de tus campañas
        </p>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 pb-16">
        {!data ? (
          <FileUpload onFileUploaded={handleFileUploaded} />
        ) : (
          <Dashboard data={data} />
        )}
      </main>
      
      {!data && (
        <footer className="w-full max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="p-8 rounded-xl bg-white/50 backdrop-blur-sm border border-border">
            <h2 className="text-xl font-medium mb-4">¿Cómo preparar tus datos?</h2>
            <p className="text-muted-foreground mb-6">
              Tu archivo CSV debe contener las siguientes columnas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h3 className="font-medium mb-2">Identificadores</h3>
                <ul className="text-sm text-muted-foreground text-left list-disc pl-5">
                  <li>platform (Facebook, Instagram, Google, etc.)</li>
                  <li>campaign_name (opcional)</li>
                  <li>date (opcional)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h3 className="font-medium mb-2">Métricas de desempeño</h3>
                <ul className="text-sm text-muted-foreground text-left list-disc pl-5">
                  <li>impressions</li>
                  <li>clicks</li>
                  <li>conversions</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h3 className="font-medium mb-2">Métricas financieras</h3>
                <ul className="text-sm text-muted-foreground text-left list-disc pl-5">
                  <li>cost</li>
                  <li>revenue</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
