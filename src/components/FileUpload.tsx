
import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { processCSV, cleanCSVData } from "@/utils/dataProcessing";

interface FileUploadProps {
  onFileUploaded: (data: any[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const resetState = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    setIsLoading(false);
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🔄 INICIO PROCESAMIENTO DE ARCHIVO - VERSIÓN: 4.0.0");
      console.log(`📁 Archivo recibido: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("No se pudo leer el archivo");
          }
          
          const csvContent = e.target.result as string;
          console.log(`📄 Contenido CSV cargado: ${csvContent.length} caracteres`);
          
          // Verify the first few lines for debugging
          const previewLines = csvContent.split('\n').slice(0, 5);
          previewLines.forEach((line, idx) => {
            console.log(`🔎 Línea ${idx}: "${line.substring(0, 120)}..."`);
          });
          
          // Process the CSV data
          const processedData = processCSV(csvContent);
          console.log(`✅ Datos procesados: ${processedData.length} registros`);
          
          // Verify impressions in raw data
          const rawImpressionTotal = processedData.reduce((sum, item) => {
            return sum + (typeof item.impressions === 'number' ? item.impressions : 0);
          }, 0);
          console.log(`📊 TOTAL IMPRESIONES ANTES DE LIMPIEZA: ${rawImpressionTotal}`);
          
          // Clean the data
          const cleanedData = cleanCSVData(processedData);
          console.log(`✅ Datos limpiados: ${cleanedData.length} registros`);
          
          // Verify individual rows with high impressions
          let highImpressionsCount = 0;
          let topImpressionsTotal = 0;
          
          cleanedData
            .filter(item => item.impressions > 10000)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 10)
            .forEach((item, idx) => {
              console.log(`🔍 Registro con muchas impresiones #${idx+1}: ${item.impressions} - ${item.campaign_name || 'Sin nombre'}`);
              highImpressionsCount++;
              topImpressionsTotal += item.impressions;
            });
          
          console.log(`🔍 Se encontraron ${highImpressionsCount} registros con más de 10,000 impresiones`);
          console.log(`📊 Impresiones en top 10 campañas: ${topImpressionsTotal}`);
          
          // Verify final impression total
          const totalImpressions = cleanedData.reduce((sum, item) => sum + (item.impressions || 0), 0);
          console.log(`📊 TOTAL IMPRESIONES EN DATOS FINALES: ${totalImpressions}`);
          
          // Pass the data to the parent component
          onFileUploaded(cleanedData);
          
          // Show success message with platform detection
          const platforms = Array.from(new Set(cleanedData.map(item => item.platform))).filter(p => p !== "Unknown");
          
          let platformMessage = "";
          if (platforms.length > 0) {
            platformMessage = `Plataformas detectadas: ${platforms.join(', ')}`;
          }
          
          toast.success(`Archivo procesado correctamente: ${cleanedData.length} registros`, {
            description: `Se han detectado ${totalImpressions.toLocaleString()} impresiones en total. ${platformMessage}`
          });
          
          resetState();
        } catch (error) {
          console.error("❌ Error procesando CSV:", error);
          setError(error instanceof Error ? error.message : "Error desconocido procesando el archivo");
          toast.error("Error al procesar el archivo", {
            description: error instanceof Error ? error.message : "Revisa que el formato sea correcto"
          });
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        console.error("❌ Error leyendo el archivo");
        setError("Error al leer el archivo");
        toast.error("Error al leer el archivo", {
          description: "No se pudo acceder al contenido del archivo."
        });
        setIsLoading(false);
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error("❌ Error general:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      toast.error("Error al procesar el archivo", {
        description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado"
      });
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const { files } = e.dataTransfer;
    
    if (files.length) {
      const file = files[0];
      
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt') && file.type !== 'text/csv' && file.type !== 'text/plain') {
        setError("Por favor, sube un archivo CSV válido");
        toast.error("Formato de archivo no válido", {
          description: "Solo se aceptan archivos CSV o TXT con formato CSV."
        });
        return;
      }
      
      await processFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    
    if (files && files.length) {
      await processFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <Card
        className={`
          relative border-2 border-dashed rounded-lg p-8
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}
          transition-all duration-300 ease-in-out
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.txt"
          onChange={handleFileInputChange}
        />
        
        <div className="flex flex-col items-center justify-center min-h-52 space-y-5 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 transition-all duration-300 ${isDragging ? 'bg-primary/20 scale-110' : ''}`}>
            <UploadCloud className={`h-8 w-8 text-primary ${isDragging ? 'scale-110' : ''}`} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Arrastra tu archivo CSV o haz clic para subir</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Soportamos archivos de Facebook Ads, Google Ads, LinkedIn, TikTok, X y más
            </p>
          </div>
          
          <Button
            variant="default"
            size="lg"
            className="relative overflow-hidden"
            onClick={handleButtonClick}
            disabled={isLoading}
          >
            <span className={`transition-all duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <FileType className="mr-2 h-5 w-5" />
              Seleccionar archivo CSV
            </span>
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              </div>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Formatos soportados: CSV (detectamos automáticamente el delimitador y formato)
          </p>
        </div>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
