"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/paginationNew";
import TableSkeletonLoader from "@/components/ui/table-skeleton-loader";

interface TransactionType {
  id: string;
  shop_id: string;
  amount: number;
  date_created: string;
  date_paid: string | null;
  payment_method: string;
  type: string;
  shop: {
    name: string;
    address: string;
    phone_number: string;
    whatsapp_number: string;
  };
}

interface PaginatedResponse {
  transactions: TransactionType[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function TransactionManagementPage() {
  const PAGE_SIZE = 10;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [state, setState] = useState({
    transactions: [] as TransactionType[],
    search: "",
    filterType: "",
    transactionsLoading: true,
    tableLoading: false,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchTransactions = async () => {
    setState((prev) => ({ ...prev, tableLoading: true }));
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<PaginatedResponse>("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: state.currentPage,
          pageSize: PAGE_SIZE,
          search: state.search,
          type: state.filterType,
        },
      });
      setState((prev) => ({
        ...prev,
        transactions: data.transactions,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        transactionsLoading: false,
        tableLoading: false,
      }));
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch transactions"
      );
      setState((prev) => ({
        ...prev,
        tableLoading: false,
        transactionsLoading: false,
      }));
    }
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/transactions/pdf", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const transactions = response.data.transactions;

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Transactions Report", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      const tableColumn = [
        "Shop Name", 
        "Type", 
        "Amount", 
        "Created At", 
        "Paid At", 
        "Payment Method"
      ];

      const tableRows = transactions.map( (transaction :any)=> [
        transaction.shop.name,
        transaction.type,
        `Rs: ${transaction.amount.toFixed(2)}`,
        new Date(transaction.date_created).toLocaleDateString(),
        transaction.date_paid 
          ? new Date(transaction.date_paid).toLocaleDateString() 
          : "Pending",
        transaction.payment_method,
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [69, 75, 89] },
      });

      doc.save('transactions.pdf');
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [state.currentPage, state.search, state.filterType]);

  const tableContent = () => {
    if (state.tableLoading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-[400px]">
            <TableSkeletonLoader />
          </TableCell>
        </TableRow>
      );
    }

    return state?.transactions?.length ? (
      state.transactions.map((transaction) => (
        <TableRow key={transaction.id}>
          <TableCell>{transaction.shop.name}</TableCell>
          <TableCell
            className={`${
              transaction.type === "debit" ? "text-red-500" : "text-green-500"
            }`}
          >
            {transaction.type === "debit" ? "-" : "+"} {transaction.type}
          </TableCell>
          <TableCell>Rs: {transaction.amount.toFixed(2)}</TableCell>
          <TableCell>
            {new Date(transaction.date_created).toLocaleDateString()}
          </TableCell>
          <TableCell>
            {transaction.date_paid
              ? new Date(transaction.date_paid).toLocaleDateString()
              : "Pending"}
          </TableCell>
          <TableCell>{transaction.payment_method}</TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={7} className="h-[400px] text-center text-gray-500">
          No transactions found.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bills</h1>
        <Button 
          onClick={downloadPDF}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating PDF...
            </div>
          ) : (
            "Download Report"
          )}
        </Button>
      </div>

      <div className="flex flex-col min-h-[600px]">
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search by shop name or ID"
            value={state.search}
            onChange={(e) =>
              setState((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full max-w-md"
          />
          <Input
            placeholder="Filter by type (e.g., order, return)"
            value={state.filterType}
            onChange={(e) =>
              setState((prev) => ({ ...prev, filterType: e.target.value }))
            }
            className="w-full max-w-md"
          />
          <Button onClick={fetchTransactions}>Refresh</Button>
        </div>

        {/* Table View */}
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Shop Name",
                "Type",
                "Amount",
                "Created At",
                "Paid At",
                "Payment Method",
              ].map((header) => (
                <TableHead
                  key={header}
                  className="bg-[#dbdde2] font-bold text-[#4B5563]"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{tableContent()}</TableBody>
        </Table>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {state?.transactions?.length} of {state?.totalItems}{" "}
              transactions
            </span>

            <Pagination
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              onPageChange={(page) =>
                setState((prev) => ({ ...prev, currentPage: page }))
              }
              maxVisibleButtons={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}