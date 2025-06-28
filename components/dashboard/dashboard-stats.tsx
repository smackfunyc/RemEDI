'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface DashboardStatsProps {
  transactions: Transaction[];
}

export function DashboardStats({ transactions }: DashboardStatsProps) {
  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    error: transactions.filter(t => t.status === 'error').length,
    processing: transactions.filter(t => t.status === 'processing').length,
    pending: transactions.filter(t => t.status === 'pending').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const errorRate = stats.total > 0 ? Math.round((stats.error / stats.total) * 100) : 0;

  const statCards = [
    {
      title: 'Total Transactions',
      value: stats.total.toLocaleString(),
      icon: TrendingUp,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: CheckCircle,
      trend: '+2.1%',
      trendUp: true,
    },
    {
      title: 'Error Rate',
      value: `${errorRate}%`,
      icon: AlertTriangle,
      trend: '-0.8%',
      trendUp: false,
    },
    {
      title: 'Processing',
      value: stats.processing.toString(),
      icon: TrendingUp,
      trend: 'Active',
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {stat.trend !== 'Active' ? (
                <>
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trendUp ? 'text-green-500' : 'text-red-500'}>
                    {stat.trend}
                  </span>
                  <span>from last month</span>
                </>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}