
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
  console.log("📋 PRIMERA LÍNEA ORIGINAL:", firstLine);
  
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
  console.log("👁️ ENCABEZADOS ORIGINALES:", headers);
  console.log("👁️ ENCABEZADOS NORMALIZADOS PARA DETECCIÓN DE IDIOMA:", normalizedHeaders);
  
  // Spanish keywords
  const spanishKeywords = ['impresiones', 'coste', 'campaña', 'resultados', 'importe', 'gastado', 'clics', 'impr', 'gasto', 'costo'];
  // English keywords
  const englishKeywords = ['impressions', 'cost', 'campaign', 'results', 'amount', 'spent', 'clicks', 'impr', 'spend'];
  // French keywords
  const frenchKeywords = ['impressions', 'coût', 'campagne', 'résultats', 'montant', 'dépensé', 'clics', 'impr', 'coût'];
  
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
  
  // Log exact matches for debugging
  console.log("🇪🇸 KEYWORDS ESPAÑOL ENCONTRADOS:");
  spanishKeywords.forEach(keyword => {
    const matchingHeaders = normalizedHeaders.filter(header => header.includes(keyword));
    if (matchingHeaders.length > 0) {
      console.log(`🇪🇸 "${keyword}" encontrado en: ${matchingHeaders.join(', ')}`);
    }
  });
  
  console.log("🇬🇧 KEYWORDS INGLÉS ENCONTRADOS:");
  englishKeywords.forEach(keyword => {
    const matchingHeaders = normalizedHeaders.filter(header => header.includes(keyword));
    if (matchingHeaders.length > 0) {
      console.log(`🇬🇧 "${keyword}" encontrado en: ${matchingHeaders.join(', ')}`);
    }
  });
  
  // Return the language with the most matches
  if (spanishMatches > englishMatches && spanishMatches > frenchMatches) return 'es';
  if (frenchMatches > englishMatches && frenchMatches > spanishMatches) return 'fr';
  return 'en'; // Default to English if tied or no clear winner
};

