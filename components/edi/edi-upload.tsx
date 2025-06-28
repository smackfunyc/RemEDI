'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { parseEDIFile } from '@/lib/edi-parser';
import { EDIFile } from '@/types/edi';
import { toast } from 'sonner';

interface EDIUploadProps {
  onFileProcessed: (ediFile: EDIFile) => void;
}

export function EDIUpload({ onFileProcessed }: EDIUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().includes('edi') && !file.name.toLowerCase().includes('x12')) {
      toast.error('Please select a valid EDI file (.edi, .x12, or .txt)');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const fileContent = await file.text();
      const parsedFile = parseEDIFile(fileContent, file.name);

      const ediFile: EDIFile = {
        id: `edi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        uploadedBy: 'Current User',
        status: parsedFile.status as any || 'uploaded',
        transactionType: parsedFile.transactionType || 'Unknown',
        segments: parsedFile.segments || [],
        validationResults: parsedFile.validationResults || [],
        communicationLog: [{
          id: `comm_${Date.now()}`,
          userId: 'current_user',
          userName: 'System',
          userRole: 'System',
          message: `EDI file "${file.name}" uploaded and processed successfully`,
          timestamp: new Date(),
          type: 'system'
        }]
      };

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onFileProcessed(ediFile);
        setIsProcessing(false);
        setUploadProgress(0);
        
        const errorCount = ediFile.validationResults.filter(v => v.type === 'error').length;
        if (errorCount > 0) {
          toast.error(`File processed with ${errorCount} errors`);
        } else {
          toast.success('EDI file processed successfully');
        }
      }, 500);

    } catch (error) {
      setIsProcessing(false);
      setUploadProgress(0);
      toast.error('Failed to process EDI file');
      console.error('EDI processing error:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload EDI File</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Processing EDI file...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your EDI file here</p>
                <p className="text-sm text-muted-foreground">
                  Supports .edi, .x12, and .txt files
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".edi,.x12,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="secondary" className="text-xs">
                  Purchase Orders (850)
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Ship Notices (856)
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Invoices (810)
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Acknowledgments (997)
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}