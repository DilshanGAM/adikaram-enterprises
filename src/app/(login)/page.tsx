"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import "./login.css";
import TypingAnimation from "@/components/ui/typing-animation";
import BlurIn from "@/components/ui/blur-in";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    
	const handleLogin = () => {
		setLoading(true);
		axios.post("/api/auth/login", {
            email: email,
            password: password
        }).then((res) => {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setLoading(false);
            if(res.data.user.role === "admin") router.push("/admin");
            if(res.data.user.role === "manager") router.push("/admin");
        }).catch((err) => {
            toast.error(err.response?.data?.message || "Failed to login");
            setLoading(false);
        });
	};

	return (
		<div className="login-bg flex flex-col">
			<main className="flex flex-col md:flex-row w-full h-full">
				{/* Left Section */}
				<div className="w-full md:w-[50%] h-full flex flex-col items-center justify-center px-6 text-center">
                    <BlurIn word="Adikaram Enterprises" className="text-4xl font-bold text-white" />
					<TypingAnimation
						className="text-4xl font-bold text-white dark:text-white"
						text="That's What I Like 🤟"
						duration={100}
					/>
					
				</div>

				{/* Right Section */}
				<div className="w-full md:w-[50%] h-full backdrop-blur-lg flex items-center justify-center px-6">
					<Card className="w-full max-w-md bg-transparent text-white">
						<CardHeader>
							<CardTitle className="text-center text-2xl font-semibold">
								Login
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form className="space-y-4">
								<div>
									<Label htmlFor="email">Email</Label>
									<Input
										type="email"
										id="email"
										placeholder="Enter your email"
										required
                                        onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
								<div>
									<Label htmlFor="password">Password</Label>
									<Input
										type="password"
										id="password"
										placeholder="Enter your password"
										required
                                        onChange={(e) => setPassword(e.target.value)}
									/>
								</div>
								<Button
									onClick={handleLogin}
									className="w-full"
									disabled={loading}
									variant="default"
								>
									{loading ? "Logging in..." : "Login"}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</main>
			<footer className="fixed bottom-0  flex gap-6 flex-wrap items-center justify-center mt-6 text-white">
				<p>&copy; 2024 Adikaram Enterprises</p>
				<p>All rights reserved.</p>
			</footer>
		</div>
	);
}
