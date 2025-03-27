
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
  const firstLine = csvContent.split('\n')[0];
  
  // Contamos las ocurrencias de cada posible delimitador
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  console.log(`Delimitadores detectados: , (${commaCount}), ; (${semicolonCount}), \\t (${tabCount})`);
  
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

// Parse numérico mejorado con manejo específico para formato europeo
const parseEuropeanNumeric = (value: string | undefined): number => {
  if (!value) return 0;
  
  // Limpiamos el valor de símbolos de moneda y otros caracteres no numéricos
  let cleaned = value.replace(/[€$%]/g, '').trim();
  
  // Formato europeo: la coma es el separador decimal
  // Si contiene punto, asumimos que es separador de miles
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Formato europeo con separador de miles: quitar puntos y reemplazar coma por punto
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } 
  // Si solo contiene coma como posible decimal
  else if (cleaned.includes(',') && !cleaned.includes('.')) {
    cleaned = cleaned.replace(',', '.');
  }
  
  // Convertir a número
  const num = parseFloat(cleaned);
  
  // Si no es un número válido, devolver 0
  if (isNaN(num)) {
    console.warn(`Valor no numérico detectado: ${value} -> ${cleaned}`);
    return 0;
  }
  
  return num;
};

// Process CSV content to structured data with enhanced flexibility
export const processCSV = (csvContent: string): CampaignData[] => {
  try {
    // Intentamos detectar y corregir problemas de codificación
    let normalizedContent = csvContent;
    
    // Detectamos el delimitador automáticamente, preferentemente para formato europeo
    const delimiter = detectDelimiter(normalizedContent);
    console.log(`Delimitador seleccionado: "${delimiter}"`);
    
    const lines = normalizedContent.split(/\r?\n/);
    let headers = lines[0].split(delimiter).map(header => normalizeText(header.trim()));
    
    console.log("Encabezados detectados:", headers);
    
    // Handle empty lines and remove any blank headers
    const filteredLines = lines.filter(line => line.trim() !== '');
    if (filteredLines.length < 2) {
      throw new Error("El archivo CSV no contiene datos suficientes");
    }
    
    // Map column variations to standardized field names - Ampliado con variaciones europeas y multi-idioma
    const fieldMappings: Record<string, string[]> = {
      platform: ['platform', 'plataforma', 'red', 'red social', 'source', 'origen', 'canal', 'fuente', 'media source', 'publisher', 'publisher_platform', 'ad_network', 'network', 'delivery platform', 'plataforma de entrega'],
      campaign_name: ['campaign', 'campaign_name', 'campaña', 'nombre_campaña', 'nombre campaña', 'nombre de campaña', 'campaign name', 'ad_name', 'ad name', 'campana', 'campaign_id', 'id de campaña', 'id campaña'],
      ad_set_name: ['adset', 'adset_name', 'ad set name', 'ad_set_name', 'conjunto de anuncios', 'nombre del conjunto de anuncios', 'nombre del conjunto', 'adset name', 'ad set id', 'adset_id', 'conjunto'],
      date: ['date', 'fecha', 'day', 'día', 'mes', 'month', 'reporting_start', 'fecha_inicio', 'reporting_end', 'time', 'periodo', 'fecha de inicio', 'fecha de finalizacion'],
      impressions: ['impressions', 'impresiones', 'impr', 'impres', 'views', 'vistas', 'imprs', 'impression', 'alcance', 'reach', 'viewability', 'impressions_total', 'impresiones_totales', 'shown', 'displays', 'impresiones mostradas'],
      clicks: ['clicks', 'clics', 'cliques', 'click', 'clic', 'pulsaciones', 'click_total', 'all_clicks', 'total_clicks', 'clicks_all', 'total de clics'],
      link_clicks: ['link clicks', 'link_clicks', 'outbound clicks', 'outbound_clicks', 'clics en el enlace', 'clics de enlace', 'clics en enlaces', 'clics totales en el enlace'],
      conversions: ['conversions', 'conversiones', 'conv', 'converts', 'convs', 'results', 'resultados', 'outcomes', 'purchase', 'compras', 'acquisition', 'adquisiciones', 'leads', 'registros', 'sign_ups', 'leads_form', 'registrations', 'app_install', 'install', 'instalaciones', 'actions', 'complete_registration'],
      cost: ['cost', 'costo', 'coste', 'gasto', 'spend', 'gastos', 'inversión', 'inversion', 'budget', 'presupuesto', 'costo_total', 'gasto_total'],
      amount_spent_eur: ['amount_spent', 'money_spent', 'importe_gastado', 'importe gastado (eur)', 'importe gastado', 'coste (eur)', 'coste (usd)', 'amount spent (eur)', 'amount spent (€)', 'importe invertido (eur)', 'importe (eur)'],
      revenue: ['revenue', 'ingresos', 'revenue', 'income', 'ganancia', 'ganancias', 'ingreso', 'purchases_value', 'purchase_value', 'valor_compra', 'sales_amount', 'sales', 'ventas', 'sales_revenue', 'purchases', 'conversion_value', 'valor_conversion', 'revenue_total', 'valor_total', 'return', 'total_revenue', 'valor de conversion'],
      ctr: ['ctr', 'click_through_rate', 'click through rate', 'tasa_clics', 'tasa de clics', 'ratio_clicks', 'porcentaje_clics', 'porcentaje de clics en el enlace', 'ctr (all)', 'ctr (porcentaje de clics en el enlace)'],
      cpc: ['cpc', 'cost_per_click', 'cost per click', 'coste_por_clic', 'coste por clic', 'costo_por_clic', 'cpc_medio', 'average_cpc', 'costo por clic (eur)', 'costo por resultado (eur)', 'cost per link click (€)', 'costo por clic en el enlace (€)', 'cpc (costo por clic en el enlace) (eur)'],
      cpm: ['cpm', 'cost_per_1000_impression', 'cost per thousand', 'coste_por_mil', 'coste por mil impresiones', 'costo_por_mil', 'cpm_medio', 'average_cpm', 'costo por 1000 impresiones mostradas (eur)', 'cpm (cost per 1,000 impressions)', 'cpm (costo por 1.000 impresiones)', 'cpm (costo por mil impresiones) (eur)']
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
        console.log(`Campo '${standardField}' encontrado en columna: "${headers[foundIndex]}"`);
      }
    }
    
    console.log("Mapeo final de columnas:", columnMap);
    
    // Si no encontramos la plataforma, asignamos Meta/Facebook por defecto para archivos de Meta Ads
    if (columnMap.platform === undefined) {
      console.log("No se encontró columna para 'platform', asumiendo Meta/Facebook");
      
      // Intentamos detectar si es de Meta/Facebook por los nombres de columnas
      const metaSpecificColumns = ['adset_name', 'delivery_platform', 'clics en el enlace', 'importe gastado (eur)'];
      let isMeta = headers.some(header => 
        metaSpecificColumns.some(col => header.includes(normalizeText(col)))
      );
      
      if (isMeta) {
        console.log("Detectado archivo de Meta Ads por nombres de columnas específicos");
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
  
  // Contador para depuración
  let rowsProcessed = 0;
  let rowsSkipped = 0;
  let emptyDataRows = 0;
  
  // Process each line of the CSV
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
      rowsSkipped++;
      continue;
    }
    
    const values = lines[i].split(delimiter).map(value => value.trim());
    
    // Si la línea tiene muy pocos valores, probablemente está mal formateada
    if (values.length < 3) {
      console.warn(`Saltando fila ${i} por tener menos de 3 valores`);
      rowsSkipped++;
      continue;
    }

    // Extract platform - if still not found, use Meta/Facebook as default for Meta Ads files
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
        'twitter': 'X',
        'twitter ads': 'X',
        'x': 'X'
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
    
    // Extraer el posible estado de la campaña para filtrarlo después si es necesario
    let campaignStatus = "";
    if (columnMap.campaign_name !== undefined && values[columnMap.campaign_name]) {
      const campaignName = values[columnMap.campaign_name].toLowerCase();
      if (campaignName.includes("completed") || campaignName.includes("active") || 
          campaignName.includes("inactive") || campaignName.includes("recently")) {
        campaignStatus = campaignName.includes("completed") ? "completed" : 
                         campaignName.includes("active") ? "active" : 
                         campaignName.includes("recently") ? "recently_completed" : "inactive";
      }
    }
    
    // Ensure we use link_clicks when available, otherwise fallback to regular clicks
    // Extracting metrics with improved European number parsing
    const impressions = columnMap.impressions !== undefined ? parseEuropeanNumeric(values[columnMap.impressions]) : 0;
    const rawClicks = columnMap.clicks !== undefined ? parseEuropeanNumeric(values[columnMap.clicks]) : 0;
    const linkClicks = columnMap.link_clicks !== undefined ? parseEuropeanNumeric(values[columnMap.link_clicks]) : 0;
    const clicks = linkClicks > 0 ? linkClicks : rawClicks; // Prefer link_clicks when available
    
    const conversions = columnMap.conversions !== undefined ? parseEuropeanNumeric(values[columnMap.conversions]) : 0;
    
    // Para cost, preferimos amount_spent_eur cuando está disponible (más específico)
    const amountSpentEur = columnMap.amount_spent_eur !== undefined ? parseEuropeanNumeric(values[columnMap.amount_spent_eur]) : 0;
    const generalCost = columnMap.cost !== undefined ? parseEuropeanNumeric(values[columnMap.cost]) : 0;
    const cost = amountSpentEur > 0 ? amountSpentEur : generalCost;
    
    // Para revenue, si no está explícito, lo calculamos con un valor estimado por conversión
    let revenue = columnMap.revenue !== undefined ? parseEuropeanNumeric(values[columnMap.revenue]) : 0;
    if (revenue === 0 && conversions > 0) {
      // Valor estimado de conversión (esto es un estimado básico, idealmente se configuraría)
      const estimatedValuePerConversion = 30; // Valor predeterminado por conversión
      revenue = conversions * estimatedValuePerConversion;
    }
    
    // Extract or calculate derived metrics with European number parsing
    let ctr = columnMap.ctr !== undefined ? parseEuropeanNumeric(values[columnMap.ctr]) : undefined;
    let cpc = columnMap.cpc !== undefined ? parseEuropeanNumeric(values[columnMap.cpc]) : undefined;
    let cpm = columnMap.cpm !== undefined ? parseEuropeanNumeric(values[columnMap.cpm]) : undefined;
    
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
    
    // IMPORTANTE: Incluimos todas las filas, incluso si tienen datos incompletos
    
    // Campaign data object with metrics
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
      roi,
      status: campaignStatus // Guardamos el estado para depuración
    };
    
    // Log para depuración
    if (i <= 5 || i % 100 === 0) {
      console.log(`Fila ${i} procesada:`, {
        platform,
        campaign: campaignData.campaign_name,
        adSet: campaignData.ad_set_name,
        impresiones: impressions,
        clics: clicks,
        linkClics: linkClicks,
        conversiones: conversions,
        coste: cost,
        amountSpentEur: amountSpentEur
      });
    }
    
    results.push(campaignData);
    rowsProcessed++;
  }
  
  // Log de estadísticas para depuración
  console.log(`Filas procesadas: ${rowsProcessed}, Filas omitidas: ${rowsSkipped}, Filas sin datos: ${emptyDataRows}`);
  
  return results;
}

// Clean CSV data - asegura que todos los registros se incluyan
export const cleanCSVData = (data: CampaignData[]): CampaignData[] => {
  // Log para depuración
  console.log("Total de registros antes de limpieza:", data.length);
  
  // Mostrar distribución por plataforma
  const platforms = data.reduce((acc: Record<string, number>, item) => {
    const platform = item.platform || "Unknown";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});
  
  console.log("Distribución por plataforma:", platforms);
  
  // Ahora limpiamos cada elemento sin filtrar
  const cleanedData = data.map(item => {
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
  
  // Log de conteo de registros después de limpieza
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
