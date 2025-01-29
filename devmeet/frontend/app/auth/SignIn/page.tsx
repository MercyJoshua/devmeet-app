"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import useUserStore from "@/app/store/userStore";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password_hash, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const setUser = useUserStore((state) => state.setUser); // Call hook here

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "/api/auth/signin",
        { email, password_hash },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const userResponse = await axios.get(
          "/api/auth/user",
          {
            withCredentials: true,
          }
        );

        const { id, username, full_name } = userResponse.data;
        setUser(id, username, full_name);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Something went wrong. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-slate-900 to-gray-950">
      <h1 className="text-4xl font-bold text-white mb-8">Sign In</h1>
      <form
        onSubmit={handleSignIn}
        className="backdrop-blur-md bg-gradient-to-r from-slate-900 to-gray-950 p-8 rounded-lg border border-purple-500 shadow-lg max-w-md w-full"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            className="w-full px-4 py-2 mt-2 border rounded-lg bg-gray-900 text-white focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-white">Password</label>
          <input
            name="password_hash"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 mt-2 border rounded-lg bg-gray-900 text-white focus:outline-none"
            value={password_hash}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-2 mt-4 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignIn;