// Detect platform based on column names and content patterns
const detectPlatform = (headers: string[]): string => {
  // Normalize headers for platform detection
  const joinedHeaders = headers.join(' ').toLowerCase();
  console.log("🔍 ENCABEZADOS UNIDOS PARA DETECCIÓN DE PLATAFORMA:", joinedHeaders);
  
  // Platform-specific patterns
  const metaPatterns = ['facebook', 'meta', 'fb', 'instagram', 'ig', 'adset', 'conjunto', 'anuncios', 'ad account', 'cuenta', 'alcance', 'reach'];
  const googlePatterns = ['google', 'adwords', 'cpc', 'display', 'search', 'youtube', 'campañas', 'campaign', 'click type', 'tipo de clic', 'impr.', 'impr. (%)'];
  const xPatterns = ['twitter', 'x ', 'tweet', 'promoted', 'engagement', 'interacciones'];
  const linkedinPatterns = ['linkedin', 'sponsored', 'content', 'inmail', 'follower', 'seguidor'];
  const tiktokPatterns = ['tiktok', 'bytedance', 'video view', 'creatives', 'visualización'];
  
  // Check for platform patterns
  const metaMatches = metaPatterns.filter(pattern => joinedHeaders.includes(pattern));
  const googleMatches = googlePatterns.filter(pattern => joinedHeaders.includes(pattern));
  const xMatches = xPatterns.filter(pattern => joinedHeaders.includes(pattern));
  const linkedinMatches = linkedinPatterns.filter(pattern => joinedHeaders.includes(pattern));
  const tiktokMatches = tiktokPatterns.filter(pattern => joinedHeaders.includes(pattern));
  
  console.log(`🔍 Términos de Meta encontrados: ${metaMatches.join(', ')}`);
  console.log(`🔍 Términos de Google encontrados: ${googleMatches.join(', ')}`);
  console.log(`🔍 Términos de X encontrados: ${xMatches.join(', ')}`);
  console.log(`🔍 Términos de LinkedIn encontrados: ${linkedinMatches.join(', ')}`);
  console.log(`🔍 Términos de TikTok encontrados: ${tiktokMatches.join(', ')}`);
  
  console.log(`🔍 Matches por plataforma - Meta: ${metaMatches.length}, Google: ${googleMatches.length}, X: ${xMatches.length}, LinkedIn: ${linkedinMatches.length}, TikTok: ${tiktokMatches.length}`);
  
  // Return the platform with the most matches
  if (metaMatches.length > googleMatches.length && metaMatches.length > xMatches.length && metaMatches.length > linkedinMatches.length && metaMatches.length > tiktokMatches.length) 
    return 'Meta';
  if (googleMatches.length > metaMatches.length && googleMatches.length > xMatches.length && googleMatches.length > linkedinMatches.length && googleMatches.length > tiktokMatches.length) 
    return 'Google Ads';
  if (xMatches.length > metaMatches.length && xMatches.length > googleMatches.length && xMatches.length > linkedinMatches.length && xMatches.length > tiktokMatches.length) 
    return 'X (Twitter)';
  if (linkedinMatches.length > metaMatches.length && linkedinMatches.length > googleMatches.length && linkedinMatches.length > xMatches.length && linkedinMatches.length > tiktokMatches.length) 
    return 'LinkedIn';
  if (tiktokMatches.length > metaMatches.length && tiktokMatches.length > googleMatches.length && tiktokMatches.length > xMatches.length && tiktokMatches.length > linkedinMatches.length) 
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
    console.log("🔄 PROCESANDO CSV - VERSIÓN MEJORADA 3.0");
    
    // Detect delimiter automatically
    const delimiter = detectDelimiter(csvContent);
    console.log(`🔧 Delimitador seleccionado: "${delimiter === '\t' ? 'tabulador' : delimiter}"`);
    
    // Split the lines, filter out empty lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error("El archivo CSV no contiene datos válidos o suficientes");
    }
    
    // Process header line, allowing for BOM and removing quotes
    let headerLine = lines[0].replace(/^\uFEFF/, ''); // Remove BOM if present
    headerLine = headerLine.replace(/^"/, '').replace(/"$/, ''); // Remove surrounding quotes
    
    let headers = headerLine.split(delimiter).map(header => header.trim());
    let normalizedHeaders = headers.map(header => normalizeText(header));
    
    console.log("📊 ENCABEZADOS DETECTADOS (ORIGINALES):", headers);
    console.log("📊 ENCABEZADOS NORMALIZADOS:", normalizedHeaders);
    
    // Detect language based on headers
    const language = detectLanguage(headers);
    console.log(`🌐 Idioma detectado: ${language}`);
    
    // Expanded field mappings for multiple languages and platforms
    const fieldMappings: Record<string, string[]> = {
      platform: ['platform', 'plataforma', 'red', 'red social', 'source', 'origen', 'canal', 'fuente', 'media source', 'plateforme', 'network', 'red'],
      campaign_name: ['campaign', 'campaign_name', 'campaña', 'nombre_campaña', 'nombre campaña', 'nombre de campaña', 'campaign name', 'kampagne', 'campagne', 'nombre campaña', 'naziv kampanje', 'nombre'],
      ad_set_name: ['adset', 'adset_name', 'ad set name', 'ad_set_name', 'conjunto de anuncios', 'nombre del conjunto', 'ensemble dannonces', 'nom de lensemble', 'grupo de anuncios', 'conjunto'],
      date: ['date', 'fecha', 'day', 'día', 'mes', 'month', 'reporting_start', 'fecha_inicio', 'reporting_end', 'datum', 'date', 'periode', 'fecha de informe', 'periodo'],
      impressions: ['impressions', 'impresiones', 'impr', 'impres', 'views', 'vistas', 'imprs', 'impression', 'impressionen', 'anzeigehäufigkeit', 'visualizaciones', 'visualizacoes', 'impressões', 'impr.', 'vista', 'visualizaciones', 'imprenta', 'impressione', 'impressions', 'impr.', 'impressions served', 'impresiones servidas', 'impresiones mostradas'],
      clicks: ['clicks', 'clics', 'cliques', 'click', 'clic', 'pulsaciones', 'click_total', 'all_clicks', 'klicks', 'klick', 'pulsacion', 'pulsações', 'cliques', 'toque', 'clics en el enlace', 'cliques no link', 'clics', 'clics totales', 'all clicks', 'total clicks', 'engagement', 'total de clics'],
      link_clicks: ['link clicks', 'link_clicks', 'outbound clicks', 'outbound_clicks', 'clics en el enlace', 'clics de enlace', 'link_klicks', 'klicks auf links', 'cliques no link', 'cliques de lien', 'clics en enlaces', 'clicks on links', 'website clicks', 'clics de sitio web', 'clics sitio web'],
      conversions: ['conversions', 'conversiones', 'conv', 'converts', 'convs', 'results', 'resultados', 'outcomes', 'conversion', 'konversionen', 'umwandlungen', 'resultats', 'ergebnisse', 'resultaten', 'resultados', 'resultats', 'conversioni', 'purchase', 'purchases', 'compras', 'adquisiciones', 'achats', 'all conv.', 'todas las conv.'],
      cost: ['cost', 'costo', 'coste', 'gasto', 'spend', 'gastos', 'inversión', 'inversion', 'budget', 'presupuesto', 'kosten', 'ausgaben', 'cout', 'dépenses', 'spesa', 'speso', 'gasto', 'gastos', 'amount spent', 'importe gastado', 'valor gasto', 'montant dépensé', 'coste (eur)', 'cost (eur)'],
      amount_spent_eur: ['amount_spent', 'money_spent', 'importe_gastado', 'importe gastado (eur)', 'importe gastado', 'total spent', 'gasto total', 'gesamtausgaben', 'montant total', 'total gasto', 'montant dépensé', 'cost (eur)', 'coste (eur)', 'coste (€)', 'cost (€)'],
      revenue: ['revenue', 'ingresos', 'income', 'ganancia', 'ganancias', 'ingreso', 'purchases_value', 'conversion_value', 'valor', 'valor de la conversión', 'valor de conversão', 'einnahmen', 'umsatz', 'revenu', 'rendimentos', 'ricavi', 'total revenue', 'ingresos totales', 'purchase value', 'sales value', 'valor de venta', 'valeur des ventes', 'conv. value', 'valor de conv.'],
      ctr: ['ctr', 'click_through_rate', 'click through rate', 'tasa_clics', 'tasa de clics', 'ratio_clicks', 'durchklickrate', 'taux de clics', 'taxa de cliques', 'taux de clic', 'tasa de pulsaciones', 'ctr (%)', 'click-through rate', 'porcentaje de clics'],
      cpc: ['cpc', 'cost_per_click', 'cost per click', 'coste_por_clic', 'coste por clic', 'costo_por_clic', 'kosten pro klick', 'cout par clic', 'costo por clique', 'cost-per-click', 'costo per clic', 'coût par clic', 'avg. cpc', 'cpc promedio'],
      cpm: ['cpm', 'cost_per_1000_impression', 'cost per thousand', 'coste_por_mil', 'coste por mil', 'costo_por_mil', 'kosten pro 1000', 'cout pour mille', 'costo per mille', 'coût par mille impressions', 'costo por mil impresiones', 'avg. cpm', 'cpm promedio']
    };
    
    // Find indices of all possible field variations with improved logging
    const columnMap: Record<string, number> = {};
    
    // Log each header for visual inspection
    headers.forEach((header, index) => {
      console.log(`📋 Encabezado ${index}: "${header}" (Normalizado: "${normalizeText(header)}")`);
    });
    
    // Try exact and partial matches for each field with detailed logging
    Object.entries(fieldMappings).forEach(([standardField, variations]) => {
      console.log(`🔍 Buscando campo '${standardField}' en las siguientes variaciones: ${variations.join(', ')}`);
      
      // Try exact match first
      let foundExact = normalizedHeaders.findIndex(header => 
        variations.some(variation => normalizeText(variation) === header)
      );
      
      // Log exact match attempt
      if (foundExact !== -1) {
        console.log(`✅ MATCH EXACTO para '${standardField}': "${headers[foundExact]}" (índice ${foundExact})`);
        columnMap[standardField] = foundExact;
        return;
      } else {
        console.log(`❌ No se encontró match exacto para '${standardField}'`);
      }
      
      // If not found, try partial match with more permissive matching
      for (let i = 0; i < normalizedHeaders.length; i++) {
        const header = normalizedHeaders[i];
        const originalHeader = headers[i];
        
        for (const variation of variations) {
          const normalizedVariation = normalizeText(variation);
          
          // Check if header contains the variation or variation contains the header
          if (header.includes(normalizedVariation) || normalizedVariation.includes(header)) {
            console.log(`✅ MATCH PARCIAL para '${standardField}': "${originalHeader}" contiene o está contenido en "${variation}" (índice ${i})`);
            columnMap[standardField] = i;
            return;
          }
          
          // Special case for abbreviations (e.g., "impr." matching "impressions")
          if (normalizedVariation.startsWith(header.substring(0, Math.min(4, header.length)))) {
            console.log(`✅ MATCH ABREVIACIÓN para '${standardField}': "${originalHeader}" es abreviación de "${variation}" (índice ${i})`);
            columnMap[standardField] = i;
            return;
          }
        }
      }
      
      console.log(`❌ No se pudo mapear el campo '${standardField}' a ninguna columna`);
    });
    
    // Detect platform based on headers if not explicitly found
    let defaultPlatform = "Unknown";
    if (columnMap.platform === undefined) {
      defaultPlatform = detectPlatform(headers);
      console.log(`🔍 Plataforma detectada automáticamente: ${defaultPlatform}`);
    }
    
    console.log("🔄 MAPA DE COLUMNAS FINAL:");
    Object.entries(columnMap).forEach(([field, index]) => {
      console.log(`📊 ${field} = "${headers[index]}" (índice ${index})`);
    });
    
    console.log("🔄 Iniciando procesamiento de filas...");
    
    // Process each line of the CSV, starting with index 1 to skip header
    const results: CampaignData[] = [];
    let rowsProcessed = 0;
    let rowsSkipped = 0;
    let totalImpressions = 0;
    
    // Skip any potential header rows (sometimes CSV files have multiple header rows)
    let dataStartIndex = 1;
    // Check more header-like patterns, including dates in format DD/MM/YYYY
    const datePattern = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/;
    
    while (dataStartIndex < lines.length && 
          (lines[dataStartIndex].toLowerCase().includes("total") || 
           lines[dataStartIndex].toLowerCase().includes("fecha") || 
           lines[dataStartIndex].toLowerCase().includes("date") || 
           lines[dataStartIndex].toLowerCase().includes("campaign") || 
           lines[dataStartIndex].toLowerCase().includes("campaña") ||
           datePattern.test(lines[dataStartIndex].split(delimiter)[0].trim()))) {
      console.log(`⏭️ Saltando línea de tipo encabezado: "${lines[dataStartIndex].substring(0, 50)}..."`);
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

      // Log values for first few rows and periodic samples
      if (i <= 5 || (i % 50 === 0 && i <= 200)) {
        console.log(`🔍 VALORES DE LA FILA ${i}:`, values);
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
        if (!value || value === '--' || value === '-' || value === 'N/A' || value === '–' || value === '') {
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
      
      // Extract fields with debug logging for non-zero values
      const getCampaignField = (fieldName: string, defaultValue: any = undefined) => {
        const index = columnMap[fieldName];
        if (index === undefined || index >= values.length) {
          return defaultValue;
        }
        
        const originalValue = values[index];
        
        // For numeric fields, try to parse
        if (['impressions', 'clicks', 'link_clicks', 'conversions', 'cost', 'amount_spent_eur', 'revenue'].includes(fieldName)) {
          const numericValue = parseNumeric(originalValue);
          
          // Log significant values
          if (numericValue > 0) {
            console.log(`📈 Fila ${i}: ${fieldName} - Original: "${originalValue}", Parseado: ${numericValue}`);
          }
          
          return numericValue;
        }
        
        return originalValue;
      };
      
      // Extract impressions with improved parsing
      const impressions = getCampaignField('impressions', 0);
      const clicks = getCampaignField('clicks', 0);
      const linkClicks = getCampaignField('link_clicks', 0);
      const conversions = getCampaignField('conversions', 0);
      const amountSpentEur = getCampaignField('amount_spent_eur', 0);
      const cost = getCampaignField('cost', 0);
      const revenue = getCampaignField('revenue', 0);
      const ctr = getCampaignField('ctr');
      const cpc = getCampaignField('cpc');
      const cpm = getCampaignField('cpm');
      const campaignName = getCampaignField('campaign_name', '');
      const adSetName = getCampaignField('ad_set_name', '');
      const date = getCampaignField('date', '');
      
      // Accumulate total impressions for verification
      totalImpressions += impressions;
      
      // Prefer link_clicks when available
      const finalClicks = linkClicks > 0 ? linkClicks : clicks;
      
      // Use the most specific cost available
      const finalCost = amountSpentEur > 0 ? amountSpentEur : cost;
      
      // Calculate derived metrics if not available
      let finalCtr = typeof ctr === 'number' ? ctr : undefined;
      let finalCpc = typeof cpc === 'number' ? cpc : undefined;
      let finalCpm = typeof cpm === 'number' ? cpm : undefined;
      
      if (finalCtr === undefined && impressions > 0) {
        finalCtr = (finalClicks / impressions) * 100;
      }
      
      if (finalCpc === undefined && finalClicks > 0) {
        finalCpc = finalCost / finalClicks;
      }
      
      if (finalCpm === undefined && impressions > 0) {
        finalCpm = (finalCost / impressions) * 1000;
      }
      
      // Calculate ROI
      const roi = finalCost > 0 ? ((revenue - finalCost) / finalCost) * 100 : 0;
      
      // Create campaign data object with metrics
      const campaignData: CampaignData = {
        platform,
        campaign_name: campaignName || undefined,
        ad_set_name: adSetName || undefined,
        date: date || undefined,
        impressions,
        clicks: finalClicks,
        link_clicks: linkClicks,
        conversions,
        cost: finalCost,
        amount_spent_eur: amountSpentEur,
        revenue,
        ctr: finalCtr,
        cpc: finalCpc,
        cpm: finalCpm,
        roi
      };
      
      // Log complete object for debugging (for a sample of rows)
      if (i <= 5 || (i % 50 === 0 && i <= 100) || impressions > 1000) {
        console.log(`📊 Objeto completo fila ${i}:`, campaignData);
      }
      
      // Only add rows with at least one non-zero metric
      if (impressions > 0 || finalClicks > 0 || conversions > 0 || finalCost > 0 || revenue > 0) {
        results.push(campaignData);
        rowsProcessed++;
      } else {
        console.warn(`⚠️ Saltando fila ${i} por no tener ninguna métrica > 0`);
        rowsSkipped++;
      }
      
      // Log progress periodically
      if (i % 100 === 0 || i === lines.length - 1) {
        console.log(`Progreso: ${i}/${lines.length-1} filas procesadas. Impresiones hasta ahora: ${totalImpressions}`);
      }
    }
    
    // Log statistics for debugging
    console.log(`🔄 Filas procesadas: ${rowsProcessed}, Filas omitidas: ${rowsSkipped}`);
    console.log(`📊 Total de impresiones encontradas: ${totalImpressions}`);
    
    // Verify total impressions
    const verifiedTotalImpressions = results.reduce((sum, item) => sum + item.impressions, 0);
    console.log(`✅ Verificación: Total de impresiones en resultados: ${verifiedTotalImpressions}`);
    
    // Log top campaigns by impressions
    console.log("📈 Top 5 campañas por impresiones:");
    results
      .filter(item => item.impressions > 0)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5)
      .forEach((item, index) => {
        console.log(`${index + 1}. ${item.campaign_name || 'Sin nombre'}: ${item.impressions} impresiones`);
      });
    
    return results;
  } catch (error) {
    console.error("❌ Error parsing CSV:", error);
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
