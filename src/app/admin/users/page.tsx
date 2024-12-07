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
import { cn } from "@/lib/utils";
import UserForm from "@/components/ui/add-user-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { UserType } from "@/types/user";

export default function AdminUsersPage() {
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [usersLoading, setUsersLoading] = useState(true);
	const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null); // For editing users
	const [deleteUserEmail, setDeleteUserEmail] = useState(""); // Email entered for confirmation
	const [userToDelete, setUserToDelete] = useState<UserType | null>(null); // User to delete

	// Fetch users from the API
	useEffect(() => {
		const fetchUsers = async () => {
			const token = localStorage.getItem("token");
			try {
				const res = await axios.get("/api/users", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setUsers(res.data.users);
				setFilteredUsers(res.data.users);
			} catch (err: any) {
				toast.error(err.response?.data?.message || "Failed to fetch users");
			} finally {
				setUsersLoading(false);
			}
		};

		if (usersLoading) fetchUsers();
	}, [usersLoading]);

	// Handle search input
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		const filtered = users.filter(
			(user: any) =>
				user.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
				user.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
				user.role.toLowerCase().includes(e.target.value.toLowerCase())
		);
		setFilteredUsers(filtered);
	};

	// Determine status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-500";
			case "deactivated":
				return "bg-red-500";
			default:
				return "bg-yellow-500";
		}
	};

	// Open modal for adding a new user
	const handleAddUser = () => {
		setSelectedUser(null); // No user selected for adding
		setIsAddEditModalOpen(true);
	};

	// Open modal for editing an existing user
	const handleEditUser = (user: any) => {
		setSelectedUser(user); // Set the user to be edited
		setIsAddEditModalOpen(true);
	};

	// Close modal and refresh the user list
	const handleModalClose = () => {
		setIsAddEditModalOpen(false);
		setUsersLoading(true); // Refresh users after adding/editing
	};

	// Open delete confirmation modal
	const handleDeleteUser = (user: any) => {
		setUserToDelete(user);
		setDeleteUserEmail(""); // Clear the input field
		setIsDeleteModalOpen(true);
	};

	// Confirm and delete user
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
			setUsersLoading(true); // Refresh users after deletion
            //check is logout is needed in the res
            if(res.data.logout) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
		} catch (err: any) {
			toast.error(err.response?.data?.message || "Failed to delete user.");
		}
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Admin Users</h1>

			{/* Loading Message */}
			{usersLoading ? (
				<div className="text-center text-lg font-medium text-gray-700">
					Loading, please wait...
				</div>
			) : (
				<>
					{/* Search and Actions */}
					<div className="flex items-center gap-4 mb-4">
						<Input
							placeholder="Search by name, email, or role"
							value={search}
							onChange={handleSearch}
							className="w-full max-w-md"
						/>
						<Button onClick={() => setUsersLoading(true)}>Refresh</Button>
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
								<UserForm user={selectedUser} onSuccess={handleModalClose} />
							</DialogContent>
						</Dialog>
					</div>
					{/* User Table */}
					<div className="overflow-auto">
						<Table>
							<TableCaption>A list of all registered users.</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>WhatsApp</TableHead>
									<TableHead>Address</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.length > 0 ? (
									filteredUsers.map((user: any) => (
										<TableRow key={user.email}>
											<TableCell>{user.name}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>{user.phone}</TableCell>
											<TableCell>{user.whatsapp}</TableCell>
											<TableCell>{user.address}</TableCell>
											<TableCell>{user.title}</TableCell>
											<TableCell>{user.role}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div
														className={cn(
															"w-3 h-3 rounded-full",
															getStatusColor(user.status)
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
										<TableCell colSpan={9} className="text-center">
											No users found.
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
