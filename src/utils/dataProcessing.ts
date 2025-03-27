
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

// Improved delimiter detection with support for all common delimiters
const detectDelimiter = (csvContent: string): string => {
  console.log("🔍 Detectando delimitador automáticamente");
  
  // Get the first few lines for analysis
  const lines = csvContent.split('\n').filter(line => line.trim() !== '').slice(0, 5);
  
  if (lines.length === 0) {
    console.error("❌ CSV vacío o sin contenido válido");
    return ','; // Default in case of error
  }
  
  const firstLine = lines[0];
  
  // Count occurrences of each possible delimiter
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  console.log(`🔢 Conteo de delimitadores - Comas: ${commaCount}, Punto y coma: ${semicolonCount}, Tabuladores: ${tabCount}`);
  
  // Choose the delimiter with the most occurrences, with a preference for semicolons
  // in case of European format where commas may be used as decimal separators
  if (semicolonCount >= 3) return ';';
  if (tabCount >= 3) return '\t';
  if (commaCount >= 3) return ',';
  
  // If counts are low, check patterns that suggest particular delimiters
  if (semicolonCount > 0) return ';';
  if (tabCount > 0) return '\t';
  return ','; // Fallback to comma as default
};

// Detect language based on column names and content patterns
const detectLanguage = (headers: string[]): string => {
  // Normalize headers for language detection
  const normalizedHeaders = headers.map(h => h.toLowerCase());
  
  // Spanish keywords
  const spanishKeywords = ['impresiones', 'coste', 'campaña', 'resultados', 'importe', 'gastado'];
  // English keywords
  const englishKeywords = ['impressions', 'cost', 'campaign', 'results', 'amount', 'spent'];
  // French keywords
  const frenchKeywords = ['impressions', 'coût', 'campagne', 'résultats', 'montant', 'dépensé'];
  
  // Count matches for each language
  const spanishMatches = spanishKeywords.filter(keyword => 
    normalizedHeaders.some(header => header.includes(keyword))
  ).length;
  
  const englishMatches = englishKeywords.filter(keyword => 
    normalizedHeaders.some(header => header.includes(keyword))
  ).length;
  
  const frenchMatches = frenchKeywords.filter(keyword => 
    normalizedHeaders.some(header => header.includes(keyword))
  ).length;
  
  console.log(`🌐 Detección de idioma - Español: ${spanishMatches}, Inglés: ${englishMatches}, Francés: ${frenchMatches}`);
  
  // Return the language with the most matches
  if (spanishMatches > englishMatches && spanishMatches > frenchMatches) return 'es';
  if (frenchMatches > englishMatches && frenchMatches > spanishMatches) return 'fr';
  return 'en'; // Default to English if tied or no clear winner
};

// Detect platform based on column names and content patterns
const detectPlatform = (headers: string[]): string => {
  // Normalize headers for platform detection
  const joinedHeaders = headers.join(' ').toLowerCase();
  
  // Platform-specific patterns
  const metaPatterns = ['facebook', 'meta', 'fb', 'instagram', 'ig', 'adset', 'conjunto', 'anuncios'];
  const googlePatterns = ['google', 'adwords', 'cpc', 'display', 'search', 'youtube', 'campañas'];
  const xPatterns = ['twitter', 'x ', 'tweet', 'promoted', 'engagement'];
  const linkedinPatterns = ['linkedin', 'sponsored', 'content', 'inmail', 'follower'];
  const tiktokPatterns = ['tiktok', 'bytedance', 'video view', 'creatives'];
  
  // Check for platform patterns
  const metaMatches = metaPatterns.filter(pattern => joinedHeaders.includes(pattern)).length;
  const googleMatches = googlePatterns.filter(pattern => joinedHeaders.includes(pattern)).length;
  const xMatches = xPatterns.filter(pattern => joinedHeaders.includes(pattern)).length;
  const linkedinMatches = linkedinPatterns.filter(pattern => joinedHeaders.includes(pattern)).length;
  const tiktokMatches = tiktokPatterns.filter(pattern => joinedHeaders.includes(pattern)).length;
  
  console.log(`🔍 Detección de plataforma - Meta: ${metaMatches}, Google: ${googleMatches}, X: ${xMatches}, LinkedIn: ${linkedinMatches}, TikTok: ${tiktokMatches}`);
  
  // Return the platform with the most matches
  if (metaMatches > googleMatches && metaMatches > xMatches && metaMatches > linkedinMatches && metaMatches > tiktokMatches) 
    return 'Meta';
  if (googleMatches > metaMatches && googleMatches > xMatches && googleMatches > linkedinMatches && googleMatches > tiktokMatches) 
    return 'Google Ads';
  if (xMatches > metaMatches && xMatches > googleMatches && xMatches > linkedinMatches && xMatches > tiktokMatches) 
    return 'X (Twitter)';
  if (linkedinMatches > metaMatches && linkedinMatches > googleMatches && linkedinMatches > xMatches && linkedinMatches > tiktokMatches) 
    return 'LinkedIn';
  if (tiktokMatches > metaMatches && tiktokMatches > googleMatches && tiktokMatches > xMatches && tiktokMatches > linkedinMatches) 
    return 'TikTok';
  
  return 'Unknown'; // Default if no clear platform is detected
};

