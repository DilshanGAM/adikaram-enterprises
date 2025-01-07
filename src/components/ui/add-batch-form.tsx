"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import axios from "axios";
import { BatchType, ProductType } from "@/types/user";

interface BatchFormProps {
	batch?: BatchType | null;
	onSuccess?: () => void; // Callback for when the form succeeds
}

export default function BatchForm({ batch, onSuccess }: BatchFormProps) {
	const [formData, setFormData] = useState({
		product_key: batch?.product_key || "",
		uom: batch?.uom || "",
		packs: batch?.packs || "",
		loose: batch?.loose || "",
		mfd: batch?.mfd || "",
		exp: batch?.exp || "",
		cost: batch?.cost || "",
		labeled_price: batch?.labeled_price || "",
		purchase_invoice_id: batch?.purchase_invoice_id || ""
	});

	const [loading, setLoading] = useState(false);
    const [productList, setProductList] = useState<ProductType[]>([]);
	const [productsLoaded, setProductsLoaded] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			const token = localStorage.getItem("token");
			try {
				const res = await axios.get("/api/products", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setProductList(res.data.products);
			} catch (err: any) {
				toast.error(err.response?.data?.message || "Failed to fetch products");
			} finally {
				setProductsLoaded(true);
			}
		};
		if (!productsLoaded) fetchProducts();
	}, [productsLoaded]);
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: isNaN(Number(value))
				? value
				: Number(value) <= 0
				? ""
				: Number(value),
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
        //find the product from the list
        const product: ProductType | null = productList.find((p: ProductType) => p.key === value) ?? null;
        //set default UOM, cost and labeled price
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            uom: product?.uom||"",
            cost: product?.default_cost || "",
            labeled_price: product?.default_labeled_price || ""
        }));
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
        console.log(formData);
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label>Name</Label>
                    <Select
                        value={formData.product_key}
                        onValueChange={(e:any) => {handleSelectChange("product_key", e)}}
                    >
                        <SelectTrigger>Select a product</SelectTrigger>
                        <SelectContent>
                            {productList.map((product:ProductType) => (
                                <SelectItem key={product.key} value={product.key}>
                                    {product.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>UOM</Label>
                    <Input
                        type="number"
                        name="uom"
                        value={formData.uom}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label>Packs</Label>
                    <Input
                        type="number"
                        name="packs"
                        value={formData.packs}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Label>Loose</Label>
                    <Input
                        type="number"
                        name="loose"
                        value={formData.loose}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label>MFD</Label>
                    <Input
                        type="date"
                        name="mfd"
                        value={formData.mfd.toString()}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Label>EXP</Label>
                    <Input
                        type="date"
                        name="exp"
                        value={formData.exp.toString()}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label>Cost</Label>
                    <Input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Label>Labeled Price</Label>
                    <Input
                        type="number"
                        name="labeled_price"
                        value={formData.labeled_price}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div>
                <Label>Purchase Invoice ID</Label>
                <Input
                    type="text"
                    name="purchase_invoice_id"
                    value={formData.purchase_invoice_id}
                    onChange={handleChange}
                />
            </div>

			<Button type="submit" disabled={loading} className="w-full">
				{loading ? "Saving..." : batch ? "Update Batch" : "Add Batch"}
			</Button>
		</form>
	);
}
