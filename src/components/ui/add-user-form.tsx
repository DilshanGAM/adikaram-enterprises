"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";
import { UserType } from "@/types/user";

interface UserFormProps {
    user: UserType | null;
    onSuccess?: () => void;
}

export default function UserForm({ user, onSuccess }: UserFormProps) {
    const [formData, setFormData] = useState({
        email: user?.email || "",
        name: user?.name || "",
        phone: user?.phone || "",
        whatsapp: user?.whatsapp || "",
        address: user?.address || "",
        title: user?.title || "",
        role: user?.role || "",
        status: user?.status || "active",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error("Phone number must be exactly 10 numeric characters");
            setLoading(false);
            return;
        }

          // Address validation
    if (!formData.address.trim()) {
        toast.error("Address cannot be empty");
        setLoading(false);
        return;
    }

        // Password validation for new users
        if (!user) {
            if (formData.password.length < 6) {
                toast.error("Password must be at least 6 characters long");
                setLoading(false);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                setLoading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem("token");
            if (user) {
                // Edit user - exclude password fields
                const { password, confirmPassword, ...updateData } = formData;
                await axios.put(`/api/users/?email=${user.email}`, updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success("User updated successfully!");
            } else {
                // Add new user - include password but exclude confirmPassword
                const { confirmPassword, ...createData } = formData;
                await axios.post("/api/users", createData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success("User added successfully!");
            }

            if (onSuccess) onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full"
            />
            <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                disabled={!!user}
                className="w-full"
            />
            <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="w-full"
            />
            <Input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="WhatsApp Number"
                className="w-full"
            />
            <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full"
            />
            <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                required
                className="w-full"
            />
            <Select
                onValueChange={(value) => handleSelectChange("role", value)}
                defaultValue={formData.role || ""}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
            </Select>
            <Select
                onValueChange={(value) => handleSelectChange("status", value)}
                defaultValue={formData.status}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>

            {/* Password fields - only show for new users */}
            {!user && (
                <>
                    <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        className="w-full"
                        minLength={6}
                    />
                    <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        required
                        className="w-full"
                        minLength={6}
                    />
                </>
            )}

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : user ? "Update User" : "Add User"}
            </Button>
        </form>
    );
}