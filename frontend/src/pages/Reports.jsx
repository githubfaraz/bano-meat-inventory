import { useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileDown, FileSpreadsheet, FileText, TrendingUp } from "lucide-react";

const Reports = () => {
  const [reportType, setReportType] = useState("sales");
  const [format, setFormat] = useState("excel");
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', `${dateRange.start_date}T00:00:00`);
      if (dateRange.end_date) params.append('end_date', `${dateRange.end_date}T23:59:59`);
      params.append('format', format);

      const response = await axios.get(`${API}/reports/${reportType}?${params.toString()}`, {
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        setPreview(response.data);
        toast.success("Report generated successfully");
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const extension = format === 'excel' ? 'xlsx' : format;
        link.setAttribute('download', `${reportType}_report.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Report downloaded successfully");
      }
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = (fmt) => {
    switch(fmt) {
      case 'excel': return <FileSpreadsheet className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'csv': return <FileDown className="h-5 w-5" />;
      default: return <FileDown className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-8" data-testid="reports-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Reports & Analytics
        </h1>
        <p className="text-gray-600">Export comprehensive business reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Export Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="report-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="purchases">Purchase Report</SelectItem>
                    <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger data-testid="report-format-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="json">Preview (JSON)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType !== "inventory" && (
                <>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={dateRange.start_date}
                      onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                      data-testid="report-start-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={dateRange.end_date}
                      onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                      data-testid="report-end-date"
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleExport}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                data-testid="generate-report-button"
              >
                {getFormatIcon(format)}
                <span className="ml-2">{loading ? "Generating..." : "Generate Report"}</span>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Export Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Excel:</strong> Best for data analysis</li>
                <li><strong>CSV:</strong> Import to other systems</li>
                <li><strong>PDF:</strong> Print-ready reports</li>
                <li><strong>Preview:</strong> View data online</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview/Description */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={reportType} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="purchases">Purchases</TabsTrigger>
                  <TabsTrigger value="profit-loss">P&L</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="space-y-4">
                  <h3 className="font-semibold text-lg">Sales Report</h3>
                  <p className="text-gray-600">Comprehensive sales analysis including:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Date and time of each sale</li>
                    <li>Customer information</li>
                    <li>Items sold with quantities</li>
                    <li>Subtotal, tax, discount, and total amounts</li>
                    <li>Payment method used</li>
                    <li>Sales trends and summaries</li>
                  </ul>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                  <h3 className="font-semibold text-lg">Inventory Report</h3>
                  <p className="text-gray-600">Current stock status including:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Product name and category</li>
                    <li>Product type (Raw Material or Derived)</li>
                    <li>Current stock quantity</li>
                    <li>Reorder level and status</li>
                    <li>Price per unit and purchase cost</li>
                    <li>Low stock alerts highlighted</li>
                  </ul>
                </TabsContent>

                <TabsContent value="purchases" className="space-y-4">
                  <h3 className="font-semibold text-lg">Purchase Report</h3>
                  <p className="text-gray-600">Raw material purchase history including:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Purchase date and time</li>
                    <li>Vendor information</li>
                    <li>Raw material details</li>
                    <li>Quantity purchased</li>
                    <li>Cost per unit and total cost</li>
                    <li>Vendor-wise spending analysis</li>
                  </ul>
                </TabsContent>

                <TabsContent value="profit-loss" className="space-y-4">
                  <h3 className="font-semibold text-lg">Profit & Loss Report</h3>
                  <p className="text-gray-600">Financial performance analysis including:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Total revenue from sales</li>
                    <li>Total purchase costs</li>
                    <li>Gross profit calculation</li>
                    <li>Profit margin percentage</li>
                    <li>Number of transactions</li>
                    <li>Period-wise comparison</li>
                  </ul>
                </TabsContent>
              </Tabs>

              {preview && format === 'json' && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Data Preview</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                    <pre className="text-xs">{JSON.stringify(preview, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
