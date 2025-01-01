"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TiDelete } from "react-icons/ti";
import { IoIosAddCircle } from "react-icons/io";

type ShopType = {
    id: string;
    name: string;
    address: string;
    whatsapp_number: string;
    phone_number: string;
    lat: number;
    long: number;
};

type RouteShopType = {
    shop_id: string;
    sequence_order: number;
    shop: ShopType;
};

interface RouteFormProps {
    route: {
        id: string;
        name: string;
        route_shops?: RouteShopType[];
    } | null;
    onSuccess?: () => void;
}

export default function RouteForm({ route, onSuccess }: RouteFormProps) {
    const [formData, setFormData] = useState({
        name: route?.name || "",
    });
    const [availableShops, setAvailableShops] = useState<ShopType[]>([]);
    const [selectedShops, setSelectedShops] = useState<RouteShopType[]>(
        route?.route_shops || []
    );
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAvailableShops();
    }, []);

    const fetchAvailableShops = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("/api/shops", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAvailableShops(data.shops);
        } catch (err: any) {
            toast.error("Failed to fetch shops");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(selectedShops);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update sequence orders
        const updatedItems = items.map((item, index) => ({
            ...item,
            sequence_order: index + 1,
        }));

        setSelectedShops(updatedItems);
    };

    const addShop = (shop: ShopType) => {
        if (selectedShops.find(s => s.shop_id === shop.id)) {
            toast.error("Shop already added to route");
            return;
        }

        setSelectedShops([
            ...selectedShops,
            {
                shop_id: shop.id,
                sequence_order: selectedShops.length + 1,
                shop: shop
            }
        ]);
    };

    const removeShop = (shopId: string) => {
        const updatedShops = selectedShops
            .filter(s => s.shop_id !== shopId)
            .map((shop, index) => ({
                ...shop,
                sequence_order: index + 1
            }));
        setSelectedShops(updatedShops);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...formData,
                shops: selectedShops.map(s => ({
                    shop_id: s.shop_id,
                    sequence_order: s.sequence_order
                }))
            };

            if (route) {
                await axios.put(`/api/routes?id=${route.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Route updated successfully!");
            } else {
                await axios.post("/api/routes", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Route added successfully!");
            }

            if (onSuccess) onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save route");
        } finally {
            setLoading(false);
        }
    };

    const filteredShops = availableShops.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Route Name"
                required
                className="w-full"
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Available Shops</h3>
                    <Input
                        placeholder="Search shops..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2"
                    />
                    <div className="h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                        {filteredShops.length == 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <span>Loading...</span>
                            </div>
                        ) : (
                            filteredShops.map(shop => (
                                <div
                                    key={shop.id}
                                    className="p-2 border rounded hover:bg-gray-50 flex justify-between items-center max-w-[574px] w-full overflow-auto custom-scrollbar"
                                >
                                    <div>
                                        <div className="font-medium">{shop.name}</div>
                                        <div className="text-sm text-gray-500">{shop.address}</div>
                                    </div>
                                    <Button 
                                        className="hidden sm:block"
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => addShop(shop)}
                                    >
                                        Add
                                    </Button>
                                    <Button 
                                        className="sm:hidden text-xl p-[6px] bg-blue-700 text-white flex justify-center items-center"
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => addShop(shop)}
                                    >
                                       <IoIosAddCircle/>
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="border p-4 rounded-lg ">
                    <h3 className="font-semibold mb-2">Route Shops</h3>
                    <h3 className="font-semibold text-sm mb-2">(Drag to reorder)</h3>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="route-shops">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="h-[300px] overflow-y-auto space-y-2 custom-scrollbar"
                                >
                                    {selectedShops.map((routeShop, index) => (
                                        <Draggable
                                            key={routeShop.shop_id}
                                            draggableId={routeShop.shop_id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="p-2 border rounded bg-white flex justify-between items-center  max-w-[574px] w-full overflow-auto custom-scrollbar"
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {index + 1}. {routeShop.shop.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {routeShop.shop.address}
                                                        </div>
                                                    </div>
                                                    <Button
                                                      className="hidden sm:block"
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeShop(routeShop.shop_id)}
                                                    >
                                                        Remove
                                                    </Button>
                                                    <Button
                                                     className="sm:hidden text-xl p-[6px] bg-red-500 text-white flex justify-center items-center"
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeShop(routeShop.shop_id)}
                                                    >
                                                       <TiDelete/>
                                                    </Button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : route ? "Update Route" : "Add Route"}
            </Button>
        </form>
    );
}