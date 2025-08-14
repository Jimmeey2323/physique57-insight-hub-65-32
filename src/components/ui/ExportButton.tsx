import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Image, 
  Settings,
  BarChart3,
  Table2,
  TrendingUp
} from 'lucide-react';
import { exportUtils, ExportOptions, ExportData } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface ExportButtonProps {
  containerId: string;
  defaultFilename: string;
  location?: string;
  dateRange?: { start: Date; end: Date };
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  containerId,
  defaultFilename,
  location,
  dateRange,
  className = '',
  size = 'default'
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    filename: defaultFilename,
    includeCharts: true,
    includeMetrics: true,
    includeTables: true,
    location,
    dateRange
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickExport = async (format: 'excel' | 'csv' | 'pdf' | 'images') => {
    setIsExporting(true);
    try {
      const data = exportUtils.collectExportData(containerId);
      
      switch (format) {
        case 'excel':
          await exportUtils.exportToExcel(data, exportOptions);
          toast.success('Excel file exported successfully!');
          break;
        case 'csv':
          if (data.tables.length > 0) {
            await exportUtils.exportToCSV(data.tables[0].data, exportOptions.filename);
            toast.success('CSV file exported successfully!');
          } else {
            toast.error('No table data available for CSV export');
          }
          break;
        case 'pdf':
          await exportUtils.exportToPDF(data, exportOptions);
          toast.success('PDF file exported successfully!');
          break;
        case 'images':
          if (data.charts.length > 0) {
            await exportUtils.exportChartsAsImages(data.charts, exportOptions.filename);
            toast.success('Chart images exported successfully!');
          } else {
            toast.error('No charts available for image export');
          }
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomExport = async () => {
    setIsExporting(true);
    try {
      const data = exportUtils.collectExportData(containerId);
      
      // Export to Excel with custom options
      await exportUtils.exportToExcel(data, exportOptions);
      toast.success('Custom export completed successfully!');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Custom export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={size}
            className={`gap-2 ${className}`}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Quick Export
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => handleQuickExport('excel')}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Excel (Complete Data)
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleQuickExport('csv')}
            className="gap-2"
          >
            <Table2 className="w-4 h-4 text-blue-600" />
            CSV (Tables Only)
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleQuickExport('pdf')}
            className="gap-2"
          >
            <FileText className="w-4 h-4 text-red-600" />
            PDF (Full Report)
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleQuickExport('images')}
            className="gap-2"
          >
            <Image className="w-4 h-4 text-purple-600" />
            PNG (Charts Only)
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Custom Export
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Custom Export Options
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    value={exportOptions.filename}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      filename: e.target.value 
                    }))}
                    placeholder="Enter filename"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Include in Export</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetrics"
                      checked={exportOptions.includeMetrics}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ 
                          ...prev, 
                          includeMetrics: !!checked 
                        }))
                      }
                    />
                    <Label htmlFor="includeMetrics" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Key Metrics
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeTables"
                      checked={exportOptions.includeTables}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ 
                          ...prev, 
                          includeTables: !!checked 
                        }))
                      }
                    />
                    <Label htmlFor="includeTables" className="flex items-center gap-2">
                      <Table2 className="w-4 h-4" />
                      Data Tables
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={exportOptions.includeCharts}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ 
                          ...prev, 
                          includeCharts: !!checked 
                        }))
                      }
                    />
                    <Label htmlFor="includeCharts" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Charts & Visualizations
                    </Label>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCustomExport}
                    disabled={isExporting}
                    className="flex-1"
                  >
                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isExporting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};