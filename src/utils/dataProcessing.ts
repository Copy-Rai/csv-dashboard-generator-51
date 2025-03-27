
interface CampaignData {
  platform: string;
  campaign_name?: string;
  date?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  roi?: number;
}

// Detector automático de delimitador
const detectDelimiter = (csvContent: string): string => {
  const firstLine = csvContent.split('\n')[0];
  
  // Contamos las ocurrencias de cada posible delimitador
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  // Devolvemos el delimitador más frecuente
  if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  return ','; // Por defecto usamos coma
};

// Función para normalizar texto removiendo acentos
const normalizeText = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Process CSV content to structured data with enhanced flexibility
export const processCSV = (csvContent: string): CampaignData[] => {
  try {
    // Intentamos detectar y corregir problemas de codificación
    let normalizedContent = csvContent;
    
    // Si detectamos caracteres extraños típicos de problemas de codificación, intentamos arreglarlos
    if (csvContent.includes('Ã') || csvContent.includes('â€')) {
      try {
        // Intento de re-decodificación para problemas comunes
        normalizedContent = decodeURIComponent(escape(csvContent));
      } catch (e) {
        console.warn("Error al intentar corregir la codificación", e);
        // Continuamos con el contenido original
      }
    }
    
    // Detectamos el delimitador automáticamente
    const delimiter = detectDelimiter(normalizedContent);
    console.log(`Delimitador detectado: "${delimiter}"`);
    
    const lines = normalizedContent.split(/\r?\n/);
    let headers = lines[0].split(delimiter).map(header => normalizeText(header.trim()));
    
    // Handle empty lines and remove any blank headers
    const filteredLines = lines.filter(line => line.trim() !== '');
    if (filteredLines.length < 2) {
      throw new Error("El archivo CSV no contiene datos suficientes");
    }
    
    // Map column variations to standardized field names - Ampliado con más variaciones en varios idiomas
    const fieldMappings: Record<string, string[]> = {
      platform: ['platform', 'plataforma', 'red', 'red social', 'source', 'origen', 'canal', 'fuente', 'media source', 'publisher', 'publisher_platform', 'ad_network', 'network'],
      campaign_name: ['campaign', 'campaign_name', 'campaña', 'nombre_campaña', 'nombre campaña', 'nombre de campaña', 'campaign name', 'ad_name', 'ad name', 'adset', 'adset_name', 'campaign_name', 'campana'],
      date: ['date', 'fecha', 'day', 'día', 'mes', 'month', 'reporting_start', 'fecha_inicio', 'reporting_end', 'time', 'periodo'],
      impressions: ['impressions', 'impresiones', 'impr', 'impres', 'views', 'vistas', 'imprs', 'impression', 'alcance', 'reach', 'viewability', 'impressions_total', 'impresiones_totales', 'shown', 'displays'],
      clicks: ['clicks', 'clics', 'cliques', 'click', 'clic', 'pulsaciones', 'click_total', 'link clicks', 'link_clicks', 'outbound clicks', 'outbound_clicks', 'all_clicks', 'total_clicks'],
      conversions: ['conversions', 'conversiones', 'conv', 'converts', 'convs', 'results', 'resultados', 'outcomes', 'purchase', 'compras', 'acquisition', 'adquisiciones', 'leads', 'registros', 'sign_ups', 'leads_form', 'registrations', 'app_install', 'install', 'instalaciones', 'actions', 'complete_registration'],
      cost: ['cost', 'costo', 'coste', 'gasto', 'spend', 'gastos', 'inversión', 'inversion', 'amount_spent', 'money_spent', 'importe_gastado', 'budget', 'presupuesto', 'costo_total', 'gasto_total'],
      revenue: ['revenue', 'ingresos', 'revenue', 'income', 'ganancia', 'ganancias', 'ingreso', 'purchases_value', 'purchase_value', 'valor_compra', 'sales_amount', 'sales', 'ventas', 'sales_revenue', 'purchases', 'conversion_value', 'valor_conversion', 'revenue_total', 'valor_total', 'return', 'total_revenue'],
      ctr: ['ctr', 'click_through_rate', 'click through rate', 'tasa_clics', 'tasa de clics', 'ratio_clicks', 'porcentaje_clics'],
      cpc: ['cpc', 'cost_per_click', 'cost per click', 'coste_por_clic', 'coste por clic', 'costo_por_clic', 'cpc_medio', 'average_cpc'],
      cpm: ['cpm', 'cost_per_1000_impression', 'cost per thousand', 'coste_por_mil', 'coste por mil impresiones', 'costo_por_mil', 'cpm_medio', 'average_cpm'],
      roi: ['roi', 'return_on_investment', 'return on investment', 'retorno_inversion', 'retorno de inversión', 'roas', 'return_on_ad_spend']
    };
    
    // Enhanced column detection - find indices of all possible variations
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
      
      // Última oportunidad: buscar coincidencias parciales en ambas direcciones
      if (foundIndex === -1) {
        foundIndex = headers.findIndex(header => 
          variations.some(variation => 
            normalizeText(variation).includes(header) || header.includes(normalizeText(variation).substring(0, 3))
          )
        );
      }
      
      if (foundIndex !== -1) {
        columnMap[standardField] = foundIndex;
      }
    }
    
    console.log("Mapeo de columnas detectado:", columnMap);
    
    // Si no encontramos la plataforma, intentamos encontrarla analizando los datos
    if (columnMap.platform === undefined) {
      const commonPlatforms = ['facebook', 'meta', 'google', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'pinterest', 'snapchat', 'microsoft', 'bing', 'amazon'];
      
      // Check sample rows to see if any column consistently contains platform-like data
      const sampleRowsToCheck = Math.min(5, filteredLines.length - 1);
      
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        let platformMatches = 0;
        
        for (let rowIndex = 1; rowIndex <= sampleRowsToCheck; rowIndex++) {
          const rowValues = filteredLines[rowIndex].split(delimiter).map(v => normalizeText(v.trim()));
          if (rowValues.length > colIndex && rowValues[colIndex] && 
              commonPlatforms.some(platform => rowValues[colIndex].includes(platform))) {
            platformMatches++;
          }
        }
        
        // Si la mayoría de las filas de muestra contienen datos similares a una plataforma en esta columna, la usamos
        if (platformMatches >= sampleRowsToCheck / 2) {
          columnMap.platform = colIndex;
          break;
        }
      }
    }
    
    return processWithDelimiter(filteredLines, columnMap, delimiter);
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
    
    // Si la línea tiene muy pocos valores, probablemente está mal formateada
    if (values.length < 3) {
      console.warn(`Saltando fila ${i} por tener menos de 3 valores`);
      continue;
    }

    // Extract platform - if still not found, use a default
    let platform = "Unknown";
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
        'google': 'Google',
        'google ads': 'Google',
        'adwords': 'Google',
        'youtube': 'YouTube',
        'yt': 'YouTube',
        'twitter': 'Twitter',
        'x': 'Twitter',
        'linkedin': 'LinkedIn',
        'tiktok': 'TikTok'
      };
      
      // Normalizar el nombre de la plataforma
      const normalizedPlatform = normalizeText(platform);
      for (const [key, value] of Object.entries(platformMap)) {
        if (normalizedPlatform.includes(key)) {
          platform = value;
          break;
        }
      }
    }
    
    // Extraer o calcular las métricas principales
    // Conversión de datos a números con manejo de formatos internacionales
    const parseNumeric = (value: string | undefined): number => {
      if (!value) return 0;
      // Manejar formatos europeos (coma como decimal) y limpiar cualquier símbolo de moneda
      let cleaned = value.replace(/[€$,%]/g, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    };
    
    // Extracción de métricas principales
    const impressions = columnMap.impressions !== undefined ? parseNumeric(values[columnMap.impressions]) : 0;
    const clicks = columnMap.clicks !== undefined ? parseNumeric(values[columnMap.clicks]) : 0;
    const conversions = columnMap.conversions !== undefined ? parseNumeric(values[columnMap.conversions]) : 0;
    const cost = columnMap.cost !== undefined ? parseNumeric(values[columnMap.cost]) : 0;
    const revenue = columnMap.revenue !== undefined ? parseNumeric(values[columnMap.revenue]) : 0;
    
    // Calcular o extraer métricas derivadas
    let ctr = columnMap.ctr !== undefined ? parseNumeric(values[columnMap.ctr]) : undefined;
    let cpc = columnMap.cpc !== undefined ? parseNumeric(values[columnMap.cpc]) : undefined;
    let cpm = columnMap.cpm !== undefined ? parseNumeric(values[columnMap.cpm]) : undefined;
    let roi = columnMap.roi !== undefined ? parseNumeric(values[columnMap.roi]) : undefined;
    
    // Calcular métricas derivadas si no están disponibles pero tenemos los datos necesarios
    if (ctr === undefined && impressions > 0) {
      ctr = (clicks / impressions) * 100;
    }
    
    if (cpc === undefined && clicks > 0) {
      cpc = cost / clicks;
    }
    
    if (cpm === undefined && impressions > 0) {
      cpm = (cost / impressions) * 1000;
    }
    
    if (roi === undefined && cost > 0) {
      roi = ((revenue - cost) / cost) * 100;
    }
    
    // Check if we have any numeric data on this row - skip if all zeros
    const hasNumericData = impressions > 0 || clicks > 0 || conversions > 0 || cost > 0 || revenue > 0;
    
    if (!hasNumericData && platform === "Unknown") {
      continue; // Skip rows with no useful data
    }
    
    // Build campaign data
    const campaignData: CampaignData = {
      platform,
      campaign_name: columnMap.campaign_name !== undefined ? values[columnMap.campaign_name] : undefined,
      date: columnMap.date !== undefined ? values[columnMap.date] : undefined,
      impressions,
      clicks,
      conversions,
      cost,
      revenue,
      ctr,
      cpc,
      cpm,
      roi
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

// Calculate key metrics from the processed data
export const calculateMetrics = (data: CampaignData[]) => {
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
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
