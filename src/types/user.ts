export interface UserType {
    name: string;
    email: string;
    role: string;
    phone: string;
    title : string;
    whatsapp : string;
    address? : string;
    status? : string;
}
export interface ProductType{
    key: string;
    name: string;
    stock: number;
    container_type: string;
    uom: number;
    volume: string;
    flavour: string;
    default_labeled_price: number;
    default_cost: number;
    product_image: string;
    status: string;
}