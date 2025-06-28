'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Transaction } from '@/types/transaction';
import { MessageSquare, Send, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationPanelProps {
  selectedTransaction: Transaction | null;
  onTransactionSelect: (id: string | null) => void;
}

interface MockComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  createdAt: Date;
  isResolved?: boolean;
}

const mockComments: MockComment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    userRole: 'Shipper',
    message: 'Missing product code validation on line item 3. Can we get this corrected?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    userRole: '4PL Admin',
    message: 'I\'ve updated the validation rules. This should be automatically corrected now.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Jessica Rodriguez',
    userRole: 'Carrier',
    message: 'Confirmed the shipment details are accurate. Ready for processing.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

export function CollaborationPanel({ selectedTransaction, onTransactionSelect }: CollaborationPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<MockComment[]>(mockComments);

  const handleSendComment = () => {
    if (!newComment.trim() || !selectedTransaction) return;

    const comment: MockComment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      userRole: '4PL Admin',
      message: newComment,
      createdAt: new Date(),
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Shipper': 'bg-blue-500/10 text-blue-400',
      'Carrier': 'bg-green-500/10 text-green-400',
      '4PL Admin': 'bg-purple-500/10 text-purple-400',
      'Receiver': 'bg-orange-500/10 text-orange-400',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Collaboration Hub</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTransaction ? (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{selectedTransaction.referenceNumber}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onTransactionSelect(null)}
                  >
                    ×
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{selectedTransaction.partnerName}</p>
                {selectedTransaction.errorMessage && (
                  <div className="flex items-center space-x-2 mt-2 text-xs text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    <span>Has active issues</span>
                  </div>
                )}
              </div>

              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <Badge className={`text-xs ${getRoleColor(comment.userRole)}`}>
                            {comment.userRole}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground">{comment.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button 
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Comment
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a transaction to view discussions</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Transaction TXN-850-ABC123 completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Error detected in TXN-856-DEF456</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">New comment on TXN-810-GHI789</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}