// Function to normalize text removing accents and lowercasing
const normalizeText = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Enhanced CSV processing with better platform and column detection
export const processCSV = (csvContent: string): CampaignData[] => {
  try {
    console.log("🔄 PROCESANDO CSV - VERSIÓN MEJORADA");
    
    // Detect delimiter automatically
    const delimiter = detectDelimiter(csvContent);
    console.log(`🔧 Delimitador seleccionado: "${delimiter}"`);
    
    // Split the lines, filter out empty lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error("El archivo CSV no contiene datos válidos o suficientes");
    }
    
    // Process header line, allowing for BOM and removing quotes
    let headerLine = lines[0].replace(/^\uFEFF/, ''); // Remove BOM if present
    headerLine = headerLine.replace(/^"/, '').replace(/"$/, ''); // Remove surrounding quotes
    
    let headers = headerLine.split(delimiter).map(header => normalizeText(header.trim()));
    
    console.log("📊 Encabezados detectados:", headers);
    
    // Detect language based on headers
    const language = detectLanguage(headers);
    console.log(`🌐 Idioma detectado: ${language}`);
    
    // Expanded field mappings for multiple languages and platforms
    const fieldMappings: Record<string, string[]> = {
      platform: ['platform', 'plataforma', 'red', 'red social', 'source', 'origen', 'canal', 'fuente', 'media source', 'plateforme'],
      campaign_name: ['campaign', 'campaign_name', 'campaña', 'nombre_campaña', 'nombre campaña', 'nombre de campaña', 'campaign name', 'kampagne', 'campagne', 'nombre campaña', 'naziv kampanje'],
      ad_set_name: ['adset', 'adset_name', 'ad set name', 'ad_set_name', 'conjunto de anuncios', 'nombre del conjunto', 'ensemble dannonces', 'nom de lensemble', 'grupo de anuncios'],
      date: ['date', 'fecha', 'day', 'día', 'mes', 'month', 'reporting_start', 'fecha_inicio', 'reporting_end', 'datum', 'date', 'periode'],
      impressions: ['impressions', 'impresiones', 'impr', 'impres', 'views', 'vistas', 'imprs', 'impression', 'impressionen', 'anzeigehäufigkeit', 'visualizaciones', 'visualizacoes', 'impressões', 'impressions', 'impr.', 'vista', 'visualizaciones', 'imprenta', 'impressione'],
      clicks: ['clicks', 'clics', 'cliques', 'click', 'clic', 'pulsaciones', 'click_total', 'all_clicks', 'klicks', 'klick', 'pulsacion', 'pulsações', 'cliques', 'toque', 'clics en el enlace', 'cliques no link', 'clics', 'clics totales', 'all clicks', 'total clicks'],
      link_clicks: ['link clicks', 'link_clicks', 'outbound clicks', 'outbound_clicks', 'clics en el enlace', 'clics de enlace', 'link_klicks', 'klicks auf links', 'cliques no link', 'cliques de lien', 'clics en enlaces', 'clicks on links'],
      conversions: ['conversions', 'conversiones', 'conv', 'converts', 'convs', 'results', 'resultados', 'outcomes', 'conversion', 'konversionen', 'umwandlungen', 'resultats', 'ergebnisse', 'resultaten', 'resultados', 'resultats', 'conversioni', 'purchase', 'purchases', 'compras', 'adquisiciones', 'achats'],
      cost: ['cost', 'costo', 'coste', 'gasto', 'spend', 'gastos', 'inversión', 'inversion', 'budget', 'presupuesto', 'kosten', 'ausgaben', 'cout', 'dépenses', 'spesa', 'speso', 'gasto', 'gastos', 'amount spent', 'importe gastado', 'valor gasto', 'montant dépensé'],
      amount_spent_eur: ['amount_spent', 'money_spent', 'importe_gastado', 'importe gastado (eur)', 'importe gastado', 'total spent', 'gasto total', 'gesamtausgaben', 'montant total', 'total gasto', 'montant dépensé'],
      revenue: ['revenue', 'ingresos', 'income', 'ganancia', 'ganancias', 'ingreso', 'purchases_value', 'conversion_value', 'valor', 'valor de la conversión', 'valor de conversão', 'einnahmen', 'umsatz', 'revenu', 'rendimentos', 'ricavi', 'total revenue', 'ingresos totales', 'purchase value', 'sales value', 'valor de venta', 'valeur des ventes'],
      ctr: ['ctr', 'click_through_rate', 'click through rate', 'tasa_clics', 'tasa de clics', 'ratio_clicks', 'durchklickrate', 'taux de clics', 'taxa de cliques', 'taux de clic', 'tasa de pulsaciones', 'ctr (%)', 'click-through rate'],
      cpc: ['cpc', 'cost_per_click', 'cost per click', 'coste_por_clic', 'coste por clic', 'costo_por_clic', 'kosten pro klick', 'cout par clic', 'costo por clique', 'cost-per-click', 'costo per clic', 'coût par clic'],
      cpm: ['cpm', 'cost_per_1000_impression', 'cost per thousand', 'coste_por_mil', 'coste por mil', 'costo_por_mil', 'kosten pro 1000', 'cout pour mille', 'costo per mille', 'coût par mille impressions', 'costo por mil impresiones']
    };
    
    // Find indices of all possible field variations
    const columnMap: Record<string, number> = {};
    
    // First try exact matches, then fuzzy matches
    Object.entries(fieldMappings).forEach(([standardField, variations]) => {
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
    });
    
    // Detect platform based on headers if not explicitly found
    let defaultPlatform = "Unknown";
    if (columnMap.platform === undefined) {
      defaultPlatform = detectPlatform(headers);
      console.log(`🔍 Plataforma detectada automáticamente: ${defaultPlatform}`);
    }
    
    console.log("🔄 Iniciando procesamiento de filas...");
    
    // Process each line of the CSV, starting with index 1 to skip header
    const results: CampaignData[] = [];
    let rowsProcessed = 0;
    let rowsSkipped = 0;
    let totalImpressions = 0;
    
    // Skip any potential header rows (sometimes CSV files have multiple header rows)
    let dataStartIndex = 1;
    while (dataStartIndex < lines.length && 
          (lines[dataStartIndex].toLowerCase().includes("total") || 
           lines[dataStartIndex].toLowerCase().includes("fecha") || 
           lines[dataStartIndex].toLowerCase().includes("date") || 
           lines[dataStartIndex].toLowerCase().includes("campaign") || 
           lines[dataStartIndex].toLowerCase().includes("campaña"))) {
      dataStartIndex++;
    }
    
    console.log(`🔍 Comenzando procesamiento desde la fila ${dataStartIndex}`);
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) {
        rowsSkipped++;
        continue;
      }
      
      // Remove quotes around the entire line if present
      const line = lines[i].replace(/^"(.*)"$/, '$1');
      let values: string[];
      
      // Handle quoted values correctly
      if (line.includes('"')) {
        const tempValues: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            tempValues.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        tempValues.push(currentValue.trim());
        values = tempValues;
      } else {
        values = line.split(delimiter).map(value => value.trim());
      }
      
      // Skip rows that are too short (badly formatted)
      if (values.length < 3) {
        console.warn(`⚠️ Saltando fila ${i} por tener menos de 3 valores`);
        rowsSkipped++;
        continue;
      }
      
      // Skip rows that are likely headers or totals
      const isLikelyHeader = values.some(value => 
        value.toLowerCase().includes('total') || 
        value.toLowerCase().includes('campaign') || 
        value.toLowerCase().includes('campaña') ||
        value.toLowerCase().includes('fecha') ||
        value.toLowerCase().includes('date')
      );
      
      if (isLikelyHeader && i > 1) {
        console.warn(`⚠️ Saltando fila ${i} por parecer un encabezado o total`);
        rowsSkipped++;
        continue;
      }

      // Extract platform - use detected platform if not found in row
      let platform = defaultPlatform;
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
          'adwords': 'Google Ads',
          'twitter': 'X (Twitter)',
          'twitter ads': 'X (Twitter)',
          'x': 'X (Twitter)',
          'linkedin': 'LinkedIn',
          'linkedin ads': 'LinkedIn',
          'tiktok': 'TikTok',
          'tik tok': 'TikTok',
          'tiktok ads': 'TikTok',
          'snap': 'Snapchat',
          'snapchat': 'Snapchat'
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
      
      // Enhanced number parsing with support for various formats
      const parseNumeric = (value: string | undefined): number => {
        if (!value || value === '--' || value === '-' || value === 'N/A' || value === '–') {
          return 0;
        }
        
        // Clean the value of currency symbols and other non-numeric characters
        let cleaned = value.replace(/[€$%]/g, '').trim();
        
        // Handle comma as decimal separator (European format)
        if (cleaned.includes(',') && !cleaned.includes('.')) {
          cleaned = cleaned.replace(',', '.');
        } 
        // Handle comma as thousands separator (US format)
        else if (cleaned.includes(',') && cleaned.includes('.')) {
          cleaned = cleaned.replace(/,/g, '');
        }
        // Handle spaces as thousands separators
        else if (cleaned.includes(' ')) {
          cleaned = cleaned.replace(/\s/g, '');
        }
        
        // Convert to number
        const num = parseFloat(cleaned);
        
        // If not a valid number, return 0
        if (isNaN(num)) {
          return 0;
        }
        
        return num;
      };
      
      // Extract impressions with improved parsing
      const impressions = columnMap.impressions !== undefined 
        ? parseNumeric(values[columnMap.impressions])
        : 0;
        
      // For debugging, log high impression values
      if (impressions > 100000) {
        console.log(`🔍 Fila ${i}: ${impressions} impresiones. Original: "${values[columnMap.impressions || 0]}"`);
      }
      
      // Accumulate total impressions for verification
      totalImpressions += impressions;
      
      // Extract clicks with improved parsing
      const rawClicks = columnMap.clicks !== undefined 
        ? parseNumeric(values[columnMap.clicks]) 
        : 0;
      const linkClicks = columnMap.link_clicks !== undefined 
        ? parseNumeric(values[columnMap.link_clicks]) 
        : 0;
      
      // Prefer link_clicks when available
      const clicks = linkClicks > 0 ? linkClicks : rawClicks;
      
      // Extract conversions
      const conversions = columnMap.conversions !== undefined 
        ? parseNumeric(values[columnMap.conversions]) 
        : 0;
      
      // Extract cost values
      const amountSpentEur = columnMap.amount_spent_eur !== undefined 
        ? parseNumeric(values[columnMap.amount_spent_eur]) 
        : 0;
      const generalCost = columnMap.cost !== undefined 
        ? parseNumeric(values[columnMap.cost]) 
        : 0;
      
      // Use the most specific cost available
      const cost = amountSpentEur > 0 ? amountSpentEur : generalCost;
      
      // Extract revenue, or if not available, calculate with estimated conversion value
      let revenue = columnMap.revenue !== undefined 
        ? parseNumeric(values[columnMap.revenue]) 
        : 0;
      
      if (revenue === 0 && conversions > 0) {
        // Default estimated value per conversion
        const estimatedValuePerConversion = 30;
        revenue = conversions * estimatedValuePerConversion;
      }
      
      // Extract or calculate derived metrics
      let ctr = columnMap.ctr !== undefined 
        ? parseNumeric(values[columnMap.ctr]) 
        : undefined;
        
      let cpc = columnMap.cpc !== undefined 
        ? parseNumeric(values[columnMap.cpc]) 
        : undefined;
        
      let cpm = columnMap.cpm !== undefined 
        ? parseNumeric(values[columnMap.cpm]) 
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
    
    // Verify total impressions
    const verifiedTotalImpressions = results.reduce((sum, item) => sum + item.impressions, 0);
    console.log(`Verificación: Total de impresiones en resultados: ${verifiedTotalImpressions}`);
    
    // Log top campaigns by impressions
    console.log("Top 5 campañas por impresiones:");
    results
      .filter(item => item.impressions > 0)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5)
      .forEach((item, index) => {
        console.log(`${index + 1}. ${item.campaign_name || 'Sin nombre'}: ${item.impressions} impresiones`);
      });
    
    return results;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Error processing CSV data. Please check the format.");
  }
};

