import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FormBtn from "../FormBtn";
import { useState } from "react";
import Modal from "../Modal";

// Define the interface for form data
interface CreateUserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "professional" | "admin";
}

function CreateUserForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormData>({
    defaultValues: {
      role: "professional", // Default role
    },
  });

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });


  const onSubmit = async (data: CreateUserFormData) => {
    const accessToken = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:3000/api/admin/user/create", data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setModal({
          isOpen: true,
          title: "Success",
          message: "User created successfully!",
          type: "success",
          onConfirm: () => navigate("/admin/users")
      });
    } catch (error: any) {
      setModal({
          isOpen: true,
          title: "Creation Failed",
          message: error.response?.data?.message || "Failed to create user.",
          type: "error"
      });
      console.error("User creation error:", error);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">Create New User</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center">Enter the details for the new account.</p>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Full name is required" })}
              className="mt-1 block w-full input-style"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              id="username"
              type="text"
              {...register("username", { required: "Username is required" })}
              className="mt-1 block w-full input-style"
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }})}
              className="mt-1 block w-full input-style"
              placeholder="user@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
              className="mt-1 block w-full input-style"
              placeholder="••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              id="role"
              {...register("role", { required: "Role is required" })}
              className="mt-1 block w-full input-style"
            >
              <option value="professional">Professional</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
          
          <div className="pt-2">
            <FormBtn name="Create User" />
          </div>
        </form>
      </div>
    </div>
    <Modal
      isOpen={modal.isOpen}
      onClose={() => {
          const onConfirm = modal.onConfirm;
          setModal({ ...modal, isOpen: false });
          if (onConfirm) {
              onConfirm();
          }
      }}
      title={modal.title}
      type={modal.type}
    >
      {modal.message}
    </Modal>
    </>
  );
}

export default CreateUserForm;