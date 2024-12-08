"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "@/components/ui/add-product-form";
import { ProductType } from "@/types/user";

export default function StockAdminPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // For editing products
  const [deleteProductKey, setDeleteProductKey] = useState(""); // Key entered for confirmation
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(
    null
  ); // Product to delete

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("/api/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data.products);
        setFilteredProducts(res.data.products);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch products");
      } finally {
        setProductsLoading(false);
      }
    };

    if (productsLoading) fetchProducts();
  }, [productsLoading]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const filtered = products.filter(
      (product: any) =>
        product.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        product.key.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Open modal for adding a new product
  const handleAddProduct = () => {
    setSelectedProduct(null); // No product selected for adding
    setIsAddEditModalOpen(true);
  };

  // Open modal for editing an existing product
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product); // Set the product to be edited
    setIsAddEditModalOpen(true);
  };

  // Close modal and refresh the product list
  const handleModalClose = () => {
    setIsAddEditModalOpen(false);
    setProductsLoading(true); // Refresh products after adding/editing
  };

  // Open delete confirmation modal
  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setDeleteProductKey(""); // Clear the input field
    setIsDeleteModalOpen(true);
  };

  // Confirm and delete product
  const confirmDeleteProduct = async () => {
    if (deleteProductKey !== productToDelete?.key) {
      toast.error("Entered key does not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/products?key=${productToDelete?.key}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Product deleted successfully.");
      setIsDeleteModalOpen(false);
      setProductsLoading(true); // Refresh products after deletion
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Admin Page</h1>

      {/* Loading Message */}
      {productsLoading ? (
        <div className="text-center text-lg font-medium text-gray-700">
          Loading, please wait...
        </div>
      ) : (
        <>
          {/* Search and Actions */}
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by product name or key"
              value={search}
              onChange={handleSearch}
              className="w-full max-w-md"
            />
            <Button onClick={() => setProductsLoading(true)}>Refresh</Button>
            <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedProduct ? "Edit Product" : "Add Product"}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm
                  product={selectedProduct}
                  onSuccess={handleModalClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Product Table */}
          <div className="overflow-auto">
            <Table>
              <TableCaption>A list of all products in stock.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Container Type</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Flavour</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <TableRow key={product.key}>
                      <TableCell>
                        <img
                          src={product.product_image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          width={50}
                          height={50}
                        />
                      </TableCell>
                      <TableCell>{product.key}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.container_type}</TableCell>
                      <TableCell>{product.uom}</TableCell>
                      <TableCell>{product.volume}</TableCell>
                      <TableCell>{product.flavour}</TableCell>
                      <TableCell>{product.default_labeled_price}</TableCell>
                      <TableCell>{product.default_cost}</TableCell>
                      <TableCell>{product.status}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Delete Confirmation Modal */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p className="mb-4">
                Enter the key of the product (
                <strong>{productToDelete?.key}</strong>) to confirm deletion.
              </p>
              <Input
                placeholder="Enter product key"
                value={deleteProductKey}
                onChange={(e) => setDeleteProductKey(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteProduct}>
                  Confirm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
