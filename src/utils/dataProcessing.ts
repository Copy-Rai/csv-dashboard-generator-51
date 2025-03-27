
interface CampaignData {
  platform: string;
  campaign_name?: string;
  ad_set_name?: string;
  date?: string;
  impressions: number;
  clicks: number;
  link_clicks?: number;
  conversions: number;
  cost: number;
  amount_spent_eur?: number;
  revenue: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  roi?: number;
  status?: string;
}

// Detector automático de delimitador con preferencia para punto y coma
const detectDelimiter = (csvContent: string): string => {
  // Obtenemos las primeras líneas para analizar
  const lines = csvContent.split('\n').filter(line => line.trim() !== '').slice(0, 5);
  
  if (lines.length === 0) {
    console.error("❌ CSV vacío o sin contenido válido");
    return ','; // Default en caso de error
  }
  
  const firstLine = lines[0];
  
  // Contamos las ocurrencias de cada posible delimitador
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  // Preferimos punto y coma cuando hay más o igual cantidad que comas
  // ya que con formato europeo, las comas pueden estar en los números
  if (semicolonCount >= 1) return ';';
  if (tabCount > commaCount) return '\t';
  return ',';
};

// Función para normalizar texto removiendo acentos
const normalizeText = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Process CSV content to structured data with enhanced flexibility
export const processCSV = (csvContent: string): CampaignData[] => {
  try {
    console.log("🔄 PROCESANDO CSV - VERSIÓN RESTAURADA");
    
    // Detectamos el delimitador automáticamente
    const delimiter = detectDelimiter(csvContent);
    console.log(`🔧 Delimitador seleccionado: "${delimiter}"`);
    
    // Split the lines, filter out empty lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length < 1) {
      throw new Error("El archivo CSV no contiene datos válidos");
    }
    
    let headers = lines[0].split(delimiter).map(header => normalizeText(header.trim()));
    
    console.log("📊 Encabezados detectados:", headers);
    
    // Map column variations to standardized field names
    const fieldMappings: Record<string, string[]> = {
      platform: ['platform', 'plataforma', 'red', 'red social', 'source', 'origen', 'canal', 'fuente', 'media source'],
      campaign_name: ['campaign', 'campaign_name', 'campaña', 'nombre_campaña', 'nombre campaña', 'nombre de campaña', 'campaign name'],
      ad_set_name: ['adset', 'adset_name', 'ad set name', 'ad_set_name', 'conjunto de anuncios', 'nombre del conjunto'],
      date: ['date', 'fecha', 'day', 'día', 'mes', 'month', 'reporting_start', 'fecha_inicio', 'reporting_end'],
      impressions: ['impressions', 'impresiones', 'impr', 'impres', 'views', 'vistas', 'imprs', 'impression'],
      clicks: ['clicks', 'clics', 'cliques', 'click', 'clic', 'pulsaciones', 'click_total', 'all_clicks'],
      link_clicks: ['link clicks', 'link_clicks', 'outbound clicks', 'outbound_clicks', 'clics en el enlace'],
      conversions: ['conversions', 'conversiones', 'conv', 'converts', 'convs', 'results', 'resultados', 'outcomes'],
      cost: ['cost', 'costo', 'coste', 'gasto', 'spend', 'gastos', 'inversión', 'inversion', 'budget', 'presupuesto'],
      amount_spent_eur: ['amount_spent', 'money_spent', 'importe_gastado', 'importe gastado (eur)', 'importe gastado'],
      revenue: ['revenue', 'ingresos', 'revenue', 'income', 'ganancia', 'ganancias', 'ingreso', 'purchases_value'],
      ctr: ['ctr', 'click_through_rate', 'click through rate', 'tasa_clics', 'tasa de clics', 'ratio_clicks'],
      cpc: ['cpc', 'cost_per_click', 'cost per click', 'coste_por_clic', 'coste por clic', 'costo_por_clic'],
      cpm: ['cpm', 'cost_per_1000_impression', 'cost per thousand', 'coste_por_mil', 'coste por mil', 'costo_por_mil']
    };
    
    // Find indices of all possible field variations
    const columnMap: Record<string, number> = {};
    
    // First try exact matches, then fuzzy matches
    for (const [standardField, variations] of Object.entries(fieldMappings)) {
      // Try exact match first
      let foundIndex = headers.findIndex(header => 
        variations.some(variation => normalizeText(variation) === header)
      );
      
      // If not found, try partial match
      if (foundIndex === -1) {
        foundIndex = headers.findIndex(header => 
          variations.some(variation => header.includes(normalizeText(variation)))
        );
      }
      
      if (foundIndex !== -1) {
        columnMap[standardField] = foundIndex;
      }
    }
    
    // If platform is not found, assume Meta/Facebook for Meta Ads files
    if (columnMap.platform === undefined) {
      console.log("No platform column found, assuming Meta/Facebook");
      
      // Try to detect if it's Meta/Facebook by column names
      const metaSpecificColumns = ['adset_name', 'delivery_platform', 'clics en el enlace', 'importe gastado (eur)'];
      let isMeta = headers.some(header => 
        metaSpecificColumns.some(col => header.includes(normalizeText(col)))
      );
      
      if (isMeta) {
        console.log("Detected Meta Ads file by specific column names");
      }
    }
    
    console.log("🔄 Iniciando procesamiento de filas...");
    
    // Process each line of the CSV, starting with index 1 to skip header
    const results: CampaignData[] = [];
    let rowsProcessed = 0;
    let rowsSkipped = 0;
    let totalImpressions = 0;
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) {
        rowsSkipped++;
        continue;
      }
      
      const values = lines[i].split(delimiter).map(value => value.trim());
      
      // Skip rows that are too short (badly formatted)
      if (values.length < 3) {
        console.warn(`⚠️ Saltando fila ${i} por tener menos de 3 valores`);
        rowsSkipped++;
        continue;
      }

      // Extract platform - if not found, use Meta/Facebook as default for Meta Ads files
      let platform = "Meta";
      if (columnMap.platform !== undefined && values[columnMap.platform]) {
        platform = values[columnMap.platform];
        
        // Clean up platform name
        const platformMap: Record<string, string> = {
          'fb': 'Facebook',
          'facebook': 'Facebook',
          'facebook ads': 'Facebook',
          'meta': 'Meta',
          'instagram': 'Instagram',
          'ig': 'Instagram',
          'google': 'Google Ads',
          'google ads': 'Google Ads',
          'twitter': 'Twitter',
          'twitter ads': 'Twitter'
        };
        
        // Normalize platform name
        const normalizedPlatform = normalizeText(platform);
        for (const [key, value] of Object.entries(platformMap)) {
          if (normalizedPlatform.includes(key)) {
            platform = value;
            break;
          }
        }
      }
      
      // Extract metrics with improved parsing to handle European number format
      // In European format, comma is used as decimal separator
      const parseEuropeanNumeric = (value: string | undefined): number => {
        if (!value) return 0;
        
        // Clean the value of currency symbols and other non-numeric characters
        let cleaned = value.replace(/[€$%]/g, '').trim();
        
        // European format: comma is decimal separator
        // If contains comma and also period, assume period is thousand separator
        if (cleaned.includes(',') && cleaned.includes('.')) {
          // European format with thousand separator: remove periods and replace comma with period
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } 
        // If only contains comma as possible decimal
        else if (cleaned.includes(',') && !cleaned.includes('.')) {
          cleaned = cleaned.replace(',', '.');
        }
        
        // Convert to number
        const num = parseFloat(cleaned);
        
        // If not a valid number, return 0
        if (isNaN(num)) {
          return 0;
        }
        
        return num;
      };
      
      // Extract impressions with improved parsing for European number format
      const impressions = columnMap.impressions !== undefined 
        ? parseEuropeanNumeric(values[columnMap.impressions])
        : 0;
        
      // For debugging, log the impression value
      if (impressions > 100000) {
        console.log(`Fila ${i}: ${impressions} impresiones. Original: "${values[columnMap.impressions]}"`);
      }
      
      // Accumulate total impressions for verification
      totalImpressions += impressions;
      
      // Extract clicks with improved parsing
      const rawClicks = columnMap.clicks !== undefined 
        ? parseEuropeanNumeric(values[columnMap.clicks]) 
        : 0;
      const linkClicks = columnMap.link_clicks !== undefined 
        ? parseEuropeanNumeric(values[columnMap.link_clicks]) 
        : 0;
      
      // Prefer link_clicks when available
      const clicks = linkClicks > 0 ? linkClicks : rawClicks;
      
      // Extract conversions
      const conversions = columnMap.conversions !== undefined 
        ? parseEuropeanNumeric(values[columnMap.conversions]) 
        : 0;
      
      // Prefer amount_spent_eur when available (more specific)
      const amountSpentEur = columnMap.amount_spent_eur !== undefined 
        ? parseEuropeanNumeric(values[columnMap.amount_spent_eur]) 
        : 0;
      const generalCost = columnMap.cost !== undefined 
        ? parseEuropeanNumeric(values[columnMap.cost]) 
        : 0;
      
      // Use the most specific cost available
      const cost = amountSpentEur > 0 ? amountSpentEur : generalCost;
      
      // Extract revenue, or if not available, calculate with estimated conversion value
      let revenue = columnMap.revenue !== undefined 
        ? parseEuropeanNumeric(values[columnMap.revenue]) 
        : 0;
      
      if (revenue === 0 && conversions > 0) {
        // Default estimated value per conversion
        const estimatedValuePerConversion = 30;
        revenue = conversions * estimatedValuePerConversion;
      }
      
      // Extract or calculate derived metrics
      let ctr = columnMap.ctr !== undefined 
        ? parseEuropeanNumeric(values[columnMap.ctr]) 
        : undefined;
        
      let cpc = columnMap.cpc !== undefined 
        ? parseEuropeanNumeric(values[columnMap.cpc]) 
        : undefined;
        
      let cpm = columnMap.cpm !== undefined 
        ? parseEuropeanNumeric(values[columnMap.cpm]) 
        : undefined;
      
      // Calculate derived metrics if not available
      if (ctr === undefined && impressions > 0) {
        ctr = (clicks / impressions) * 100;
      }
      
      if (cpc === undefined && clicks > 0) {
        cpc = cost / clicks;
      }
      
      if (cpm === undefined && impressions > 0) {
        cpm = (cost / impressions) * 1000;
      }
      
      // Calculate ROI
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
      
      // Create campaign data object with metrics
      const campaignData: CampaignData = {
        platform,
        campaign_name: columnMap.campaign_name !== undefined ? values[columnMap.campaign_name] : undefined,
        ad_set_name: columnMap.ad_set_name !== undefined ? values[columnMap.ad_set_name] : undefined,
        date: columnMap.date !== undefined ? values[columnMap.date] : undefined,
        impressions,
        clicks,
        link_clicks: linkClicks,
        conversions,
        cost,
        amount_spent_eur: amountSpentEur,
        revenue,
        ctr,
        cpc,
        cpm,
        roi
      };
      
      results.push(campaignData);
      rowsProcessed++;
      
      // Log progress periodically
      if (i % 100 === 0 || i === lines.length - 1) {
        console.log(`Progreso: ${i}/${lines.length-1} filas procesadas. Impresiones hasta ahora: ${totalImpressions}`);
      }
    }
    
    // Log statistics for debugging
    console.log(`Filas procesadas: ${rowsProcessed}, Filas omitidas: ${rowsSkipped}`);
    console.log(`Total de impresiones encontradas: ${totalImpressions}`);
    
    // Log total impressions for verification
    const verifiedTotalImpressions = results.reduce((sum, item) => sum + item.impressions, 0);
    console.log(`Verificación: Total de impresiones en resultados: ${verifiedTotalImpressions}`);
    
    return results;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Error processing CSV data. Please check the format.");
  }
};

