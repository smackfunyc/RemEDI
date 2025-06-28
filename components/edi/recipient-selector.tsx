'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Recipient } from '@/types/edi';
import { mockRecipients } from '@/lib/mock-recipients';
import { Search, Send, User, Building } from 'lucide-react';

interface RecipientSelectorProps {
  onSendToRecipient: (recipient: Recipient, message: string) => void;
  onCancel: () => void;
}

export function RecipientSelector({ onSendToRecipient, onCancel }: RecipientSelectorProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredRecipients = mockRecipients.filter(recipient =>
    recipient.isActive && (
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSend = async () => {
    if (!selectedRecipient) return;

    setIsSending(true);
    
    // Simulate sending delay
    setTimeout(() => {
      onSendToRecipient(selectedRecipient, message);
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send EDI File to Recipient</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Recipients</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredRecipients.map((recipient) => (
                <Card
                  key={recipient.id}
                  className={`cursor-pointer transition-colors ${
                    selectedRecipient?.id === recipient.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRecipient(recipient)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {recipient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm">{recipient.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {recipient.role}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Building className="h-3 w-3" />
                          <span>{recipient.company}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{recipient.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {selectedRecipient && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Selected: {selectedRecipient.name}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message for the recipient..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex-1"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send EDI File
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}