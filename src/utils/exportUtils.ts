export interface ExportOptions {
  filename: string;
  includeCharts?: boolean;
  includeMetrics?: boolean;
  includeTables?: boolean;
  location?: string;
  dateRange?: { start: Date; end: Date };
}

export interface ExportData {
  metrics: Array<{
    title: string;
    value: string;
    subtitle?: string;
  }>;
  tables: Array<{
    name: string;
    headers: string[];
    data: any[][];
  }>;
  charts: Array<{
    name: string;
    element: HTMLElement;
  }>;
  metadata: {
    exportDate: string;
    location?: string;
    dateRange?: string;
  };
}

class ExportUtils {
  collectExportData(containerId: string): ExportData {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container with id "${containerId}" not found`);
      return this.getEmptyExportData();
    }

    console.log('Collecting export data from container:', containerId);

    // Collect metrics from cards with data attributes
    const metrics = this.collectMetrics(container);
    console.log('Collected metrics:', metrics.length);

    // Collect table data from all tables in the container
    const tables = this.collectTables(container);
    console.log('Collected tables:', tables.length);

    // Collect charts
    const charts = this.collectCharts(container);
    console.log('Collected charts:', charts.length);

    return {
      metrics,
      tables,
      charts,
      metadata: {
        exportDate: new Date().toISOString(),
        location: 'Studio Analysis',
        dateRange: 'Previous Month'
      }
    };
  }

  private collectMetrics(container: HTMLElement): ExportData['metrics'] {
    const metrics: ExportData['metrics'] = [];
    
    // Look for metric cards
    const metricCards = container.querySelectorAll('[data-metric-card], .metric-card, [data-export-metric]');
    
    metricCards.forEach(card => {
      const titleElement = card.querySelector('h3, .metric-title, [data-metric-title]');
      const valueElement = card.querySelector('.metric-value, [data-metric-value], .text-2xl, .text-3xl, .text-4xl');
      const subtitleElement = card.querySelector('.metric-subtitle, [data-metric-subtitle], .text-sm, .text-xs');
      
      if (titleElement && valueElement) {
        metrics.push({
          title: titleElement.textContent?.trim() || 'Unknown Metric',
          value: valueElement.textContent?.trim() || '0',
          subtitle: subtitleElement?.textContent?.trim()
        });
      }
    });

    return metrics;
  }

  private collectTables(container: HTMLElement): ExportData['tables'] {
    const tables: ExportData['tables'] = [];
    
    // Find all tables with export attributes or within export containers
    const exportTables = container.querySelectorAll('table[data-export-table], [data-export-container] table, .sessions-table table');
    
    exportTables.forEach(table => {
      const tableName = table.getAttribute('data-table-name') || 
                       table.closest('[data-container-name]')?.getAttribute('data-container-name') || 
                       'Data Table';
      
      console.log('Processing table:', tableName);
      
      // Get headers
      const headerRows = table.querySelectorAll('thead tr');
      const headers: string[] = [];
      
      if (headerRows.length > 0) {
        const headerCells = headerRows[0].querySelectorAll('th');
        headerCells.forEach(cell => {
          headers.push(cell.textContent?.trim() || '');
        });
      }

      // Get data rows
      const dataRows: any[][] = [];
      const bodyRows = table.querySelectorAll('tbody tr');
      
      bodyRows.forEach(row => {
        // Skip expanded detail rows (they usually have specific classes or are nested)
        const rowElement = row as HTMLElement;
        if (row.classList.contains('expanded-row') || 
            row.querySelector('.pl-12') || 
            rowElement.style.backgroundColor?.includes('blue-50')) {
          return;
        }
        
        const cells = row.querySelectorAll('td');
        const rowData: string[] = [];
        
        cells.forEach(cell => {
          // Get text content, but skip action buttons
          if (!cell.querySelector('button[aria-label]') && !cell.classList.contains('actions-cell')) {
            let cellText = cell.textContent?.trim() || '';
            
            // Clean up the text (remove extra whitespace)
            cellText = cellText.replace(/\s+/g, ' ').trim();
            rowData.push(cellText);
          }
        });
        
        if (rowData.length > 0) {
          dataRows.push(rowData);
        }
      });

      // Also collect data from list-style components (top/bottom lists)
      if (dataRows.length === 0) {
        const listItems = container.querySelectorAll('[data-export-table] .space-y-1 > div, [data-table-name] .space-y-1 > div');
        listItems.forEach(item => {
          const nameElement = item.querySelector('.font-medium, .text-gray-900');
          const valueElement = item.querySelector('.text-lg, .font-semibold');
          const badgeElement = item.querySelector('.badge, [class*="bg-"]');
          
          if (nameElement && valueElement) {
            const rowData = [
              nameElement.textContent?.trim() || '',
              valueElement.textContent?.trim() || '',
              badgeElement?.textContent?.trim() || ''
            ];
            dataRows.push(rowData);
          }
        });
        
        // Set appropriate headers for list data
        if (dataRows.length > 0 && headers.length === 0) {
          headers.push('Name', 'Value', 'Status');
        }
      }
      
      if (headers.length > 0 && dataRows.length > 0) {
        tables.push({
          name: tableName,
          headers: headers.slice(0, -1), // Remove last column (usually actions)
          data: dataRows.map(row => row.slice(0, -1)) // Remove last column data
        });
      }
    });

    return tables;
  }

  private collectCharts(container: HTMLElement): ExportData['charts'] {
    const charts: ExportData['charts'] = [];
    
    // Look for chart containers
    const chartElements = container.querySelectorAll('.recharts-responsive-container, [data-chart], .chart-container');
    
    chartElements.forEach((element, index) => {
      const chartName = element.getAttribute('data-chart-name') || 
                       element.closest('[data-container-name]')?.getAttribute('data-container-name') || 
                       `Chart ${index + 1}`;
      
      charts.push({
        name: chartName,
        element: element as HTMLElement
      });
    });

    return charts;
  }

  private getEmptyExportData(): ExportData {
    return {
      metrics: [],
      tables: [],
      charts: [],
      metadata: {
        exportDate: new Date().toISOString()
      }
    };
  }

  async exportToExcel(data: ExportData, options: ExportOptions): Promise<void> {
    const { utils, writeFile } = await import('xlsx');
    
    const workbook = utils.book_new();
    
    // Add metrics sheet
    if (options.includeMetrics && data.metrics.length > 0) {
      const metricsData = [
        ['Metric', 'Value', 'Details'],
        ...data.metrics.map(m => [m.title, m.value, m.subtitle || ''])
      ];
      const metricsSheet = utils.aoa_to_sheet(metricsData);
      utils.book_append_sheet(workbook, metricsSheet, 'Metrics');
    }
    
    // Add table sheets
    if (options.includeTables && data.tables.length > 0) {
      data.tables.forEach((table, index) => {
        const tableData = [table.headers, ...table.data];
        const sheet = utils.aoa_to_sheet(tableData);
        
        // Truncate sheet name to fit Excel limits (31 chars max)
        let sheetName = table.name.substring(0, 28);
        if (data.tables.length > 1) {
          sheetName = `${sheetName}_${index + 1}`;
        }
        
        utils.book_append_sheet(workbook, sheet, sheetName);
      });
    }
    
    // Add metadata sheet
    const metadataData = [
      ['Export Information', ''],
      ['Export Date', data.metadata.exportDate],
      ['Location', data.metadata.location || ''],
      ['Date Range', data.metadata.dateRange || ''],
      ['', ''],
      ['Summary', ''],
      ['Total Metrics', data.metrics.length.toString()],
      ['Total Tables', data.tables.length.toString()],
      ['Total Charts', data.charts.length.toString()]
    ];
    const metadataSheet = utils.aoa_to_sheet(metadataData);
    utils.book_append_sheet(workbook, metadataSheet, 'Export Info');
    
    writeFile(workbook, `${options.filename}.xlsx`);
  }

  async exportToCSV(tableData: any[][], filename: string): Promise<void> {
    const { utils, writeFile } = await import('xlsx');
    
    const sheet = utils.aoa_to_sheet(tableData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, 'Data');
    
    writeFile(workbook, `${filename}.csv`);
  }

  async exportToPDF(data: ExportData, options: ExportOptions): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    let yPosition = 20;
    
    // Title
    doc.setFontSize(20);
    doc.text(options.filename, 20, yPosition);
    yPosition += 20;
    
    // Export info
    doc.setFontSize(12);
    doc.text(`Export Date: ${new Date(data.metadata.exportDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    
    if (data.metadata.location) {
      doc.text(`Location: ${data.metadata.location}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.metadata.dateRange) {
      doc.text(`Date Range: ${data.metadata.dateRange}`, 20, yPosition);
      yPosition += 15;
    }
    
    // Metrics
    if (options.includeMetrics && data.metrics.length > 0) {
      doc.setFontSize(16);
      doc.text('Key Metrics', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      data.metrics.forEach(metric => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${metric.title}: ${metric.value}`, 25, yPosition);
        if (metric.subtitle) {
          yPosition += 7;
          doc.text(`  ${metric.subtitle}`, 25, yPosition);
        }
        yPosition += 10;
      });
      yPosition += 10;
    }
    
    // Tables summary
    if (options.includeTables && data.tables.length > 0) {
      doc.setFontSize(16);
      doc.text('Data Tables', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      data.tables.forEach(table => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${table.name}: ${table.data.length} rows`, 25, yPosition);
        yPosition += 10;
      });
    }
    
    doc.save(`${options.filename}.pdf`);
  }

  async exportChartsAsImages(charts: ExportData['charts'], filename: string): Promise<void> {
    const JSZip = (await import('jszip')).default;
    const html2canvas = (await import('html2canvas')).default;
    
    const zip = new JSZip();
    
    for (let i = 0; i < charts.length; i++) {
      const chart = charts[i];
      try {
        const canvas = await html2canvas(chart.element, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        
        const imgData = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
        zip.file(`${chart.name.replace(/[^a-zA-Z0-9]/g, '_')}_${i + 1}.png`, imgData, { base64: true });
      } catch (error) {
        console.error(`Failed to export chart ${chart.name}:`, error);
      }
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_charts.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const exportUtils = new ExportUtils();