// Clean CSV data - ensure all numeric values are properly formatted
export const cleanCSVData = (data: CampaignData[]): CampaignData[] => {
  console.log("🧹 Limpiando datos...");
  console.log("Total de registros antes de limpieza:", data.length);
  
  // Show total impressions before cleaning for verification
  const totalImpressionsBeforeCleaning = data.reduce((sum, item) => sum + item.impressions, 0);
  console.log(`Total de impresiones antes de limpieza: ${totalImpressionsBeforeCleaning}`);
  
  // Basic cleaning without filtering out any records
  const cleanedData = data.map(item => {
    // Clean platform field if it contains separators
    let platform = item.platform;
    if (platform && (platform.includes(';') || platform.includes('|'))) {
      platform = platform.split(/[;|]/)[0].trim();
    }
    
    // Ensure all numeric values are properly formatted
    return {
      ...item,
      platform,
      // Ensure impressions is always a number
      impressions: typeof item.impressions === 'number' ? item.impressions : 
                  item.impressions ? Number(item.impressions) : 0
    };
  });
  
  // Show total impressions after cleaning for verification
  const totalImpressionsAfterCleaning = cleanedData.reduce((sum, item) => sum + item.impressions, 0);
  console.log(`Total de impresiones después de limpieza: ${totalImpressionsAfterCleaning}`);
  
  // Log record count after cleaning
  console.log("Total de registros después de limpieza:", cleanedData.length);
  
  return cleanedData;
};

// Calculate key metrics from the processed data
export const calculateMetrics = (data: CampaignData[]) => {
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = data.reduce((sum, item) => sum + (item.link_clicks || item.clicks), 0);
  const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);
  const totalCost = data.reduce((sum, item) => sum + (item.amount_spent_eur || item.cost), 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const cpm = totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  
  return {
    totalImpressions,
    totalClicks,
    totalConversions,
    totalCost,
    totalRevenue,
    ctr,
    cpc,
    cpm,
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
