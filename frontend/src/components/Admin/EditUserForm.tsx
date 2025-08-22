import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FormBtn from "../FormBtn";
import { useState } from "react";
import Modal from "../Modal";
import type { IAuthUserList } from "../../pages/Admin/UserListPage";

interface EditUserFormData {
  name: string;
  username: string;
  email: string;
  role: "professional" | "admin";
}

interface EditUserFormProps {
    userData: IAuthUserList;
}

function EditUserForm({ userData }: EditUserFormProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<EditUserFormData>({
    defaultValues: {
      name: userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role as "professional" | "admin",
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

  const onSubmit = async (data: EditUserFormData) => {
    const accessToken = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:3000/api/admin/user/${userData._id}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setModal({
          isOpen: true,
          title: "Success",
          message: "User updated successfully!",
          type: "success",
          onConfirm: () => navigate("/admin/users")
      });
    } catch (error: any) {
      setModal({
          isOpen: true,
          title: "Update Failed",
          message: error.response?.data?.message || "Failed to update user.",
          type: "error"
      });
      console.error("User update error:", error);
    }
  };

  return (
    <>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">Edit User</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center">Update the account details below.</p>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Full name is required" })}
            className="mt-1 block w-full input-style"
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
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
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
          <FormBtn name="Save Changes" />
        </div>
      </form>
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

export default EditUserForm;