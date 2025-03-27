import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { processCSV, cleanCSVData } from "@/utils/dataProcessing";

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
        let data;
        
        try {
          // Try using our enhanced dataProcessing utility
          data = processCSV(text);
          
          // Clean data further if needed
          data = cleanCSVData(data);
          
        } catch (processingError) {
          console.error("Error with enhanced processing:", processingError);
          toast.error("Error al procesar el archivo. Formato no compatible.");
          setIsProcessing(false);
          return;
        }
        
        if (data && data.length > 0) {
          // Log the processed data
          console.log("Processed data:", data);
          
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
