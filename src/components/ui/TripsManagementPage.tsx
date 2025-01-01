"use client";

import axios from "axios";
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
  is_completed: boolean;
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

export default function TripsManagementPage ({
  setSelectedRouteDetails,
  setSelectedRouteDetailsBills,
  setSelectedTrip,
  state,
  setState,
  fetchTrips,
}: any) {
  const PAGE_SIZE = 10;

  const handleEndTrip = async (tripId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/trips/complete?id=${tripId}`,
        { is_completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
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

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Trips Management</h1>
      <div className="flex flex-col min-h-[600px]">
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search by route name or assigned to"
            value={state.search}
            onChange={(e) =>
              setState((prev: any) => ({ ...prev, search: e.target.value }))
            }
            className="w-full max-w-md"
          />
        </div>

        {/* Card View for Small Screens */}
        <div className="lg:hidden grid grid-cols-1 gap-4">
          {state.tableLoading ? (
            <div className="text-center text-gray-500">Loading trips...</div>
          ) : state.trips.length > 0 ? (
            state.trips.map((trip : any) => (
              <div
                key={trip.id}
                className="p-4 border rounded shadow-sm bg-white flex flex-col gap-2"
              >
                <h3 className="font-bold text-lg">{trip.route.name}</h3>
                <p className="text-sm text-gray-500">
                  <strong>Assigned To:</strong> {trip.assigned_to}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Orders:</strong> {getTotalOrders(trip)} orders
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Total Amount:</strong> Rs{" "}
                  {getTotalAmount(trip).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Created At:</strong>{" "}
                  {new Date(trip.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Status:</strong>{" "}
                  {trip.is_verified && trip.is_completed
                    ? "Verified & Completed"
                    : trip.is_verified
                    ? "Verified, Pending Completion"
                    : trip.is_completed
                    ? "Completed, Pending Verification"
                    : "Pending Verification & Completion"}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Verified By:</strong>{" "}
                  {trip.verified_by || "Not verified"}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedRouteDetails(trip.route);
                      setSelectedTrip(trip);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedRouteDetailsBills(trip.route);
                      setSelectedTrip(trip);
                    }}
                  >
                    View Bills
                  </Button>
                  {!trip.is_verified && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleEndTrip(trip.id)}
                    >
                      End Trip
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No trips found.</div>
          )}
        </div>

        <Table className="hidden lg:table">
          <TableHeader>
            <TableRow>
              {[
                "Route",
                "Assigned To",
                "Orders",
                "Total Amount",
                "Created At",
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
          <TableBody>
            {state.tableLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-[400px]">
                  <TableSkeletonLoader />
                </TableCell>
              </TableRow>
            ) : (
              state.trips.map((trip : any) => (
                <TableRow key={trip.id}>
                  <TableCell>{trip.route.name}</TableCell>
                  <TableCell>{trip.assigned_to}</TableCell>
                  <TableCell>{getTotalOrders(trip)} orders</TableCell>
                  <TableCell>Rs {getTotalAmount(trip).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(trip.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trip.is_verified && trip.is_completed
                          ? "default"
                          : "secondary"
                      }
                    >
                      {trip.is_verified && trip.is_completed
                        ? "Verified & Completed"
                        : trip.is_verified
                        ? "Verified, Pending Completion"
                        : trip.is_completed
                        ? "Completed, Pending Verification"
                        : "Pending Verification & Completion"}
                    </Badge>
                  </TableCell>
                  <TableCell>{trip.verified_by || "Not verified"}</TableCell>
                  <TableCell className="">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedRouteDetails(trip.route);
                        setSelectedTrip(trip);
                      }}
                    >
                      View Details
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedRouteDetailsBills(trip.route);
                        setSelectedTrip(trip);
                      }}
                      className="mx-[6px]"
                    >
                      View Bills
                    </Button>

                    {!trip.is_verified && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleEndTrip(trip.id)}
                        className="lg:mt-[6px] xl:mt-0"
                      >
                        End Trip
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {state.trips.length} of {state.totalItems} trips
            </span>
            <Pagination
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              onPageChange={(page) =>
                setState((prev: any) => ({ ...prev, currentPage: page }))
              }
              maxVisibleButtons={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
