"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import axios from "axios";
import { ProductType } from "@/types/user";
import supabase from "@/config/supabase";

interface ProductFormProps {
	product?: ProductType | null;
	onSuccess?: () => void; // Callback for when the form succeeds
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
	const [formData, setFormData] = useState({
		key: product?.key || "",
		name: product?.name || "",
		stock: product?.stock || "",
		container_type: product?.container_type || "",
		uom: product?.uom || "",
		volume: product?.volume || "",
		flavour: product?.flavour || "",
		default_labeled_price: product?.default_labeled_price || "",
		default_cost: product?.default_cost || "",
		status: product?.status || "active",
		product_image: product?.product_image || "/default.jpg",
	});
	const [file, setFile] = useState<File | null>(null);

	const [loading, setLoading] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: isNaN(Number(value)) ? value : Number(value)<=0?"":Number(value),
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files&&files.length>0) {
			setFile(files[0]);
		}else{
			setFile(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		if(file){
			const filename = formData.key + "_"+new Date().getTime() + file.name;

			const {data , error} = await supabase.storage.from("image-bucket").upload(filename, file);

			if(error){
				console.log(error);
				toast.error("Failed to upload image");
				setLoading(false);
				return;
			}else{
				const {data : file} = supabase.storage.from("image-bucket").getPublicUrl(filename);
				if(file){
					formData.product_image = file?.publicUrl;
					toast.success("Image uploaded please wait ....");
					console.log(file.publicUrl);
				}else{
					toast.error("Failed to get image url");
					setLoading(false);
					return;
				}
				
			}
		}



		try {
			const token = localStorage.getItem("token");
			if (product) {
				// Edit product
				await axios.put(`/api/products?key=${product.key}`, formData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				toast.success("Product updated successfully!");
			} else {
				// Add new product
				await axios.post("/api/products", formData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				toast.success("Product added successfully!");
			}

			if (onSuccess) onSuccess(); // Trigger the callback if provided
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Failed to save product");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Key */}
			<Input
				name="key"
				value={formData.key}
				onChange={handleChange}
				placeholder="Product Key"
				required
				disabled={!!product} // Disable editing key for existing products
				className="w-full"
			/>

			{/* Name */}
			<Input
				name="name"
				value={formData.name}
				onChange={handleChange}
				placeholder="Product Name"
				required
				className="w-full"
			/>

			{/* Stock */}
			<Input
				name="stock"
				type="number"
				value={formData.stock}
				onChange={handleChange}
				placeholder="Stock Quantity"
				required
				className="w-full"
			/>

			{/* Container Type */}
			<Input
				name="container_type"
				value={formData.container_type}
				onChange={handleChange}
				placeholder="Container Type"
				required
				className="w-full"
			/>

			{/* UOM */}
			<Input
				name="uom"
				type="number"
				value={formData.uom}
				onChange={handleChange}
				placeholder="Unit of Measure (UOM)"
				required
				className="w-full"
			/>

			{/* Volume */}
			<Input
				name="volume"
				type="number"
				step="0.01"
				value={formData.volume}
				onChange={handleChange}
				placeholder="Volume (e.g., 500ml)"
				required
				className="w-full"
			/>

			{/* Flavor */}
			<Input
				name="flavour"
				value={formData.flavour}
				onChange={handleChange}
				placeholder="Flavor"
				required
				className="w-full"
			/>

			{/* Default Labeled Price */}
			<Input
				name="default_labeled_price"
				type="number"
				step="0.01"
				value={formData.default_labeled_price}
				onChange={handleChange}
				placeholder="Default Labeled Price"
				required
				className="w-full"
			/>
			
			{/* Default Cost Price */}
			<Input
				name="default_cost"
				type="number"
				step="0.01"
				value={formData.default_cost}
				onChange={handleChange}
				placeholder="Default Cost Price"
				required
				className="w-full"
			/>

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
					<SelectItem value="discontinued">Discontinued</SelectItem>
				</SelectContent>
			</Select>		

			{/* Product Image file */}
			<div className="grid w-full max-w-sm items-center gap-1.5 relative">
				<Label htmlFor="picture">Picture</Label>
				<Input id="picture" type="file"  onChange={handleFileChange}/>				
				<img src={file?URL.createObjectURL(file):formData.product_image} alt="product" className="h-[40px] w-[40px] absolute right-[-45px] bottom-0"/>
				
			</div>

			{/* Submit Button */}
			<Button type="submit" disabled={loading} className="w-full">
				{loading ? "Saving..." : product ? "Update Product" : "Add Product"}
			</Button>
		</form>
	);
}