// Improved data cleaning without excluding any valid records
export const cleanCSVData = (data: CampaignData[]): CampaignData[] => {
  console.log("🧹 Limpiando datos...");
  console.log("Total de registros antes de limpieza:", data.length);
  
  // Show total impressions before cleaning for verification
  const totalImpressionsBeforeCleaning = data.reduce((sum, item) => sum + item.impressions, 0);
  console.log(`Total de impresiones antes de limpieza: ${totalImpressionsBeforeCleaning}`);
  
  // Basic cleaning without filtering out records
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
                  item.impressions ? Number(item.impressions) : 0,
      // Ensure clicks is always a number
      clicks: typeof item.clicks === 'number' ? item.clicks : 
              item.clicks ? Number(item.clicks) : 0,
      // Ensure conversions is always a number
      conversions: typeof item.conversions === 'number' ? item.conversions : 
                  item.conversions ? Number(item.conversions) : 0,
      // Ensure cost is always a number
      cost: typeof item.cost === 'number' ? item.cost : 
            item.cost ? Number(item.cost) : 0,
      // Ensure revenue is always a number
      revenue: typeof item.revenue === 'number' ? item.revenue : 
              item.revenue ? Number(item.revenue) : 0
    };
  });
  
  // Check for campaigns with zero impressions but have other values
  const suspiciousRecords = cleanedData.filter(item => 
    item.impressions === 0 && (item.clicks > 0 || item.conversions > 0 || item.cost > 0)
  );
  
  if (suspiciousRecords.length > 0) {
    console.warn(`⚠️ Se encontraron ${suspiciousRecords.length} registros con 0 impresiones pero con otros valores`);
  }
  
  // Show total impressions after cleaning for verification
  const totalImpressionsAfterCleaning = cleanedData.reduce((sum, item) => sum + item.impressions, 0);
  console.log(`Total de impresiones después de limpieza: ${totalImpressionsAfterCleaning}`);
  
  // Log record count after cleaning
  console.log("Total de registros después de limpieza:", cleanedData.length);
  
  return cleanedData;
};

