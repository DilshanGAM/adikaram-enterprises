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
import TripForm from "@/components/ui/add-trip-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Pagination from "@/components/ui/paginationNew";
import TableSkeletonLoader from "@/components/ui/table-skeleton-loader";
import { Badge } from "@/components/ui/badge";

interface TripType {
  id: string;
  route_id: string;
  assigned_to: string;
  trip_date: Date;
  verified_by: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  route: {
    name: string;
  };
  trip_orders: {
    order: {
      id: string;
      total_amount: number;
      status: string;
      type: string;
      shop: {
        name: string;
      };
    };
    sequence_order: number;
  }[];
}

interface PaginatedResponse {
  trips: TripType[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function TripsManagementPage() {
  const PAGE_SIZE = 10;
  const [state, setState] = useState({
    trips: [] as TripType[],
    search: "",
    tripsLoading: true,
    tableLoading: false,
    isAddEditModalOpen: false,
    isDeleteModalOpen: false,
    selectedTrip: null as TripType | null,
    deleteTripId: "",
    tripToDelete: null as TripType | null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchTrips = async () => {
    setState((prev) => ({ ...prev, tableLoading: true }));
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<PaginatedResponse>("/api/trips", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: state.currentPage,
          pageSize: PAGE_SIZE,
          search: state.search,
        },
      });
      setState((prev) => ({
        ...prev,
        trips: data.trips,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        totalItems: data.totalItems,
        tripsLoading: false,
        tableLoading: false,
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch trips");
      setState((prev) => ({
        ...prev,
        tableLoading: false,
        tripsLoading: false,
      }));
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [state.currentPage, state.search]);

  useEffect(() => {
    const timer = setTimeout(
      () => setState((prev) => ({ ...prev, currentPage: 1 })),
      500
    );
    return () => clearTimeout(timer);
  }, [state.search]);

  const handleDeleteTrip = async () => {
    if (state.deleteTripId !== state.tripToDelete?.id) {
      toast.error("Entered ID does not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/trips?id=${state.tripToDelete?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Trip deleted successfully.");
      setState((prev) => ({ ...prev, isDeleteModalOpen: false }));
      fetchTrips();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete trip.");
    }
  };

  const handleVerifyTrip = async (tripId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/trips/verify?id=${tripId}`,
        {
          is_verified: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Trip verified successfully.");
      fetchTrips();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to verify trip.");
    }
  };

  const getTotalOrders = (trip: TripType) => trip.trip_orders.length;

  const getTotalAmount = (trip: TripType) => {
    return trip.trip_orders.reduce((sum, to) => sum + to.order.total_amount, 0);
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

    return state?.trips?.length ? (
      state.trips.map((trip) => (
        <TableRow key={trip.id}>
          <TableCell>{trip.route.name}</TableCell>
          <TableCell>{trip.assigned_to}</TableCell>
          <TableCell>{getTotalOrders(trip)} orders</TableCell>
          <TableCell>Rs: {getTotalAmount(trip).toFixed(2)}</TableCell>
          <TableCell>
            {new Date(trip.trip_date).toLocaleDateString()}
          </TableCell>
          <TableCell>
            <Badge variant={trip.is_verified ? "default" : "secondary"}>
              {trip.is_verified ? "Verified" : "Pending"}
            </Badge>
          </TableCell>
          <TableCell>{trip.verified_by || "Not verified"}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    selectedTrip: trip,
                    isAddEditModalOpen: true,
                  }))
                }
              >
                Edit
              </Button>
              {!trip.is_verified && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleVerifyTrip(trip.id)}
                >
                  Verify
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    tripToDelete: trip,
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
        <TableCell colSpan={8} className="h-[400px] text-center text-gray-500">
          No trips found.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trips Management</h1>
      <div className="flex flex-col min-h-[600px]">
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search by route name or assigned to"
            value={state.search}
            onChange={(e) =>
              setState((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-full max-w-md"
          />
          <Button onClick={fetchTrips}>Refresh</Button>
          <Dialog
            open={state.isAddEditModalOpen}
            onOpenChange={(open) =>
              setState((prev) => ({ ...prev, isAddEditModalOpen: open }))
            }
          >
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setState((prev) => ({ ...prev, selectedTrip: null }))
                }
              >
                Add Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {state.selectedTrip ? "Edit Trip" : "Add Trip"}
                </DialogTitle>
              </DialogHeader>
              <TripForm
                trip={state.selectedTrip}
                onSuccess={() => {
                  setState((prev) => ({ ...prev, isAddEditModalOpen: false }));
                  fetchTrips();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Card View for Small Screens */}
        <div className="lg:hidden grid grid-cols-1 gap-4">
          {state.trips.length > 0 ? (
            state.trips.map((trip) => (
              <div
                key={trip.id}
                className="p-4 border rounded shadow-sm bg-white flex flex-col gap-2"
              >
                <h3 className="font-bold text-lg">{trip.route.name}</h3>
                <p className="text-sm text-gray-500 flex justify-between">
                  <strong>Assigned To:</strong> {trip.assigned_to}
                </p>
                <p className="text-sm text-gray-500 flex justify-between">
                  <strong>Orders:</strong> {getTotalOrders(trip)} orders
                </p>
                <p className="text-sm text-gray-500 flex justify-between">
                  <strong>Total Amount:</strong> Rs:{" "}
                  {getTotalAmount(trip).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 flex justify-between">
                  <strong>Trip Date:</strong>{" "}
                  {new Date(trip.trip_date).toLocaleDateString()}
                </p>
                <div className="text-sm text-gray-500 flex justify-between">
                  <strong>Status:</strong>{" "}
                  <Badge variant={trip.is_verified ? "default" : "secondary"}>
                    {trip.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 flex justify-between">
                  <strong>Verified By:</strong>{" "}
                  {trip.verified_by || "Not verified"}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        selectedTrip: trip,
                        isAddEditModalOpen: true,
                      }))
                    }
                  >
                    Edit
                  </Button>
                  {!trip.is_verified && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleVerifyTrip(trip.id)}
                    >
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        tripToDelete: trip,
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
            <div className="text-center text-gray-500">No trips found.</div>
          )}
        </div>

        {/* Table View for Large Screens */}
        <Table className="hidden lg:table">
          <TableHeader>
            <TableRow>
              {[
                "Route",
                "Assigned To",
                "Orders",
                "Total Amount",
                "Trip Date",
                "Status",
                "Verified By",
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
          <TableBody>{tableContent()}</TableBody>
        </Table>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {state?.trips?.length} of {state?.totalItems} trips
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
              Enter the ID of the trip (
              <strong>{state.tripToDelete?.id}</strong>) to confirm deletion.
            </p>
            <Input
              placeholder="Enter trip ID"
              value={state.deleteTripId}
              onChange={(e) =>
                setState((prev) => ({ ...prev, deleteTripId: e.target.value }))
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
              <Button variant="destructive" onClick={handleDeleteTrip}>
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
