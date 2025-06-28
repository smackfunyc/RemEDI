'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EDIFile, CommunicationEntry } from '@/types/edi';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunicationPanelProps {
  ediFile: EDIFile;
  onUpdateStatus: (status: string, message: string) => void;
  onAddComment: (message: string) => void;
}

export function CommunicationPanel({ ediFile, onUpdateStatus, onAddComment }: CommunicationPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onAddComment(newMessage);
    setNewMessage('');
  };

  const handleStatusUpdate = () => {
    if (!statusUpdate || !statusMessage.trim()) return;
    onUpdateStatus(statusUpdate, statusMessage);
    setStatusUpdate('');
    setStatusMessage('');
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'EDI Coordinator': 'bg-blue-500/10 text-blue-400',
      'Supply Chain Manager': 'bg-green-500/10 text-green-400',
      'EDI Specialist': 'bg-purple-500/10 text-purple-400',
      'Logistics Coordinator': 'bg-orange-500/10 text-orange-400',
      'Operations Manager': 'bg-red-500/10 text-red-400',
      'System': 'bg-gray-500/10 text-gray-400',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Communication Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 mb-4">
            <div className="space-y-3">
              {ediFile.communicationLog.map((entry) => (
                <div key={entry.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {entry.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      {getMessageIcon(entry.type)}
                      <span className="text-sm font-medium">{entry.userName}</span>
                      <Badge className={`text-xs ${getRoleColor(entry.userRole)}`}>
                        {entry.userRole}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{entry.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[60px]"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {ediFile.recipientId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Status Update</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status update" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="requires_attention">Requires Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add details about the status update..."
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={!statusUpdate || !statusMessage.trim()}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}