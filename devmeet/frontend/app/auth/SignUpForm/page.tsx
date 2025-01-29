 /* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */

 "use client"
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import useUserStore from "../../store/userStore";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password_hash: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const setUser = useUserStore((state) => state.setUser); // Call hook here

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password_hash !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        password_hash: formData.password_hash,
      });

      if (response.status === 201) {
        setUser(response.data.id, formData.username, formData.full_name);
        router.push("/dashboard");
      }
      
    } catch (err: any) { // Use AxiosError instead of any
      setError(err.response?.data?.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-slate-900 to-gray-950">
      <h1 className="text-4xl font-bold text-white mb-8">Sign Up to Devmeet</h1>
      <form
        onSubmit={handleSignUp}
        className="backdrop-blur-md bg-gradient-to-r from-slate-900 to-gray-950 p-8 rounded-lg border border-purple-500 shadow-lg max-w-md w-full"
      >
        <InputField
          label="Full Name"
          name="full_name"
          type="text"
          value={formData.full_name}
          placeholder="Your full name"
          onChange={handleChange}
        />
        <InputField
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          placeholder="Your username"
          onChange={handleChange}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          placeholder="you@company.com"
          onChange={handleChange}
        />
        <InputField
          label="Password"
          name="password_hash"
          type="password"
          value={formData.password_hash}
          placeholder="••••••••"
          onChange={handleChange}
        />
        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          placeholder="••••••••"
          onChange={handleChange}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-2 mt-4 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

// Separate InputField component to reduce redundancy
const InputField = ({
  label,
  name,
  type,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-white">{label}</label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      className="w-full px-4 py-2 mt-2 border border-white/20 rounded-lg bg-white/30 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      value={value}
      onChange={onChange}
    />
  </div>
);

export default SignUpForm;
