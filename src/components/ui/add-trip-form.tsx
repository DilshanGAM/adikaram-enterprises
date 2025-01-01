"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import axios from "axios";


type UserType = {
    email: string;
    name: string;
};

type RouteType = {
    id: string;
    name: string;
};

type TripType = {
    id: string;
    assigned_to: string;
    trip_date: Date;
    route_id: string;
};

interface TripFormProps {
    trip: TripType | null;
    onSuccess?: () => void;
}

export default function TripForm({ trip, onSuccess }: TripFormProps) {
    const [formData, setFormData] = useState({
        assigned_to: trip?.assigned_to || "",
        trip_date: trip?.trip_date ? new Date(trip.trip_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        route_id: trip?.route_id || "",
    });
    
    const [users, setUsers] = useState<UserType[]>([]);
    const [routes, setRoutes] = useState<RouteType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoutes();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(data.users);
        } catch (err) {
            toast.error("Failed to fetch users");
        }
    };

    const fetchRoutes = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("/api/routes", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoutes(data.routes);
        } catch (err) {
            toast.error("Failed to fetch routes");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...formData,
                trip_date: new Date(formData.trip_date).toISOString(),
            };

            if (trip) {
                await axios.put(`/api/trips?id=${trip.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Trip updated successfully!");
            } else {
                await axios.post("/api/trips", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Trip added successfully!");
            }

            if (onSuccess) onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Trip Date</label>
                <Input
                    type="date"
                    name="trip_date"
                    value={formData.trip_date}
                    onChange={handleChange}
                    className="w-full"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Route</label>
                <Select
                    value={formData.route_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, route_id: value }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Route" />
                    </SelectTrigger>
                    <SelectContent>
                        {routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                                {route.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Assign To</label>
                <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((user) => (
                            <SelectItem key={user.email} value={user.email}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : trip ? "Update Trip" : "Add Trip"}
            </Button>
        </form>
    );
}