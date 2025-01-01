"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
import ShopForm from "@/components/ui/add-shop-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Pagination from "@/components/ui/paginationNew";
import TableSkeletonLoader from "@/components/ui/table-skeleton-loader";

export const dynamic = 'force-dynamic';

interface ShopType {
  id: string;
  name: string;
  address: string;
  whatsapp_number: string;
  phone_number: string;
  lat: number;
  long: number;
}

interface PaginatedResponse {
  shops: ShopType[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function ShopsManagementPage() {
  const PAGE_SIZE = 10;
  const [state, setState] = useState({
    shops: [] as ShopType[],
    search: "",
    shopsLoading: true,
    isAddEditModalOpen: false,
    isDeleteModalOpen: false,
    selectedShop: null as ShopType | null,
    deleteShopId: "",
    shopToDelete: null as ShopType | null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchShops = async () => {
    setState((prev) => ({ ...prev, shopsLoading: true }));
    try {
      const { data } = await axios.get<PaginatedResponse>("/api/shops", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: state.currentPage,
          pageSize: PAGE_SIZE,
          search: state.search,
        },
      });
      setState((prev) => ({
        ...prev,
        shops: data.shops,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        shopsLoading: false,
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch shops");
      setState((prev) => ({ ...prev, shopsLoading: false }));
    }
  };

  useEffect(() => {
    fetchShops();
  }, [state.currentPage, state.search]);

  const handleDeleteShop = async () => {
    if (state.deleteShopId !== state.shopToDelete?.id) {
      toast.error("Entered ID does not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/shops?id=${state.shopToDelete?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Shop deleted successfully.");
      setState((prev) => ({ ...prev, isDeleteModalOpen: false }));
      fetchShops();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete shop.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Shops Management</h1>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search by name, address, or phone number"
          value={state.search}
          onChange={(e) =>
            setState((prev) => ({ ...prev, search: e.target.value }))
          }
          className="w-full max-w-md"
        />
        <Button onClick={fetchShops} disabled={state.shopsLoading}>
          {state.shopsLoading ? "Refreshing..." : "Refresh"}
        </Button>
        <Dialog
          open={state.isAddEditModalOpen}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, isAddEditModalOpen: open }))
          }
        >
          <DialogTrigger asChild>
            <Button
              onClick={() =>
                setState((prev) => ({ ...prev, selectedShop: null }))
              }
            >
              Add Shop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {state.selectedShop ? "Edit Shop" : "Add Shop"}
              </DialogTitle>
            </DialogHeader>
            <ShopForm
              shop={state.selectedShop}
              onSuccess={() => {
                setState((prev) => ({ ...prev, isAddEditModalOpen: false }));
                fetchShops();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {state.shopsLoading ? (
         <TableSkeletonLoader />
      ) : (
        <>
          {/* Card View for Small Screens */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {state.shops.length > 0 ? (
              state.shops.map((shop: ShopType) => (
                <div
                  key={shop.id}
                  className="p-4 border rounded shadow-sm bg-white flex flex-col gap-2 overflow-auto"
                >
                  <h3 className="font-bold text-lg">{shop.name}</h3>
                  <p className="text-sm text-gray-500">
                    <strong>Address:</strong> {shop.address}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Phone:</strong> {shop.phone_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>WhatsApp:</strong> {shop.whatsapp_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Latitude:</strong> {shop.lat}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Longitude:</strong> {shop.long}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          selectedShop: shop,
                          isAddEditModalOpen: true,
                        }))
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          shopToDelete: shop,
                          isDeleteModalOpen: true,
                        }))
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No shops found.</div>
            )}
          </div>

          {/* Table View for Large Screens */}
          <Table className="hidden lg:table">
            <TableHeader>
              <TableRow>
                {[
                  "Name",
                  "Address",
                  "Phone",
                  "WhatsApp",
                  "Latitude",
                  "Longitude",
                  "Actions",
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
            <TableBody>
              {state.shops.length > 0 ? (
                state.shops.map((shop: ShopType) => (
                  <TableRow key={shop.id}>
                    <TableCell>{shop.name}</TableCell>
                    <TableCell>{shop.address}</TableCell>
                    <TableCell>{shop.phone_number}</TableCell>
                    <TableCell>{shop.whatsapp_number}</TableCell>
                    <TableCell>{shop.lat}</TableCell>
                    <TableCell>{shop.long}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              selectedShop: shop,
                              isAddEditModalOpen: true,
                            }))
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              shopToDelete: shop,
                              isDeleteModalOpen: true,
                            }))
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No shops found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {state.shops.length} of {state.totalItems} shops
            </span>
            <Pagination
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              onPageChange={(page) =>
                setState((prev) => ({ ...prev, currentPage: page }))
              }
            />
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={state.isDeleteModalOpen}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, isDeleteModalOpen: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Enter the ID of the shop (
            <strong>{state.shopToDelete?.id}</strong>) to confirm deletion.
          </p>
          <Input
            placeholder="Enter shop ID"
            value={state.deleteShopId}
            onChange={(e) =>
              setState((prev) => ({ ...prev, deleteShopId: e.target.value }))
            }
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setState((prev) => ({ ...prev, isDeleteModalOpen: false }))
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteShop}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
