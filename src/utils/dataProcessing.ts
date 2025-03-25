
interface CampaignData {
  platform: string;
  campaign_name?: string;
  date?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
}

// Process CSV content to structured data
export const processCSV = (csvContent: string): CampaignData[] => {
  try {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const results: CampaignData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const entry: Record<string, string | number> = {};
      
      for (let j = 0; j < headers.length && j < values.length; j++) {
        // Try to convert numeric values
        const value = values[j];
        const numValue = parseFloat(value);
        entry[headers[j]] = isNaN(numValue) ? value : numValue;
      }
      
      // Ensure required fields are present
      if (
        typeof entry['platform'] === 'string' && 
        entry['platform'] && 
        (typeof entry['impressions'] === 'number' || typeof entry['clicks'] === 'number')
      ) {
        // Fill in missing fields with default values
        const campaignData: CampaignData = {
          platform: entry['platform'] as string,
          campaign_name: entry['campaign_name'] as string | undefined,
          date: entry['date'] as string | undefined,
          impressions: typeof entry['impressions'] === 'number' ? entry['impressions'] as number : 0,
          clicks: typeof entry['clicks'] === 'number' ? entry['clicks'] as number : 0,
          conversions: typeof entry['conversions'] === 'number' ? entry['conversions'] as number : 0,
          cost: typeof entry['cost'] === 'number' ? entry['cost'] as number : 0,
          revenue: typeof entry['revenue'] === 'number' ? entry['revenue'] as number : 0
        };
        
        results.push(campaignData);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Error processing CSV data. Please check the format.");
  }
};

// Calculate key metrics from the processed data
export const calculateMetrics = (data: CampaignData[]) => {
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  
  return {
    totalImpressions,
    totalClicks,
    totalConversions,
    totalCost,
    totalRevenue,
    ctr,
    conversionRate,
    roi
  };
};

// Group data by platform for platform-specific metrics
export const groupByPlatform = (data: CampaignData[]) => {
  const platformData: Record<string, CampaignData[]> = {};
  
  data.forEach(item => {
    if (!platformData[item.platform]) {
      platformData[item.platform] = [];
    }
    platformData[item.platform].push(item);
  });
  
  return platformData;
};

// Calculate platform-specific metrics
export const calculatePlatformMetrics = (data: CampaignData[]) => {
  const platformData = groupByPlatform(data);
  
  return Object.entries(platformData).map(([platform, items]) => {
    const metrics = calculateMetrics(items);
    
    return {
      platform,
      ...metrics
    };
  });
};
