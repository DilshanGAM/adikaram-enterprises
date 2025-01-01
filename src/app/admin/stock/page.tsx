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
import Pagination from "@/components/ui/paginationNew";
import ProductForm from "@/components/ui/add-product-form";
import { ProductType } from "@/types/user";
import TableSkeletonLoader from "@/components/ui/table-skeleton-loader";

export default function StockAdminPage() {
  const PAGE_SIZE = 10; 
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProductKey, setDeleteProductKey] = useState("");
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = async () => {
    setProductsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE,
          search,
        },
      });
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsAddEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddEditModalOpen(false);
    fetchProducts();
  };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setDeleteProductKey("");
    setIsDeleteModalOpen(true);
  };

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
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Admin Page</h1>

      {productsLoading ? (
         <TableSkeletonLoader />
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by product name or key"
              value={search}
              onChange={handleSearch}
              className="w-full max-w-md"
            />
            <Button onClick={fetchProducts}>Refresh</Button>
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
                <ProductForm product={selectedProduct} onSuccess={handleModalClose} />
              </DialogContent>
            </Dialog>
          </div>


          <div className="lg:hidden grid grid-cols-1 gap-4">
  {products.length > 0 ? (
    products.map((product: any) => (
      <div
        key={product.key}
        className="p-4 border rounded shadow-sm bg-white flex flex-col gap-2"
      >
        <div className="flex items-center gap-4">
          <img
            src={product.product_image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-500">Key: {product.key}</p>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <strong>Stock:</strong> {product.stock}
        </div>
        <div className="flex justify-between text-sm">
          <strong>Container Type:</strong> {product.container_type}
        </div>
        <div className="flex justify-between text-sm">
          <strong>UOM:</strong> {product.uom}
        </div>
        <div className="flex justify-between text-sm">
          <strong>Volume:</strong> {product.volume}
        </div>
        <div className="flex justify-between text-sm">
          <strong>Flavour:</strong> {product.flavour}
        </div>
        <div className="flex justify-between text-sm">
          <strong>Price:</strong> {product.default_labeled_price}
        </div>
        <div className="flex justify-between text-sm">
          <strong>Cost:</strong> {product.default_cost}
        </div>
        <div className="flex justify-between text-sm">
          <strong>Status:</strong> {product.status}
        </div>
        <div className="mt-2 flex gap-2">
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
      </div>
    ))
  ) : (
    <div className="text-center text-gray-500">No products found.</div>
  )}
</div>


          <div className="overflow-auto hidden lg:block">
            <Table>
              <TableCaption>A list of all products in stock.</TableCaption>
              <TableHeader>
                <TableRow className="bg-[#dbdde2] hover:bg-[#dbdde2] font-bold text-[#4B5563]">
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
                {products.length > 0 ? (
                  products.map((product: any) => (
                    <TableRow key={product.key}>
                      <TableCell>
                        <img
                          src={product.product_image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
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

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {products.length} of {totalItems} products
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>

          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p className="mb-4">
                Enter the key of the product (<strong>{productToDelete?.key}</strong>) to confirm deletion.
              </p>
              <Input
                placeholder="Enter product key"
                value={deleteProductKey}
                onChange={(e) => setDeleteProductKey(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
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
