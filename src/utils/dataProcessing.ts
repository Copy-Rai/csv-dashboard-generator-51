
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

// Process CSV content to structured data with enhanced flexibility
export const processCSV = (csvContent: string): CampaignData[] => {
  try {
    const lines = csvContent.split('\n');
    let headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Handle empty lines and remove any blank headers
    const filteredLines = lines.filter(line => line.trim() !== '');
    if (filteredLines.length < 2) {
      throw new Error("El archivo CSV no contiene datos suficientes");
    }
    
    // Map column variations to standardized field names
    const fieldMappings: Record<string, string[]> = {
      platform: ['platform', 'plataforma', 'red', 'red social', 'source', 'origen', 'canal'],
      campaign_name: ['campaign', 'campaign_name', 'campaña', 'nombre_campaña', 'nombre campaña', 'nombre de campaña', 'campaign name'],
      date: ['date', 'fecha', 'day', 'día', 'mes', 'month'],
      impressions: ['impressions', 'impresiones', 'impr', 'impres', 'views', 'vistas', 'imprs'],
      clicks: ['clicks', 'clics', 'cliques', 'click', 'clic', 'pulsaciones'],
      conversions: ['conversions', 'conversiones', 'conv', 'converts', 'convs'],
      cost: ['cost', 'costo', 'coste', 'gasto', 'spend', 'gastos', 'inversión', 'inversion'],
      revenue: ['revenue', 'ingresos', 'revenue', 'income', 'ganancia', 'ganancias', 'ingreso'],
    };
    
    // Enhanced column detection - find indices of all possible variations
    const columnMap: Record<string, number> = {};
    
    // First try exact matches, then fuzzy matches
    for (const [standardField, variations] of Object.entries(fieldMappings)) {
      // Try exact match first
      let foundIndex = headers.findIndex(header => 
        variations.includes(header)
      );
      
      // If not found, try partial match
      if (foundIndex === -1) {
        foundIndex = headers.findIndex(header => 
          variations.some(variation => header.includes(variation))
        );
      }
      
      if (foundIndex !== -1) {
        columnMap[standardField] = foundIndex;
      }
    }
    
    // If we can't find platform column, try to check if any column contains data that looks like platforms
    if (columnMap.platform === undefined) {
      const commonPlatforms = ['facebook', 'meta', 'google', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube'];
      
      // Check sample rows to see if any column consistently contains platform-like data
      const sampleRowsToCheck = Math.min(5, filteredLines.length - 1);
      
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        let platformMatches = 0;
        
        for (let rowIndex = 1; rowIndex <= sampleRowsToCheck; rowIndex++) {
          const rowValues = filteredLines[rowIndex].split(',').map(v => v.trim().toLowerCase());
          if (rowValues[colIndex] && commonPlatforms.some(platform => rowValues[colIndex].includes(platform))) {
            platformMatches++;
          }
        }
        
        // If most sample rows contain platform-like data in this column, use it
        if (platformMatches >= sampleRowsToCheck / 2) {
          columnMap.platform = colIndex;
          break;
        }
      }
    }
    
    // Attempt to recover by using semi-colon as delimiter if we don't have enough columns
    const firstRowValues = filteredLines[1].split(',');
    if (firstRowValues.length <= 3 && filteredLines[1].includes(';')) {
      // It might be using semi-colons as separators instead of commas
      headers = filteredLines[0].split(';').map(header => header.trim().toLowerCase());
      
      // Re-do the mapping with new headers
      for (const [standardField, variations] of Object.entries(fieldMappings)) {
        const foundIndex = headers.findIndex(header => 
          variations.includes(header) || variations.some(variation => header.includes(variation))
        );
        
        if (foundIndex !== -1) {
          columnMap[standardField] = foundIndex;
        }
      }
      
      // Process using semicolons instead
      return processWithDelimiter(filteredLines, columnMap, ';');
    }
    
    return processWithDelimiter(filteredLines, columnMap, ',');
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Error processing CSV data. Please check the format.");
  }
};

// Helper function to process with a specific delimiter
function processWithDelimiter(lines: string[], columnMap: Record<string, number>, delimiter: string): CampaignData[] {
  const results: CampaignData[] = [];
  
  // Process each line of the CSV
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(delimiter).map(value => value.trim());
    
    // If values has fewer columns than expected for the mapped columns, skip this row
    if (values.length < Math.max(...Object.values(columnMap)) + 1) {
      console.warn(`Skipping row ${i} due to insufficient columns`);
      continue;
    }
    
    // Extract platform - if still not found, use a default
    let platform = "Unknown";
    if (columnMap.platform !== undefined && values[columnMap.platform]) {
      platform = values[columnMap.platform];
      
      // Split platform if it contains multiple values (likely from semicolon delimited fields)
      if (platform.includes(';')) {
        const parts = platform.split(';');
        if (parts.length > 0) {
          platform = parts[0]; // Use first part as platform
        }
      }
    }
    
    // Check if we have any numeric data on this row - skip if all zeros
    const hasNumericData = ['impressions', 'clicks', 'conversions', 'cost', 'revenue'].some(field => {
      if (columnMap[field] === undefined) return false;
      const value = values[columnMap[field]];
      return value && parseFloat(value) > 0;
    });
    
    if (!hasNumericData && platform === "Unknown") {
      continue; // Skip rows with no useful data
    }
    
    // Build campaign data with default values for missing fields
    const campaignData: CampaignData = {
      platform,
      campaign_name: columnMap.campaign_name !== undefined ? values[columnMap.campaign_name] : undefined,
      date: columnMap.date !== undefined ? values[columnMap.date] : undefined,
      impressions: columnMap.impressions !== undefined ? parseFloat(values[columnMap.impressions]) || 0 : 0,
      clicks: columnMap.clicks !== undefined ? parseFloat(values[columnMap.clicks]) || 0 : 0,
      conversions: columnMap.conversions !== undefined ? parseFloat(values[columnMap.conversions]) || 0 : 0,
      cost: columnMap.cost !== undefined ? parseFloat(values[columnMap.cost]) || 0 : 0,
      revenue: columnMap.revenue !== undefined ? parseFloat(values[columnMap.revenue]) || 0 : 0
    };
    
    results.push(campaignData);
  }
  
  return results;
}

// Clean CSV data by extracting first parts of columns that may have multiple values
export const cleanCSVData = (data: CampaignData[]): CampaignData[] => {
  return data.map(item => {
    // Clean platform field if it contains semicolons or other separators
    let platform = item.platform;
    if (platform && (platform.includes(';') || platform.includes('|'))) {
      platform = platform.split(/[;|]/)[0].trim();
    }
    
    return {
      ...item,
      platform,
    };
  });
};

// Remaining functions stay the same
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
