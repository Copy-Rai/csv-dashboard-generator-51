
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  className,
  delay = 0
}) => {
  return (
    <Card className={cn(
      "overflow-hidden card-glow animate-fade-in-up", 
      className
    )} 
    style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold tracking-tight">{value}</h3>
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full", 
                  trend.isPositive 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-secondary text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
