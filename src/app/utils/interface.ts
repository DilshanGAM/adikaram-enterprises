export interface User {
    name: string;
  }
  
export   interface RouteType {
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
        visited?: boolean;
      };
    }[];
  }
  
  export interface TripType {
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
        shop_id: string;
        shop: {
          name: string;
        };
      };
      sequence_order: number;
    }[];
  }
  
  export interface Product {
    key: string;
    name: string;
    stock: number;
    default_labeled_price: number;
  }
  
  export interface OrderProduct {
    productId: string;
    quantity: number;
    price: number;
  }
  
  export interface OrderFormData {
    shopId: string;
    shopName: string;
    products: OrderProduct[];
    tripId: string;
    type: string;
    payment_type: string;
    totalAmount: number;
    discount: number;
  }
  
  export interface PaginatedResponse {
    trips: TripType[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  }
  
  export interface Shop {
    id: string;
    name: string;
    address: string;
    whatsapp_number: string;
    phone_number: string;
    lat: number;
    long: number;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Order {
    id: string;
    shop_id: string;
    total_amount: number;
    status: string;
    type: string;
    discount: number;
    payment_type: string;
    created_at: Date;
    updated_at: Date;
    shop: Shop;
    order_products: OrderProduct[];
  }
  
  export interface GetOrdersResponse {
    orders: Order[];
  }

  export interface OrderModalProps {
    orderModalOpen: boolean;
    onClose: () => void;
    selectedShop: { id: string; name: string } | null;
    orderForm: OrderFormData;
    setOrderForm: (orderForm: OrderFormData) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredProducts: Product[];
    handleQuantityChange: (productId: string, quantity: number, price: number) => void;
    handleSubmitOrder: () => void;
    fetchProducts: () => void;
    fetchTrips: () => void;
  }
  

  export interface RouteDetailsModalProps {
    selectedRouteDetails: RouteType | null;
    selectedTrip: TripType | null;
    loading: { [key: string]: boolean };
    onClose: () => void;
    handleShopVisit: (shopId: string) => void;
    handleAddOrder: (shopId: string, shopName: string) => void;
    handleAddRepay: (shopId: string, shopName: string) => void;
    handleReturn: (shopId: string, shopName: string) => void;
  }

  export interface TripBillsModalProps {
    selectedRouteDetailsBills: RouteType | null;
    selectedTrip: TripType | null;
    onClose: () => void;
    downloadTripBillsPDF: () => void;
    calculateTotalOrderType: (tripOrders: any, type: string) => number;
    calculateTotal: (tripOrders: any) => number;
  }

  export interface CreditRepayModalProps {
    repayModalOpen: boolean;
    onClose: () => void;
    selectedShop: { id: string; name: string } | null;
    creditOrdersLoading: boolean;
    creditOrders: Order[];
    confirmRepay: (orderId: string) => void;
    setCreditOrders: (orders: Order[]) => void;
  }

  export interface ReturnOrderModalProps {
    returnModalOpen: boolean;
    onClose: () => void;
    selectedShop: { id: string; name: string } | null;
    returnOrdersLoading: boolean;
    returnOrders: Order[];
    confirmReturn: (orderId: string) => void;
    setReturnOrders: (orders: Order[]) => void;
  }