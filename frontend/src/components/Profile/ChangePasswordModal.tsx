import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import Modal from "../Modal";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPassword: boolean;
  onSuccess: () => void;
}

function ChangePasswordModal({ isOpen, onClose, hasPassword, onSuccess }: ChangePasswordModalProps) {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: "", message: "", type: "error" as "error" | "success" });
  
  const newPassword = watch("newPassword");

  const onSubmit = async (data: any) => {
    const accessToken = localStorage.getItem("token");
    try {
      await axios.put("https://education-university-backend.onrender.com/users/profile/me/password", data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setNotificationModal({ isOpen: true, title: "Success", message: "Password updated successfully.", type: "success" });
    } catch (err: any) {
      setNotificationModal({ isOpen: true, title: "Update Failed", message: err.response?.data?.message || "An error occurred.", type: "error" });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };
  
  const handleNotificationClose = () => {
    const wasSuccess = notificationModal.type === 'success';
    setNotificationModal({ ...notificationModal, isOpen: false });
    if(wasSuccess){
      onSuccess();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity" role="dialog" aria-modal="true">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {hasPassword ? 'Change Password' : 'Create Password'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {hasPassword && (
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    {...register("currentPassword", { required: "Current password is required" })}
                    className="mt-1 block w-full input-style"
                  />
                  {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message as string}</p>}
                </div>
              )}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                  className="mt-1 block w-full input-style"
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message as string}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: value => value === newPassword || "The passwords do not match",
                  })}
                  className="mt-1 block w-full input-style"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
              <button type="button" onClick={handleClose} className="py-2 px-4 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors">
                Cancel
              </button>
              <button type="submit" className="py-2 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
      <Modal
        isOpen={notificationModal.isOpen}
        onClose={handleNotificationClose}
        title={notificationModal.title}
        type={notificationModal.type}
      >
        {notificationModal.message}
      </Modal>
    </>
  );
}

export default ChangePasswordModal;
