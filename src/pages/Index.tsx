
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import { Toaster } from "@/components/ui/sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

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
            <Card className="border border-[#FFC400]/30 bg-[#FFC400]/5 shadow-md max-w-3xl mx-auto mb-10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      🧠 <span>¿Tienes dudas con tu informe?</span>
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Habla con tu mentor GenIA y te ayudará a interpretar los resultados paso a paso.
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.open(mentorUrl, '_blank')}
                    className="bg-[#FFC400] hover:bg-[#E5B200] text-black shadow-md px-5 py-6 mt-2 md:mt-0"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> 🧠 Habla con tu mentor GenIA
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <FileUpload onFileUploaded={handleFileUploaded} />
          </>
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
            
            <div className="mt-12">
              <Button 
                onClick={() => window.open(mentorUrl, '_blank')}
                className="bg-[#FFC400] hover:bg-[#E5B200] text-black shadow-md px-5 py-6"
                size="lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" /> 🧠 Habla con tu mentor GenIA
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
