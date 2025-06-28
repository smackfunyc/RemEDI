'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EDIFile, EDISegment, ValidationResult } from '@/types/edi';
import { FileText, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronRight, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { generateEDISummary } from '@/lib/edi-parser';

interface EDIViewerProps {
  ediFile: EDIFile;
  onSendToRecipient: () => void;
  canSend: boolean;
}

export function EDIViewer({ ediFile, onSendToRecipient, canSend }: EDIViewerProps) {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  const toggleSegment = (segmentId: string) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(segmentId)) {
      newExpanded.delete(segmentId);
    } else {
      newExpanded.add(segmentId);
    }
    setExpandedSegments(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'sent':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  const getValidationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  const errorCount = ediFile.validationResults.filter(v => v.type === 'error').length;
  const warningCount = ediFile.validationResults.filter(v => v.type === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{ediFile.fileName}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={`border ${getStatusColor(ediFile.status)}`}>
                {ediFile.status.toUpperCase()}
              </Badge>
              {canSend && ediFile.status === 'validated' && (
                <Button onClick={onSendToRecipient} size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send to Recipient
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <p className="font-medium">{ediFile.transactionType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="font-medium">{(ediFile.fileSize / 1024).toFixed(2)} KB</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Uploaded</p>
              <p className="font-medium">{formatDistanceToNow(ediFile.uploadedAt, { addSuffix: true })}</p>
            </div>
          </div>

          {(errorCount > 0 || warningCount > 0) && (
            <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium">{errorCount} Errors</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">{warningCount} Warnings</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="segments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segments">Segments ({ediFile.segments.length})</TabsTrigger>
          <TabsTrigger value="validation">Validation ({ediFile.validationResults.length})</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {ediFile.segments.map((segment) => (
                <Card key={segment.id} className={`${!segment.isValid ? 'border-red-500/30' : ''}`}>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="w-full"
                      onClick={() => toggleSegment(segment.id)}
                    >
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <div className="flex items-center space-x-3">
                          {expandedSegments.has(segment.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Badge variant="outline" className="font-mono">
                            {segment.tag}
                          </Badge>
                          <span className="text-sm">{segment.description}</span>
                          {!segment.isValid && (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {segment.elements.length} elements
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-2">
                        <div className="grid grid-cols-1 gap-2">
                          {segment.elements.map((element, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <Badge variant="outline" className="text-xs w-12 justify-center">
                                {index + 1}
                              </Badge>
                              <code className="bg-muted px-2 py-1 rounded text-xs flex-1">
                                {element || '<empty>'}
                              </code>
                            </div>
                          ))}
                        </div>
                        {segment.errors && segment.errors.length > 0 && (
                          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
                            <p className="text-sm font-medium text-red-400 mb-1">Errors:</p>
                            {segment.errors.map((error, index) => (
                              <p key={index} className="text-xs text-red-400">• {error}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {ediFile.validationResults.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-sm text-muted-foreground">No validation issues found</p>
                </div>
              ) : (
                ediFile.validationResults.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {getValidationIcon(result.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {result.segment}
                            </Badge>
                            {result.element && (
                              <Badge variant="secondary" className="text-xs">
                                Element {result.element}
                              </Badge>
                            )}
                            <Badge 
                              className={`text-xs ${
                                result.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                result.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-blue-500/10 text-blue-400'
                              }`}
                            >
                              {result.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm">{result.message}</p>
                          {result.suggestion && (
                            <p className="text-xs text-muted-foreground">
                              💡 {result.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded">
                {generateEDISummary(ediFile)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}