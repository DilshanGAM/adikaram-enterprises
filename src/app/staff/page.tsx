"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TripsManagementPage from "@/components/ui/TripsManagementPage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order, OrderFormData, OrderProduct, PaginatedResponse, Product, RouteType, TripType, User } from "../utils/interface";
import RouteDetailsModal from "@/components/ui/staff-route-details-model";
import OrderModal from "@/components/ui/staff-order-model";
import { CreditRepayModal, ReturnOrderModal } from "@/components/ui/staff-credit-repay-model";
import TripBillsModal from "@/components/ui/staff-trip-bills-model";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState<string>("");
  const [selectedRouteDetails, setSelectedRouteDetails] =
    useState<RouteType | null>(null);

  const [selectedRouteDetailsBills, setSelectedRouteDetailsBills] =
      useState<RouteType | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  // Add near other state declarations
  const [creditOrdersLoading, setCreditOrdersLoading] = useState(false);
  const [returnOrdersLoading, setReturnOrdersLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [creditOrders, setCreditOrders] = useState<Order[]>([]);
  const [returnOrders, setReturnOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    shopId: "",
    shopName: "",
    products: [],
    tripId: "",
    type: "credit",
    payment_type: "",
    totalAmount: 0,
    discount: 0,
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [ordertype, setOrderType] = useState("");

  const downloadTripBillsPDF = () => {
    if (!selectedTrip) return;
  
    try {
      const doc = new jsPDF();
      
      // Add title and basic info
      doc.setFontSize(18);
      doc.text("Trip Bills Report", 14, 22);
      doc.setFontSize(11);
      doc.text(`Route: ${selectedTrip.route.name}`, 14, 32);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
  
      // Define table columns
      const tableColumn = [
        "Order Type",
        "Amount",
        "Status"
      ];
  
      // Prepare table data
      const tableRows = selectedTrip.trip_orders.map(to => [
        to.order.type,
        `Rs: ${to.order.total_amount.toFixed(2)}`,
        to.order.status
      ]);
  
      // Add the main table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [69, 75, 89] },
      });
  
      // Calculate and add summary at the bottom
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      
      doc.text(`Total Orders: Rs: ${calculateTotalOrderType(selectedTrip.trip_orders, "credit").toFixed(2)}`, 14, finalY + 10);
      doc.text(`Total Returns: Rs: ${calculateTotalOrderType(selectedTrip.trip_orders, "debit").toFixed(2)}`, 14, finalY + 20);
      doc.text(`Final Total: Rs: ${calculateTotal(selectedTrip.trip_orders).toFixed(2)}`, 14, finalY + 30);
  
      // Save with a unique filename
      const fileName = `trip-bills-${selectedTrip.route.name}-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleShopVisit = async (shopId: string) => {
    try {
      setLoading((prev) => ({ ...prev, [shopId]: true }));
      const token = localStorage.getItem("token");

      await axios.post(
        `/api/shops/visit`,
        {
          shopId: shopId,
          tripId: selectedTrip?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (selectedRouteDetails) {
        setSelectedRouteDetails({
          ...selectedRouteDetails,
          route_shops: selectedRouteDetails.route_shops.map((rs) =>
            rs.shop.id === shopId
              ? { ...rs, shop: { ...rs.shop, visited: true } }
              : rs
          ),
        });
      }
    } catch (error) {
      console.error("Error marking shop as visited:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [shopId]: false }));
    }
  };

  const handleAddOrder = (shopId: string, shopName: string) => {
    setSelectedShop({ id: shopId, name: shopName });
    setOrderForm({
      shopId,
      shopName,
      products: [],
      totalAmount: 0,
      type: ordertype,
      tripId: selectedTrip?.id || "",
      payment_type: "",
      discount: 0,
    });
    setOrderModalOpen(true);
  };

  const handleAddRepay = (shopId: string, shopName: string) => {
    setSelectedShop({ id: shopId, name: shopName });
    fetchRepayOrders(shopId);
    setRepayModalOpen(true);
  };

  const handleReturn = async (shopId: string, shopName: string) => {
    setSelectedShop({ id: shopId, name: shopName });
    fetchReturnOrders(shopId);
    setReturnModalOpen(true);
  };

  const handleQuantityChange = (
    productId: string,
    quantity: number,
    price: number
  ) => {
    setOrderForm((prev) => {
      const newProducts = [...prev.products];
      const existingIndex = newProducts.findIndex(
        (p) => p.productId === productId
      );

      if (existingIndex >= 0) {
        if (quantity === 0) {
          newProducts.splice(existingIndex, 1);
        } else {
          newProducts[existingIndex] = {
            productId,
            quantity,
            price:
              price ||
              products.find((p) => p.key === productId)
                ?.default_labeled_price ||
              0,
          };
        }
      } else if (quantity > 0) {
        newProducts.push({
          productId,
          quantity,
          price:
            price ||
            products.find((p) => p.key === productId)?.default_labeled_price ||
            0,
        });
      }

      const totalAmount = calculateTotalAmount(newProducts);

      return {
        ...prev,
        products: newProducts,
        totalAmount,
      };
    });
  };

  const calculateTotalAmount = (orderProducts: OrderProduct[]) => {
    return orderProducts.reduce(
      (total, op) => total + op.price * op.quantity,
      0
    );
  };

  const handleSubmitOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      orderForm.type = "credit";

      if (!orderForm.payment_type) {
        toast.error("Please select payment type");
        return;
      }

      if (orderForm.discount > orderForm.totalAmount) {
        toast.error("Discount cannot be greater than total amount");
        return;
      }

      // Calculate final amount with discount
      const finalAmount = orderForm.totalAmount - orderForm.discount;
      orderForm.totalAmount = finalAmount;

      await axios.post("/api/orders", orderForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the selected route details to reflect the visit
      if (selectedRouteDetails) {
        setSelectedRouteDetails({
          ...selectedRouteDetails,
          route_shops: selectedRouteDetails.route_shops.map((rs) =>
            rs.shop.id === orderForm.shopId
              ? { ...rs, shop: { ...rs.shop, visited: true } }
              : rs
          ),
        });
      }

      // Update the selected trip with the new order
      if (selectedTrip) {
        const newOrder = {
          order: {
            id: Date.now().toString(), // temporary ID
            total_amount: orderForm.totalAmount,
            status: "paid",
            type: orderForm.type,
            shop_id: orderForm.shopId,
            shop: {
              name: orderForm.shopName,
            },
          },
          sequence_order: selectedTrip.trip_orders.length + 1,
        };

        setSelectedTrip({
          ...selectedTrip,
          trip_orders: [...selectedTrip.trip_orders, newOrder],
        });
      }

      setOrderModalOpen(false);
      toast.success("Order created successfully");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
  };

  useEffect(() => {
    setFilteredProducts(
      products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

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
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const { data } = await axios.get<PaginatedResponse>("/api/trips/staff", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: state.currentPage,
          pageSize: PAGE_SIZE,
          search: state.search,
          userId: user.email,
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

  const fetchRepayOrders = async (shopId: string) => {
    setCreditOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/orders/credit", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          shopId,
        },
      });
      setCreditOrdersLoading(false);
      setCreditOrders(response.data.orders);
    } catch (error) {
      setCreditOrdersLoading(false);
      console.error("Error fetching products:", error);
    }
  };

  const fetchReturnOrders = async (shopId: string) => {
    setReturnOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/orders/return", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          shopId,
        },
      });
      setReturnOrdersLoading(false);
      setReturnOrders(response.data.orders);
    } catch (error) {
      setReturnOrdersLoading(false);
      console.error("Error fetching products:", error);
    }
  };

  const confirmRepay = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/orders/confirm`,
        {
          orderId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Repay confirmed successfully.");
      fetchRepayOrders(selectedShop?.id || "");
    } catch (error) {
      console.error("Error confirming repay:", error);
      toast.error("Failed to confirm repay.");
    }
  };

  const confirmReturn = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/orders/return/confirm`,
        {
          orderId,
          tripId: selectedTrip?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Return confirmed successfully.");
      fetchReturnOrders(selectedShop?.id || "");
    } catch (error) {
      console.error("Error confirming return:", error);
      toast.error("Failed to confirm return.");
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

  const calculateTotal = (tripOrders: any) => {
    return tripOrders.reduce((acc: any, to: any) => {
      const modifier = to.order.type === "credit" ? 1 : -1;
      return acc + to.order.total_amount * modifier;
    }, 0);
  };

  const calculateTotalOrderType = (tripOrders: any, type: string) => {
    return tripOrders.reduce((acc: any, to: any) => {
      if (to.order.type === type) {
        return acc + to.order.total_amount;
      }
      return acc;
    }, 0);
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
          <img
            src="/favicon.png"
            alt="Adikaram Enterprises Logo"
            className=" cursor-pointer border-white rounded-full border-[2px] bg-white"
          />
        </div>
      </div>
    );

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Staff Portal</h1>
      </header>

      <TripsManagementPage
        setSelectedRouteDetails={setSelectedRouteDetails}
        setSelectedRouteDetailsBills={setSelectedRouteDetailsBills}
        setSelectedTrip={setSelectedTrip}
        state={state}
        setState={setState}
        fetchTrips={fetchTrips}
      />

      <RouteDetailsModal
        selectedRouteDetails={selectedRouteDetails}
        selectedTrip={selectedTrip}
        loading={loading}
        onClose={() => setSelectedRouteDetails(null)}
        handleShopVisit={handleShopVisit}
        handleAddOrder={handleAddOrder}
        handleAddRepay={handleAddRepay}
        handleReturn={handleReturn}
      />

      <TripBillsModal
        selectedRouteDetailsBills={selectedRouteDetailsBills}
        selectedTrip={selectedTrip}
        onClose={() => setSelectedRouteDetailsBills(null)}
        downloadTripBillsPDF={downloadTripBillsPDF}
        calculateTotalOrderType={calculateTotalOrderType}
        calculateTotal={calculateTotal}
      />

      <OrderModal
        orderModalOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        selectedShop={selectedShop}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredProducts={filteredProducts}
        handleQuantityChange={handleQuantityChange}
        handleSubmitOrder={handleSubmitOrder}
        fetchProducts={fetchProducts}
        fetchTrips={fetchTrips}
      />

      <CreditRepayModal
        repayModalOpen={repayModalOpen}
        onClose={() => setRepayModalOpen(false)}
        selectedShop={selectedShop}
        creditOrdersLoading={creditOrdersLoading}
        creditOrders={creditOrders}
        confirmRepay={confirmRepay}
        setCreditOrders={setCreditOrders}
      />

      <ReturnOrderModal
        returnModalOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        selectedShop={selectedShop}
        returnOrdersLoading={returnOrdersLoading}
        returnOrders={returnOrders}
        confirmReturn={confirmReturn}
        setReturnOrders={setReturnOrders}
      />
    </main>
  );
}
