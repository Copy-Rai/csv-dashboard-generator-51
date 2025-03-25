
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (data: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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

  const processCSV = (text: string) => {
    try {
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
      
      // Map standard column names to possible variations
      const columnMap = {
        platform: ['platform', 'plataforma', 'red', 'red social', 'source', 'origen'],
        impressions: ['impressions', 'impresiones', 'impr', 'impres', 'views', 'vistas'],
        clicks: ['clicks', 'clics', 'cliques', 'click', 'clic'],
        conversions: ['conversions', 'conversiones', 'conv', 'converts'],
        cost: ['cost', 'costo', 'coste', 'gasto', 'spend'],
        revenue: ['revenue', 'ingresos', 'revenue', 'income', 'ganancia'],
        roi: ['roi', 'retorno', 'return'],
        ctr: ['ctr', 'ratio de clics', 'click ratio']
      };
      
      // Find index for each relevant column
      const columnIndices: Record<string, number> = {};
      
      for (const [key, variations] of Object.entries(columnMap)) {
        const index = headers.findIndex(header => 
          variations.some(variation => header.includes(variation))
        );
        if (index !== -1) {
          columnIndices[key] = index;
        }
      }
      
      // If essential columns are missing, show an error
      const essentialColumns = ['platform', 'impressions', 'clicks'];
      const missingColumns = essentialColumns.filter(col => columnIndices[col] === undefined);
      
      if (missingColumns.length > 0) {
        toast.error(`Columnas faltantes: ${missingColumns.join(', ')}. Por favor revisa tu archivo CSV.`);
        return null;
      }
      
      const results = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(value => value.trim());
        const entry: Record<string, string | number> = {};
        
        // Set each field based on the found indices
        if (columnIndices.platform !== undefined)
          entry.platform = values[columnIndices.platform];
        
        if (columnIndices.impressions !== undefined) {
          const value = values[columnIndices.impressions];
          entry.impressions = parseFloat(value) || 0;
        } else {
          entry.impressions = 0;
        }
        
        if (columnIndices.clicks !== undefined) {
          const value = values[columnIndices.clicks];
          entry.clicks = parseFloat(value) || 0;
        } else {
          entry.clicks = 0;
        }
        
        if (columnIndices.conversions !== undefined) {
          const value = values[columnIndices.conversions];
          entry.conversions = parseFloat(value) || 0;
        } else {
          entry.conversions = 0;
        }
        
        if (columnIndices.cost !== undefined) {
          const value = values[columnIndices.cost];
          entry.cost = parseFloat(value) || 0;
        } else {
          entry.cost = 0;
        }
        
        if (columnIndices.revenue !== undefined) {
          const value = values[columnIndices.revenue];
          entry.revenue = parseFloat(value) || 0;
        } else {
          entry.revenue = 0;
        }
        
        if (columnIndices.roi !== undefined) {
          const value = values[columnIndices.roi];
          entry.roi = parseFloat(value) || 0;
        } else if (entry.cost > 0) {
          // Calculate ROI if not provided but we have cost and revenue
          entry.roi = ((entry.revenue as number - entry.cost as number) / entry.cost as number) * 100;
        } else {
          entry.roi = 0;
        }
        
        if (columnIndices.ctr !== undefined) {
          const value = values[columnIndices.ctr];
          entry.ctr = parseFloat(value) || 0;
        } else if (entry.impressions > 0) {
          // Calculate CTR if not provided but we have impressions and clicks
          entry.ctr = ((entry.clicks as number) / (entry.impressions as number)) * 100;
        } else {
          entry.ctr = 0;
        }
        
        results.push(entry);
      }
      
      return results;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Error al procesar el archivo CSV. Por favor revisa el formato.");
      return null;
    }
  };

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
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error("Por favor sube un archivo CSV");
      return;
    }
    
    setFileName(file.name);
    setIsProcessing(true);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = processCSV(text);
        
        if (data && data.length > 0) {
          setTimeout(() => {
            toast.success("¡Archivo CSV procesado correctamente!");
            onFileUploaded(data);
            setIsProcessing(false);
          }, 800); // Small delay for visual feedback
        } else {
          throw new Error("Error al procesar los datos o conjunto de datos vacío");
        }
      } catch (error) {
        console.error("Error al leer el archivo:", error);
        toast.error("Error al procesar el archivo. Por favor revisa el formato.");
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error al leer el archivo");
      setIsProcessing(false);
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
            <p className="text-lg font-medium">Processing file...</p>
            <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
          </div>
        ) : fileName ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">File ready!</p>
            <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setFileName(null);
              }}
            >
              Choose different file
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-secondary text-primary mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium mb-1">Drag and drop your CSV file here</h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv"
              onChange={handleFileInput}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <FileText className="w-4 h-4 mr-2" />
                  Browse files
                </span>
              </Button>
            </label>
            <div className="mt-4 px-4 py-2 bg-muted rounded-md flex items-center max-w-md">
              <AlertCircle className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                File should be in CSV format with columns for platform, impressions, clicks, conversions, cost, and revenue
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
