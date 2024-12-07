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
	user: UserType | null; // User to edit, null if adding new user
	onSuccess?: () => void; // Callback for when the form succeeds
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

		try {
			const token = localStorage.getItem("token");
			if (user) {
				// Edit user
				await axios.put(`/api/users/?email=${user.email}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
				toast.success("User updated successfully!");
			} else {
				// Add new user

				await axios.post("/api/users", formData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				toast.success("User added successfully!");
			}

			if (onSuccess) onSuccess(); // Trigger the callback if provided
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Failed to save user");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Name */}
			<Input
				name="name"
				value={formData.name}
				onChange={handleChange}
				placeholder="Full Name"
				required
				className="w-full"
			/>
			{/* Email */}
			<Input
				name="email"
				value={formData.email}
				onChange={handleChange}
				placeholder="Email Address"
				required
				disabled={!!user} // Disable editing email for existing users
				className="w-full"
			/>
			{/* Phone */}
			<Input
				name="phone"
				value={formData.phone}
				onChange={handleChange}
				placeholder="Phone Number"
				required
				className="w-full"
			/>
			{/* WhatsApp */}
			<Input
				name="whatsapp"
				value={formData.whatsapp}
				onChange={handleChange}
				placeholder="WhatsApp Number"
				className="w-full"
			/>
			{/* Address */}
			<Textarea
				name="address"
				value={formData.address}
				onChange={handleChange}
				placeholder="Address"
				className="w-full"
			/>
			{/* Title */}
			<Input
				name="title"
				value={formData.title}
				onChange={handleChange}
				placeholder="Title"
				required
				className="w-full"
			/>
			{/* Role */}
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
			{/* Status */}
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
			{/* Submit Button */}
			<Button type="submit" disabled={loading} className="w-full">
				{loading ? "Saving..." : user ? "Update User" : "Add User"}
			</Button>
		</form>
	);
}
