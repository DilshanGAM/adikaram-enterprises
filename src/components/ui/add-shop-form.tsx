"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";
import dynamic from 'next/dynamic';

const MapModal = dynamic(() => import('./MapModal'), {
    ssr: false,
});

type ShopType = {
    id: string;
    name: string;
    address: string;
    whatsapp_number: string;
    phone_number: string;
    lat: number;
    long: number;
};

interface ShopFormProps {
    shop: ShopType | null;
    onSuccess?: () => void;
}

export default function ShopForm({ shop, onSuccess }: ShopFormProps) {
    const [formData, setFormData] = useState({
        name: shop?.name || "",
        address: shop?.address || "",
        whatsapp_number: shop?.whatsapp_number || "",
        phone_number: shop?.phone_number || "",
        lat: shop?.lat || 0,
        long: shop?.long || 0,
    });

    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === 'lat' || name === 'long') {
            setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectLocation = (location: { lat: number; lng: number }) => {
        setFormData(prev => ({
            ...prev,
            lat: location.lat,
            long: location.lng
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (shop) {
                await axios.put(`/api/shops/?id=${shop.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success("Shop updated successfully!");
            } else {
                await axios.post("/api/shops", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success("Shop added successfully!");
            }

            if (onSuccess) onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save shop");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Shop Name"
                    required
                    className="w-full"
                />

                <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Shop Address"
                    required
                    className="w-full"
                />

                <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    className="w-full"
                />

                <Input
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="WhatsApp Number"
                    className="w-full"
                />

                <div className="space-y-2">
                    <Button 
                        type="button"
                        onClick={() => setModalIsOpen(true)}
                        className="w-full"
                    >
                        Select Location on Map
                    </Button>
                    
                    <Input
                        name="lat"
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={handleChange}
                        placeholder="Latitude"
                        required
                        className="w-full"
                    />

                    <Input
                        name="long"
                        type="number"
                        step="any"
                        value={formData.long}
                        onChange={handleChange}
                        placeholder="Longitude"
                        required
                        className="w-full"
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : shop ? "Update Shop" : "Add Shop"}
                </Button>
            </form>

            {modalIsOpen && (
                <MapModal 
                    onClose={() => setModalIsOpen(false)}
                    onSelect={handleSelectLocation}
                    currentLat={formData.lat}
                    currentLong={formData.long}
                />
            )}
        </div>
    );
}