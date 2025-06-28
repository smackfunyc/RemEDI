'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EDIUpload } from '@/components/edi/edi-upload';
import { EDIViewer } from '@/components/edi/edi-viewer';
import { RecipientSelector } from '@/components/edi/recipient-selector';
import { CommunicationPanel } from '@/components/edi/communication-panel';
import { EDIFile, Recipient, CommunicationEntry } from '@/types/edi';
import { toast } from 'sonner';

export default function EDIPage() {
  const [currentEDIFile, setCurrentEDIFile] = useState<EDIFile | null>(null);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [currentView, setCurrentView] = useState<'upload' | 'viewer' | 'recipient'>('upload');

  const handleFileProcessed = (ediFile: EDIFile) => {
    setCurrentEDIFile(ediFile);
    setCurrentView('viewer');
  };

  const handleSendToRecipient = () => {
    setShowRecipientSelector(true);
    setCurrentView('recipient');
  };

  const handleRecipientSelected = (recipient: Recipient, message: string) => {
    if (!currentEDIFile) return;

    // Build communication log entries step by step
    const newCommunicationLog = [...currentEDIFile.communicationLog];
    
    // Add system message
    newCommunicationLog.push({
      id: `comm_${Date.now()}`,
      userId: 'current_user',
      userName: 'System',
      userRole: 'System',
      message: `EDI file sent to ${recipient.name} (${recipient.company})`,
      timestamp: new Date(),
      type: 'system'
    });

    // Add user message if provided
    if (message) {
      newCommunicationLog.push({
        id: `comm_${Date.now() + 1}`,
        userId: 'current_user',
        userName: 'You',
        userRole: '4PL Admin',
        message: message,
        timestamp: new Date(),
        type: 'comment'
      });
    }

    const updatedFile: EDIFile = {
      ...currentEDIFile,
      status: 'sent',
      recipientId: recipient.id,
      recipientName: recipient.name,
      sentAt: new Date(),
      communicationLog: newCommunicationLog
    };

    setCurrentEDIFile(updatedFile);
    setShowRecipientSelector(false);
    setCurrentView('viewer');
    toast.success(`EDI file sent to ${recipient.name} successfully`);
  };

  const handleStatusUpdate = (status: string, message: string) => {
    if (!currentEDIFile) return;

    const statusEntry: CommunicationEntry = {
      id: `comm_${Date.now()}`,
      userId: currentEDIFile.recipientId || 'recipient',
      userName: currentEDIFile.recipientName || 'Recipient',
      userRole: 'EDI Coordinator',
      message: `Status updated to: ${status.replace('_', ' ').toUpperCase()}. ${message}`,
      timestamp: new Date(),
      type: 'status_update'
    };

    const updatedFile: EDIFile = {
      ...currentEDIFile,
      status: status as any,
      communicationLog: [...currentEDIFile.communicationLog, statusEntry]
    };

    setCurrentEDIFile(updatedFile);
    toast.success('Status updated successfully');
  };

  const handleAddComment = (message: string) => {
    if (!currentEDIFile) return;

    const commentEntry: CommunicationEntry = {
      id: `comm_${Date.now()}`,
      userId: 'current_user',
      userName: 'You',
      userRole: '4PL Admin',
      message: message,
      timestamp: new Date(),
      type: 'comment'
    };

    const updatedFile: EDIFile = {
      ...currentEDIFile,
      communicationLog: [...currentEDIFile.communicationLog, commentEntry]
    };

    setCurrentEDIFile(updatedFile);
  };

  const handleNewFile = () => {
    setCurrentEDIFile(null);
    setShowRecipientSelector(false);
    setCurrentView('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader />
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">EDI File Management</h2>
            <p className="text-muted-foreground">Upload, validate, and send EDI files to recipients</p>
          </div>
          {currentEDIFile && (
            <button
              onClick={handleNewFile}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Upload New File
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            {currentView === 'upload' && (
              <EDIUpload onFileProcessed={handleFileProcessed} />
            )}
            
            {currentView === 'viewer' && currentEDIFile && (
              <EDIViewer
                ediFile={currentEDIFile}
                onSendToRecipient={handleSendToRecipient}
                canSend={currentEDIFile.status === 'validated' && !currentEDIFile.recipientId}
              />
            )}
            
            {currentView === 'recipient' && (
              <RecipientSelector
                onSendToRecipient={handleRecipientSelected}
                onCancel={() => {
                  setShowRecipientSelector(false);
                  setCurrentView('viewer');
                }}
              />
            )}
          </div>

          <div className="xl:col-span-1">
            {currentEDIFile && (
              <CommunicationPanel
                ediFile={currentEDIFile}
                onUpdateStatus={handleStatusUpdate}
                onAddComment={handleAddComment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}