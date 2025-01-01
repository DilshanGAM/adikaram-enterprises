import { OrderModalProps } from "@/app/utils/interface";
import Modal from "@/components/ui/custom-model";

export default function OrderModal({
  orderModalOpen,
  onClose,
  selectedShop,
  orderForm,
  setOrderForm,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  handleQuantityChange,
  handleSubmitOrder,
  fetchProducts,
  fetchTrips
}: OrderModalProps) {
  if (!orderModalOpen) return null;

  return (
    <Modal
      isOpen={orderModalOpen}
      onClose={onClose}
      title={`New Order - ${selectedShop?.name}`}
      className="w-full mx-auto"
    >
      <div className="space-y-4">
        <select
          value={orderForm.payment_type}
          onChange={(e) => {
            setOrderForm({ ...orderForm, payment_type: e.target.value });
          }}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Payment Type</option>
          <option value="cash">Cash</option>
          <option value="credit">Credit</option>
        </select>

        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const orderProduct = orderForm.products.find(
                  (p) => p.productId === product.key
                );
                const subtotal = (orderProduct?.quantity || 0) * 
                  (orderProduct?.price || product.default_labeled_price);

                return (
                  <tr key={product.key}>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.stock}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={orderProduct?.price || product.default_labeled_price}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value);
                          handleQuantityChange(product.key, orderProduct?.quantity || 0, newPrice);
                        }}
                        className="w-24 p-1 border rounded"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={product.stock}
                        value={orderProduct?.quantity || 0}
                        onChange={(e) => {
                          handleQuantityChange(
                            product.key,
                            parseInt(e.target.value) || 0,
                            orderProduct?.price || product.default_labeled_price
                          );
                        }}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">Rs: {subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="discount">Discount (Rs):</label>
          <input
            id="discount"
            type="number"
            min="0"
            step="0.01"
            value={orderForm.discount}
            onChange={(e) => {
              const newDiscount = parseFloat(e.target.value) || 0;
              setOrderForm({ ...orderForm, discount: newDiscount });
            }}
            className="w-32 p-2 border rounded"
          />
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <div className="space-y-2">
            <div className="text-lg">Subtotal: Rs: {orderForm.totalAmount.toFixed(2)}</div>
            <div className="text-lg">Discount: Rs: {orderForm.discount.toFixed(2)}</div>
            <div className="text-lg font-semibold">
              Final Total: Rs: {(orderForm.totalAmount - orderForm.discount).toFixed(2)}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleSubmitOrder();
                fetchProducts();
                fetchTrips();
              }}
              disabled={orderForm.products.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
              Create Order
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}