import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle2, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { processCSV, cleanCSVData } from "@/utils/dataProcessing";

interface FileUploadProps {
  onFileUploaded: (data: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [hasWarnings, setHasWarnings] = useState(false);
  const [processingStats, setProcessingStats] = useState<{
    total: number;
    active: number;
    completed: number;
    emptyData: number;
  } | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(csv|txt|tsv|xls|xlsx)$/i)) {
      toast.error("Por favor sube un archivo CSV o similares (TXT, TSV, XLS)");
      return;
    }
    
    setFileName(file.name);
    setIsProcessing(true);
    setProcessingStatus("Detectando formato del archivo...");
    setHasWarnings(false);
    setProcessingStats(null);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        setProcessingStatus("Identificando delimitadores y columnas...");
        
        console.log("Primeros 500 caracteres del archivo:", text.substring(0, 500));
        
        let data;
        
        try {
          setProcessingStatus("Procesando formato europeo (punto y coma como delimitador, coma como decimal)...");
          data = processCSV(text);
          
          setProcessingStatus("Limpiando y normalizando datos...");
          data = cleanCSVData(data);
          
          if (!data || data.length === 0) {
            toast.error("No se pudieron extraer datos del archivo. Revisa el formato.");
            setIsProcessing(false);
            return;
          }
          
          const stats = {
            total: data.length,
            active: data.filter(item => 
              item.campaign_name?.toLowerCase().includes('active')).length,
            completed: data.filter(item => 
              item.campaign_name?.toLowerCase().includes('completed') || 
              item.campaign_name?.toLowerCase().includes('recently_completed')).length,
            emptyData: data.filter(item => 
              (item.impressions === 0 && item.clicks === 0) || 
              (item.cost === 0 && item.revenue === 0)).length
          };
          
          setProcessingStats(stats);
          
          if (stats.emptyData > 0) {
            setHasWarnings(true);
          }
          
          console.log("Datos procesados (primeros 3 registros):", data.slice(0, 3));
          console.log("Total de registros procesados:", data.length);
          
        } catch (processingError) {
          console.error("Error con el procesamiento:", processingError);
          toast.error("Error al procesar el archivo. El formato parece no ser compatible.");
          setIsProcessing(false);
          return;
        }
        
        if (data && data.length > 0) {
          console.log("Muestra de datos procesados:", data.slice(0, 3));
          
          setProcessingStatus("Generando insights y visualizaciones...");
          
          setTimeout(() => {
            if (hasWarnings) {
              toast.success(`Archivo procesado con ${processingStats?.emptyData || 0} filas con datos incompletos.`);
            } else {
              toast.success(`¡Archivo procesado correctamente! ${data.length} registros analizados.`);
            }
            onFileUploaded(data);
            setIsProcessing(false);
            setProcessingStatus(null);
          }, 800);
        } else {
          throw new Error("Error al procesar los datos o conjunto de datos vacío");
        }
      } catch (error) {
        console.error("Error al leer el archivo:", error);
        toast.error("Error al procesar el archivo. Por favor revisa el formato.");
        setIsProcessing(false);
        setProcessingStatus(null);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error al leer el archivo");
      setIsProcessing(false);
      setProcessingStatus(null);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 animate-fade-in">
      <div
        className={`upload-dropzone ${isDragging ? 'upload-dropzone-active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleFileDrop}
      >
        {isProcessing ? (
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">{processingStatus || "Procesando archivo..."}</p>
            <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
          </div>
        ) : fileName ? (
          <div className="text-center">
            {hasWarnings ? (
              <FileWarning className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            ) : (
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            )}
            <p className="text-lg font-medium">
              {hasWarnings ? "Archivo procesado con advertencias" : "¡Archivo listo!"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
            
            {processingStats && (
              <div className="mt-4 bg-muted/50 rounded-lg p-4 text-sm">
                <p><strong>Registros procesados:</strong> {processingStats.total}</p>
                <p><strong>Campañas activas:</strong> {processingStats.active}</p>
                <p><strong>Campañas completadas:</strong> {processingStats.completed}</p>
                {hasWarnings && (
                  <p className="text-amber-600"><strong>Filas con datos incompletos:</strong> {processingStats.emptyData}</p>
                )}
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setFileName(null);
                setHasWarnings(false);
                setProcessingStats(null);
              }}
            >
              Elegir un archivo diferente
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-secondary text-primary mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium mb-1">Arrastra y suelta tu archivo CSV aquí</h3>
            <p className="text-sm text-muted-foreground mb-4">o haz clic para buscar archivos</p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.txt,.tsv,.xls,.xlsx"
              onChange={handleFileInput}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <FileText className="w-4 h-4 mr-2" />
                  Buscar archivos
                </span>
              </Button>
            </label>
            <div className="mt-4 px-4 py-2 bg-muted rounded-md flex items-center max-w-md">
              <AlertCircle className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Compatible con formato europeo (punto y coma como delimitador, coma como decimal). El sistema incluirá todas las filas con datos, independientemente del estado de las campañas.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