// Calculate key metrics from the processed data
export const calculateMetrics = (data: CampaignData[]) => {
  // Verify that data is valid
  if (!data || data.length === 0) {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalCost: 0,
      totalRevenue: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      conversionRate: 0,
      roi: 0
    };
  }
  
  console.log("📊 Calculando métricas con", data.length, "registros");
  
  // Log a sample of the data for verification
  console.log("🔍 Muestra de registros:", data.slice(0, 3));
  
  // Validate and ensure all metrics are numbers
  const ensureNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'number' ? value : 0;
  };
  
  // Calculate totals
  const totalImpressions = data.reduce((sum, item) => sum + ensureNumber(item.impressions), 0);
  const totalClicks = data.reduce((sum, item) => sum + ensureNumber(item.link_clicks || item.clicks), 0);
  const totalConversions = data.reduce((sum, item) => sum + ensureNumber(item.conversions), 0);
  const totalCost = data.reduce((sum, item) => sum + ensureNumber(item.amount_spent_eur || item.cost), 0);
  const totalRevenue = data.reduce((sum, item) => sum + ensureNumber(item.revenue), 0);
  
  // Calculate derived metrics
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const cpm = totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  
  // Log calculated metrics for verification
  console.log("✅ Métricas calculadas:", {
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
  });
  
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
