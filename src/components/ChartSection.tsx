import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartSectionProps {
  data: any[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ data }) => {
  // Process data for charts - group by platform
  const calculatePlatformMetrics = () => {
    const platformData: Record<string, {
      roi: number[];
      ctr: number[];
      cost: number;
      revenue: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }> = {};
    
    data.forEach(item => {
      const platform = item.platform || 'Unknown';
      const cost = typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0;
      const revenue = typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0;
      const impressions = typeof item.impressions === 'number' ? item.impressions : parseFloat(item.impressions) || 0;
      const clicks = typeof item.clicks === 'number' ? item.clicks : parseFloat(item.clicks) || 0;
      const conversions = typeof item.conversions === 'number' ? item.conversions : parseFloat(item.conversions) || 0;
      
      // Get ROI value (either directly or calculate it)
      let roi = 0;
      if (typeof item.roi === 'number' || parseFloat(item.roi)) {
        roi = typeof item.roi === 'number' ? item.roi : parseFloat(item.roi);
      } else if (cost > 0) {
        roi = ((revenue - cost) / cost) * 100;
      }
      
      // Get CTR value (either directly or calculate it)
      let ctr = 0;
      if (typeof item.ctr === 'number' || parseFloat(item.ctr)) {
        ctr = typeof item.ctr === 'number' ? item.ctr : parseFloat(item.ctr);
      } else if (impressions > 0) {
        ctr = (clicks / impressions) * 100;
      }
      
      if (!platformData[platform]) {
        platformData[platform] = {
          roi: [],
          ctr: [],
          cost: 0,
          revenue: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        };
      }
      
      platformData[platform].roi.push(roi);
      platformData[platform].ctr.push(ctr);
      platformData[platform].cost += cost;
      platformData[platform].revenue += revenue;
      platformData[platform].impressions += impressions;
      platformData[platform].clicks += clicks;
      platformData[platform].conversions += conversions;
    });
    
    return Object.entries(platformData).map(([platform, metrics]) => ({
      platform,
      // Average ROI across all entries for this platform
      roi: metrics.roi.length > 0 
        ? metrics.roi.reduce((sum, val) => sum + val, 0) / metrics.roi.length 
        : 0,
      // Average CTR across all entries for this platform
      ctr: metrics.ctr.length > 0 
        ? metrics.ctr.reduce((sum, val) => sum + val, 0) / metrics.ctr.length 
        : 0,
      // Other accumulated metrics
      cost: metrics.cost,
      revenue: metrics.revenue,
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      conversions: metrics.conversions,
      // Also calculate conversion rate per platform
      convRate: metrics.clicks > 0 
        ? (metrics.conversions / metrics.clicks) * 100 
        : 0
    }));
  };

  const platformMetrics = calculatePlatformMetrics();
  
  // Format numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Format percentage
  const formatPercent = (num: number) => {
    return `${formatNumber(num)}%`;
  };

  // Format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Colors for charts
  const COLORS = [
    '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
    '#4895ef', '#560bad', '#f15bb5', '#00bbf9', '#1b98e0'
  ];

  // Custom tooltip component for recharts
  const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
      {/* ROI by Platform Chart */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>ROI por plataforma</CardTitle>
          <CardDescription>Retorno de inversión por cada plataforma utilizada</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformMetrics}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="platform" 
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip valueFormatter={formatPercent} />} />
                <Bar 
                  dataKey="roi" 
                  name="ROI"
                  fill="#4361ee" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* CTR by Platform Chart */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>CTR por plataforma</CardTitle>
          <CardDescription>Tasa de clics por cada plataforma utilizada</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformMetrics}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="platform" 
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip valueFormatter={formatPercent} />} />
                <Bar 
                  dataKey="ctr" 
                  name="CTR"
                  fill="#7209b7" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cost by Platform Chart */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Costo por plataforma</CardTitle>
          <CardDescription>Inversión total por cada plataforma</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformMetrics}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="platform" 
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip valueFormatter={formatCurrency} />} />
                <Bar 
                  dataKey="cost" 
                  name="Costo"
                  fill="#f72585" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution Pie Chart */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Distribución de ingresos</CardTitle>
          <CardDescription>Ingresos generados por cada plataforma</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="platform"
                >
                  {platformMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartSection;
