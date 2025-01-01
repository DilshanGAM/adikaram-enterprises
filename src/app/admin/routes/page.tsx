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
import RouteForm from "@/components/ui/add-route-form";
import Modal from "@/components/ui/custom-model";
import Pagination from "@/components/ui/paginationNew";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TableSkeletonLoader from "@/components/ui/table-skeleton-loader";

interface RouteType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  route_shops: {
    route_id: string;
    shop_id: string;
    sequence_order: number;
    shop: {
      id: string;
      name: string;
      address: string;
      whatsapp_number: string;
      phone_number: string;
      lat: number;
      long: number;
    };
  }[];
}

interface PaginatedResponse {
  routes: RouteType[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function RoutesManagementPage() {
  const PAGE_SIZE = 10;

  const [state, setState] = useState({
    routes: [] as RouteType[],
    search: "",
    routesLoading: true,
    tableLoading: false,
    isAddEditModalOpen: false,
    isDeleteModalOpen: false,
    selectedRoute: null as RouteType | null,
    deleteRouteId: "",
    routeToDelete: null as RouteType | null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const [selectedRouteDetails, setSelectedRouteDetails] =
    useState<RouteType | null>(null);

  const fetchRoutes = async () => {
    setState((prev) => ({ ...prev, tableLoading: true }));
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<PaginatedResponse>("/api/routes", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: state.currentPage,
          pageSize: PAGE_SIZE,
          search: state.search,
        },
      });
      setState((prev) => ({
        ...prev,
        routes: data.routes,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        routesLoading: false,
        tableLoading: false,
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch routes");
      setState((prev) => ({
        ...prev,
        tableLoading: false,
        routesLoading: false,
      }));
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [state.currentPage, state.search]);

  useEffect(() => {
    const timer = setTimeout(
      () => setState((prev) => ({ ...prev, currentPage: 1 })),
      500
    );
    return () => clearTimeout(timer);
  }, [state.search]);

  const handleDeleteRoute = async () => {
    if (state.deleteRouteId !== state.routeToDelete?.id) {
      toast.error("Entered ID does not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/routes?id=${state.routeToDelete?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Route deleted successfully.");
      setState((prev) => ({ ...prev, isDeleteModalOpen: false }));
      fetchRoutes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete route.");
    }
  };

  const tableContent = () => {
    if (state.tableLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-[400px]">
            <TableSkeletonLoader />
          </TableCell>
        </TableRow>
      );
    }

    return state.routes.length ? (
      state.routes.map((route) => (
        <TableRow key={route.id}>
          <TableCell>{route.name}</TableCell>
          <TableCell>
            {new Date(route.created_at).toLocaleDateString()}
          </TableCell>
          <TableCell>
            {new Date(route.updated_at).toLocaleDateString()}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedRouteDetails(route)}
                className="bg-black text-white hover:bg-gray-900"
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    selectedRoute: route,
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
                    routeToDelete: route,
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
        <TableCell colSpan={4} className="h-[400px] text-center text-gray-500">
          No routes found.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Routes Management</h1>
      <div className="flex flex-col min-h-[600px]">
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search by route name"
            value={state.search}
            onChange={(e) =>
              setState((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full max-w-md"
          />
          <Button onClick={fetchRoutes}>Refresh</Button>
          <div>
            <Button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  selectedRoute: null,
                  isAddEditModalOpen: true,
                }))
              }
            >
              Add Route
            </Button>

            <Modal
              isOpen={state.isAddEditModalOpen}
              onClose={() =>
                setState((prev) => ({ ...prev, isAddEditModalOpen: false }))
              }
              title={state.selectedRoute ? "Edit Route" : "Add Route"}
            >
              <RouteForm
                route={state.selectedRoute}
                onSuccess={() => {
                  setState((prev) => ({ ...prev, isAddEditModalOpen: false }));
                  fetchRoutes();
                }}
              />
            </Modal>
          </div>
        </div>

        <Table className="">
          <TableHeader>
            <TableRow>
              {["Name", "Created At", "Updated At", "Actions"].map((header) => (
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
              Showing {state.routes.length} of {state.totalItems} routes
            </span>
            {state.totalPages > 1 && (
              <Pagination
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                onPageChange={(page) =>
                  setState((prev) => ({ ...prev, currentPage: page }))
                }
                maxVisibleButtons={5}
              />
            )}
          </div>
        </div>

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
              Enter the ID of the route (
              <strong>{state.routeToDelete?.id}</strong>) to confirm deletion.
            </p>
            <Input
              placeholder="Enter route ID"
              value={state.deleteRouteId}
              onChange={(e) =>
                setState((prev) => ({ ...prev, deleteRouteId: e.target.value }))
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
              <Button variant="destructive" onClick={handleDeleteRoute}>
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Route Details Modal */}
        {selectedRouteDetails && (
          <Modal
            isOpen={!!selectedRouteDetails}
            onClose={() => setSelectedRouteDetails(null)}
            title="Route Details"
            className="max-full mx-auto"
          >
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRouteDetails.name}
                </h2>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>
                    Created:{" "}
                    {new Date(selectedRouteDetails.created_at).toLocaleString()}
                  </p>
                  <p>
                    Updated:{" "}
                    {new Date(selectedRouteDetails.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Shops in Route</h3>
                <div className="space-y-4">
                  {selectedRouteDetails.route_shops.map((shop, index) => (
                    <div key={shop.shop.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex flex-col items-center mr-4 h-full">
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">
                            {index + 1}
                          </div>
                          {index <
                            selectedRouteDetails.route_shops.length - 1 && (
                            <div className="h-full w-[2px] bg-gray-300"></div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow max-w-[1164px] w-full overflow-auto custom-scrollbar">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">
                            {shop.shop.name}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📍 {shop.shop.address}</p>
                            <p>📞 {shop.shop.phone_number}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

/* Vertical Stepper Component */
const VerticalStepper = ({ shops }: { shops: RouteType["route_shops"] }) => (
  <div className="flex flex-col items-start">
    {shops.map((shop, index) => (
      <div key={shop.shop.id} className="flex items-start mb-6">
        {/* Step Indicator */}
        <div className="flex flex-col items-center mr-4 h-full">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">
            {index + 1}
          </div>
          {index < shops.length - 1 && (
            <div className="h-full w-[2px] bg-gray-300"></div>
          )}
        </div>

        {/* Shop Details */}
        <div className="border p-4 bg-gray-100 max-w-[800px] w-full overflow-y-auto custom-scrollbar">
          <p>
            <strong>Shop Name:</strong> {shop.shop.name}
          </p>
          <p>
            <strong>Address:</strong> {shop.shop.address}
          </p>
          <p>
            <strong>Phone:</strong> {shop.shop.phone_number}
          </p>
          <p>
            <strong>Sequence Order:</strong> {shop.sequence_order}
          </p>
        </div>
      </div>
    ))}
  </div>
);
