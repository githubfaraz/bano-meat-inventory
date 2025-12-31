import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Receipt } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ProfitLoss = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchProfitLoss();
    }
  }, [startDate, endDate]);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `${API}/reports/daily-profit-loss?start_date=${startDate}&end_date=${endDate}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch profit/loss data:", error);
      toast.error("Failed to fetch profit/loss data");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data || !data.daily_breakdown) return;

    const headers = ["Date", "Revenue", "Purchase Cost", "Expenses", "Gross Profit", "Net Profit"];
    const rows = data.daily_breakdown.map(d => [
      d.date,
      d.revenue.toFixed(2),
      d.purchase_cost.toFixed(2),
      d.expenses.toFixed(2),
      d.gross_profit.toFixed(2),
      d.net_profit.toFixed(2)
    ]);

    // Add summary row
    rows.push([]);
    rows.push(["TOTAL",
      data.summary.total_revenue.toFixed(2),
      data.summary.total_purchase_cost.toFixed(2),
      data.summary.total_expenses.toFixed(2),
      data.summary.total_gross_profit.toFixed(2),
      data.summary.total_net_profit.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `profit_loss_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Exported to CSV");
  };

  if (loading) {
    return <div className="p-8">Loading profit & loss data...</div>;
  }

  const summary = data?.summary || {};
  const dailyBreakdown = data?.daily_breakdown || [];

  return (
    <div className="p-8" data-testid="profit-loss-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Profit & Loss
        </h1>
        <p className="text-gray-600">
          Daily profit and loss analysis with revenue, costs, and expenses breakdown
        </p>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="w-full"
                disabled={!data || dailyBreakdown.length === 0}
              >
                Export to CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{summary.total_revenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-gray-500 mt-1">{summary.total_sales_count || 0} sales</p>
          </CardContent>
        </Card>

        {/* Total Costs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Costs</CardTitle>
            <Package className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{summary.total_purchase_cost?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-gray-500 mt-1">{summary.total_purchase_count || 0} purchases</p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <Receipt className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{summary.total_expenses?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-gray-500 mt-1">{summary.total_expense_count || 0} expenses</p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            {summary.total_net_profit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.total_net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{summary.total_net_profit?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.profit_margin?.toFixed(2) || "0.00"}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gross Profit Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Profit (Before Expenses)</p>
              <p className={`text-3xl font-bold mt-1 ${summary.total_gross_profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                ₹{summary.total_gross_profit?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Formula</p>
              <p className="text-xs text-gray-500 mt-1">Revenue - Purchase Costs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyBreakdown.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No data found for the selected date range</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Purchase Cost</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Gross Profit</TableHead>
                    <TableHead className="text-right">Net Profit</TableHead>
                    <TableHead className="text-center">Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyBreakdown.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDate(day.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600">
                          ₹{day.revenue.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-orange-600">
                          ₹{day.purchase_cost.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-red-600">
                          ₹{day.expenses.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${day.gross_profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                          ₹{day.gross_profit.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${day.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ₹{day.net_profit.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs text-gray-600">
                          <div>S: {day.sales_count}</div>
                          <div>P: {day.purchase_count}</div>
                          <div>E: {day.expense_count}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right text-emerald-600">
                      ₹{summary.total_revenue?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      ₹{summary.total_purchase_cost?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ₹{summary.total_expenses?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className={`text-right ${summary.total_gross_profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                      ₹{summary.total_gross_profit?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className={`text-right ${summary.total_net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ₹{summary.total_net_profit?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs">
                        <div>S: {summary.total_sales_count}</div>
                        <div>P: {summary.total_purchase_count}</div>
                        <div>E: {summary.total_expense_count}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Transaction Codes:</p>
        <div className="flex gap-6 text-xs text-gray-600">
          <span>S = Sales</span>
          <span>P = Purchases</span>
          <span>E = Expenses</span>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          <strong>Gross Profit</strong> = Revenue - Purchase Cost | <strong>Net Profit</strong> = Gross Profit - Expenses
        </p>
      </div>
    </div>
  );
};

export default ProfitLoss;
