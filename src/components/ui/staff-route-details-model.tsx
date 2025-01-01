import { RouteDetailsModalProps } from "@/app/utils/interface";
import Modal from "@/components/ui/custom-model";

export default function RouteDetailsModal({
  selectedRouteDetails,
  selectedTrip,
  loading,
  onClose,
  handleShopVisit,
  handleAddOrder,
  handleAddRepay,
  handleReturn
}: RouteDetailsModalProps) {
  if (!selectedRouteDetails) return null;

  return (
    <Modal
      isOpen={!!selectedRouteDetails}
      onClose={onClose}
      title="Route Details"
      className="max-full mx-auto"
    >
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedRouteDetails.name}
          </h2>
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>Created: {new Date(selectedRouteDetails.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(selectedRouteDetails.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Shops in Route</h3>
          <div className="space-y-4">
            {selectedRouteDetails.route_shops.map((shop, index) => (
              <div key={shop.shop.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full 
                    ${(selectedTrip?.trip_orders?.filter(to => to?.order?.shop_id === shop.shop?.id)?.length ?? 0) > 0 
                      ? "bg-green-600" : "bg-blue-600"} text-white font-medium`}>
                    {index + 1}
                  </div>
                  {index < selectedRouteDetails.route_shops.length - 1 && (
                    <div className="h-full w-0.5 bg-gray-300 my-2" />
                  )}
                </div>

                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow max-w-[1172px] w-full overflow-auto custom-scrollbar">
                  {/* Shop details and buttons */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{shop.shop.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📍 {shop.shop.address}</p>
                      <p>📞 {shop.shop.phone_number}</p>
                    </div>

                    <div className="flex gap-3 mt-3">
                      {/* Visit button */}
                      <button
                        onClick={() => handleShopVisit(shop.shop.id)}
                        disabled={true}
                        className={`px-4 py-2 rounded-md text-white ${
                          (selectedTrip?.trip_orders?.filter(to => to?.order?.shop_id === shop.shop?.id)?.length ?? 0) > 0
                            ? "bg-green-500 cursor-not-allowed"
                            : loading[shop.shop.id]
                            ? "bg-gray-400 cursor-wait"
                            : "bg-yellow-600"
                        }`}
                      >
                        {(selectedTrip?.trip_orders?.filter(to => to?.order?.shop_id === shop.shop?.id)?.length ?? 0) > 0
                          ? "Visited"
                          : loading[shop.shop?.id ?? 0]
                          ? "Processing..."
                          : "Not Visited"}
                      </button>

                      {/* Other action buttons */}
                      <button
                        onClick={() => handleAddOrder(shop.shop.id, shop.shop.name)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Add Order
                      </button>
                      <button
                        onClick={() => handleAddRepay(shop.shop.id, shop.shop.name)}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700"
                      >
                        Credit Repay
                      </button>
                      <button
                        onClick={() => handleReturn(shop.shop.id, shop.shop.name)}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700"
                      >
                        Return
                      </button>
                    </div>

                    {/* Orders section */}
                    <div className="mt-4 border-t pt-4">
                      <h5 className="font-semibold mb-2">Orders</h5>
                      {selectedTrip?.trip_orders
                        .filter(to => to.order.shop_id === shop.shop.id)
                        .map(to => (
                          <div key={to.order.id} className="bg-gray-50 p-3 rounded mb-2">
                            <div className="flex justify-between text-sm">
                              <span>Rs: {to.order.total_amount.toFixed(2)}</span>
                              <span className="capitalize">{to.order.type}</span>
                              <span className="capitalize">{to.order.status}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}