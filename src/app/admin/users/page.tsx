"use client";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import UserForm from "@/components/ui/add-user-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Pagination from "@/components/ui/paginationNew";
import { UserType } from "@/types/user";
import TableSkeletonLoader from "@/components/ui/table-skeleton-loader";
import debounce from "lodash/debounce";

export default function AdminUsersPage() {
  const PAGE_SIZE = 10;
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [deleteUserEmail, setDeleteUserEmail] = useState("");
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch users with pagination
  const fetchUsers = async () => {
    setUsersLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE,
          search,
        },
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((searchTerm : string) => {
      const token = localStorage.getItem("token");
      setUsersLoading(true);
      axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE,
          search: searchTerm,
        },
      })
      .then((res) => {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalItems);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to fetch users");
      })
      .finally(() => {
        setUsersLoading(false);
      });
    }, 500), // 500ms delay
    [currentPage]
  );

  useEffect(() => {
    if (!search) {
      fetchUsers();
    }
  }, [currentPage]);


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
    debouncedFetch(e.target.value);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteUser = (user: UserType) => {
    setUserToDelete(user);
    setDeleteUserEmail("");
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (deleteUserEmail !== userToDelete?.email) {
      toast.error("Entered email does not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`/api/users?email=${userToDelete?.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User deleted successfully.");
      setIsDeleteModalOpen(false);
      fetchUsers();

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Users</h1>

      {usersLoading ? (
          <TableSkeletonLoader />
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by name, email, or role"
              value={search}
              onChange={handleSearch}
              className="w-full max-w-md"
            />
            <Button onClick={fetchUsers}>Refresh</Button>
            <Dialog
              open={isAddEditModalOpen}
              onOpenChange={setIsAddEditModalOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedUser ? "Edit User" : "Add User"}
                  </DialogTitle>
                </DialogHeader>
                <UserForm
                  user={selectedUser}
                  onSuccess={() => {
                    setIsAddEditModalOpen(false);
                    fetchUsers();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>


          <div className="grid grid-cols-1 gap-4 lg:hidden">
  {users.length > 0 ? (
    users.map((user) => (
      <div
        key={user.email}
        className="p-4 border rounded shadow-sm bg-white flex flex-col gap-2"
      >
        <h3 className="font-bold text-lg">{user.name} {" "} 
        <span
            className={`inline-block w-3 h-3 rounded-full ${
              user.status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>{" "}
        </h3>
        <p className="text-sm text-gray-500 flex justify-between">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-sm text-gray-500 flex justify-between">
          <strong>Phone:</strong> {user.phone}
        </p>
        <p className="text-sm text-gray-500 flex justify-between">
          <strong>Role:</strong> {user.role}
        </p>
        {/* <p className="text-sm text-gray-500 ">
          <strong>Status:</strong>{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              user.status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>{" "}
          {user.status}
        </p> */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditUser(user)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteUser(user)}
          >
            Delete
          </Button>
        </div>
      </div>
    ))
  ) : (
    <div className="text-center text-gray-500">No users found.</div>
  )}
</div>

          <div className="overflow-auto hidden lg:block">
            <Table>
              <TableCaption>A list of all registered users.</TableCaption>
              <TableHeader >
                <TableRow  className="bg-[#dbdde2] hover:bg-[#dbdde2] font-bold text-[#4B5563]">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              user.status === "active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            )}
                          ></div>
                          <span>{user.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {users.length} of {totalItems} users
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
                Enter the email of the user (
                <strong>{userToDelete?.email}</strong>) to confirm deletion.
              </p>
              <Input
                placeholder="Enter user email"
                value={deleteUserEmail}
                onChange={(e) => setDeleteUserEmail(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser}>
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
