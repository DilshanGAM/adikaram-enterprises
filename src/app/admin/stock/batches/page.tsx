"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Pagination from "@/components/ui/paginationNew";
import AddBatchForm from "@/components/ui/add-batch-form";
import { BatchType } from "@/types/user";
import TableSkeletonLoader from "@/components/ui/table-skeleton-loader";

import { format } from 'date-fns';

// Utility function
function formatDate(dateString: string | number | Date) {
  return format(new Date(dateString), 'dd-MM-yy HH:mm');
}

export default function BatchAdminPage() {
  const PAGE_SIZE = 10;
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchType | null>(null); // For editing batches
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch batches from the API
  const fetchBatches = async () => {
    setBatchesLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/api/batches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE,
          search,
        },
      });
      setBatches(res.data.batches);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch batches");
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [currentPage, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handleAddBatch = () => {
    setSelectedBatch(null); // No batch selected for adding
    setIsAddEditModalOpen(true);
  };

  const handleEditBatch = (batch: any) => {
    setSelectedBatch(batch); // Set the batch to be edited
    setIsAddEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddEditModalOpen(false);
    fetchBatches(); // Refresh batches after adding/editing
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Batch Management</h1>

      {batchesLoading ? (      
      <TableSkeletonLoader />
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by batch ID or product name"
              value={search}
              onChange={handleSearch}
              className="w-full max-w-md"
            />
            <Button onClick={fetchBatches}>Refresh</Button>
            <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddBatch}>Add Batch</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedBatch ? "Edit Batch" : "Add Batch"}
                  </DialogTitle>
                </DialogHeader>
                <AddBatchForm
                  batch={selectedBatch}
                  onSuccess={() => handleModalClose()}
                />
              </DialogContent>
            </Dialog>
          </div>


          <div className="lg:hidden">
  {batches.length > 0 ? (
    batches.map((batch: any) => (
      <div
        key={batch.batch_id}
        className="border rounded-lg shadow-sm p-4 mb-4 bg-white"
      >
        <p className="flex justify-between">
          <strong>Batch ID:</strong> {batch.batch_id}
        </p>
        <p className="flex justify-between">
          <strong>Product Name:</strong> {batch.product_name}
        </p>
        <p className="flex justify-between">
          <strong>UOM:</strong> {batch.uom}
        </p>
        <p className="flex justify-between">
          <strong>Packs:</strong> {batch.packs}
        </p>
        <p className="flex justify-between">
          <strong>Loose:</strong> {batch.loose}
        </p>
        <p className="flex justify-between">
        <strong>MFD:</strong> {formatDate(batch.mfd)}
        </p>
        <p className="flex justify-between">
        <strong>MFD:</strong> {formatDate(batch.exp)}
        </p>
        <p className="flex justify-between">
          <strong>Cost:</strong> {batch.cost}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditBatch(batch)}
          >
            Edit
          </Button>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center">No batches found.</p>
  )}
</div>

          <div className="overflow-auto hidden lg:block">
            <Table>
              <TableCaption>A list of all batches in stock.</TableCaption>
              <TableHeader>
                <TableRow className="bg-[#dbdde2] hover:bg-[#dbdde2] font-bold text-[#4B5563]">
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Packs</TableHead>
                  <TableHead>Loose</TableHead>
                  <TableHead>MFD</TableHead>
                  <TableHead>EXP</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length > 0 ? (
                  batches.map((batch: any) => (
                    <TableRow key={batch.batch_id}>
                      <TableCell>{batch.batch_id}</TableCell>
                      <TableCell>{batch.product_name}</TableCell>
                      <TableCell>{batch.uom}</TableCell>
                      <TableCell>{batch.packs}</TableCell>
                      <TableCell>{batch.loose}</TableCell>
                      <TableCell> {formatDate(batch.mfd)}</TableCell>
                      <TableCell>{formatDate(batch.exp)}</TableCell>
                      <TableCell>{batch.cost}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBatch(batch)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      No batches found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {batches.length} of {totalItems} batches
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </>
      )}
    </div>
  );
}
