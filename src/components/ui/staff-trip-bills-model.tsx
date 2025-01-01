
import { TripBillsModalProps } from "@/app/utils/interface";
import Modal from "@/components/ui/custom-model";

export default function TripBillsModal({
  selectedRouteDetailsBills,
  selectedTrip,
  onClose,
  downloadTripBillsPDF,
  calculateTotalOrderType,
  calculateTotal
}: TripBillsModalProps) {
  if (!selectedRouteDetailsBills) return null;

  return (
    <Modal
      isOpen={!!selectedRouteDetailsBills}
      onClose={onClose}
      title="Trip Bills"
      className="max-full mx-auto"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedRouteDetailsBills.name}
          </h2>
          <button
            onClick={downloadTripBillsPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                clipRule="evenodd"
              />
            </svg>
            Download Report
          </button>
        </div>

        {/* Trip details and orders section */}
        <div className="mt-2 text-sm text-gray-600 space-y-1">
          <p>Created: {new Date(selectedRouteDetailsBills.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(selectedRouteDetailsBills.updated_at).toLocaleString()}</p>
        </div>

        <div>
          <div className="space-y-4">
            <div className="mt-4 border-t pt-4">
              <h5 className="font-semibold mb-2">Orders</h5>
              {selectedTrip?.trip_orders.map(to => (
                <div key={to.order.id} className="bg-gray-50 p-3 rounded mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Rs: {to.order.total_amount.toFixed(2)}</span>
                    <span className="capitalize">{to.order.type}</span>
                    <span className="capitalize">{to.order.status}</span>
                  </div>
                </div>
              ))}

              {selectedTrip?.trip_orders.length === 0 && (
                <div className="text-center text-gray-500">
                  No orders found
                </div>
              )}

              <div className="flex flex-col justify-between items-start border-t pt-4">
                <div className="text-lg font-semibold">
                  Total Orders: Rs: {calculateTotalOrderType(selectedTrip?.trip_orders || [], "credit").toFixed(2)}
                </div>
                <div className="text-lg font-semibold">
                  Total Returns: Rs: {calculateTotalOrderType(selectedTrip?.trip_orders || [], "debit").toFixed(2)}
                </div>
                <div className="text-lg font-semibold">
                  Total: Rs: {calculateTotal(selectedTrip?.trip_orders || []).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}