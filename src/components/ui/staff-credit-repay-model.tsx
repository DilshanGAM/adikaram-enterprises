import { CreditRepayModalProps, Order, ReturnOrderModalProps } from "@/app/utils/interface";
import Modal from "@/components/ui/custom-model";

export function CreditRepayModal({
  repayModalOpen,
  onClose,
  selectedShop,
  creditOrdersLoading,
  creditOrders,
  confirmRepay,
  setCreditOrders
}: CreditRepayModalProps) {
  if (!repayModalOpen) return null;

  return (
    <Modal
      isOpen={repayModalOpen}
      onClose={onClose}
      title={`Unpaid Credit Orders - ${selectedShop?.name}`}
      className="w-full mx-auto"
    >
      <div className="space-y-4">
        <div className="max-h-96 overflow-y-auto">
          {creditOrdersLoading ? (
            <LoadingSpinner />
          ) : creditOrders.length === 0 ? (
            <EmptyState message="No credit orders found" />
          ) : (
            <OrderTable
              orders={creditOrders}
              onConfirm={(orderId) => {
                setCreditOrders([]);
                confirmRepay(orderId);
              }}
              buttonText="Confirm Repay"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export function ReturnOrderModal({
  returnModalOpen,
  onClose,
  selectedShop,
  returnOrdersLoading,
  returnOrders,
  confirmReturn,
  setReturnOrders
}: ReturnOrderModalProps) {
  if (!returnModalOpen) return null;

  return (
    <Modal
      isOpen={returnModalOpen}
      onClose={onClose}
      title={`All Orders - ${selectedShop?.name}`}
      className="w-full mx-auto"
    >
      <div className="space-y-4">
        <div className="max-h-96 overflow-y-auto">
          {returnOrdersLoading ? (
            <LoadingSpinner />
          ) : returnOrders.length === 0 ? (
            <EmptyState message="No orders found" />
          ) : (
            <OrderTable
              orders={returnOrders}
              onConfirm={(orderId) => {
                setReturnOrders([]);
                confirmReturn(orderId);
              }}
              buttonText="Confirm Return"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

// Shared components
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
        <img
          src="/favicon.png"
          alt="Loading..."
          className="cursor-pointer border-white rounded-full border-[2px] bg-white"
        />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-gray-500">
      {message}
    </div>
  );
}

function OrderTable({ 
  orders, 
  onConfirm, 
  buttonText 
}: { 
  orders: Order[]; 
  onConfirm: (orderId: string) => void; 
  buttonText: string;
}) {
  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-2 text-left">Order Date</th>
          <th className="px-4 py-2 text-left">Total Amount</th>
          <th className="px-4 py-2 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-4 py-2">
              {new Date(order.created_at).toLocaleString()}
            </td>
            <td className="px-4 py-2">Rs: {order.total_amount}</td>
            <td className="px-4 py-2 flex items-center justify-center">
              <button
                onClick={() => onConfirm(order.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {buttonText}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}