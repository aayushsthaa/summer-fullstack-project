import { useState, useEffect } from "react";
import axios from "axios";
import FormBtn from "./FormBtn";
import Modal from "./Modal";

export interface IProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  github: string;
  linkedin: string;
  portfolioUrl: string;
}

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: IProfileData | null;
  onUpdate: (updatedData: IProfileData) => void;
}

function ProfileForm({ isOpen, onClose, profileData, onUpdate }: ProfileFormModalProps) {
  const [formData, setFormData] = useState<Partial<IProfileData>>({});
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: "", message: "", type: "error" as "error" | "success" });

  useEffect(() => {
    if (profileData && isOpen) {
      setFormData(profileData);
    }
  }, [profileData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("token");
    try {
      const res = await axios.put("http://localhost:3000/users/profile/me", formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const updatedUser = res.data.user;
      const updatedProfile = res.data.profile;
      const fullProfile: IProfileData = {
        name: updatedUser.name || "",
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        bio: updatedProfile.bio || "",
        github: updatedProfile.github || "",
        linkedin: updatedProfile.linkedin || "",
        portfolioUrl: updatedProfile.portfolioUrl || "",
      };

      onUpdate(fullProfile);
      setNotificationModal({ isOpen: true, title: "Profile Updated", message: "Your profile was updated successfully.", type: "success" });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setNotificationModal({ isOpen: true, title: "Update Failed", message: "Failed to update profile. Please try again.", type: "error" });
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input type="text" id="name" name="name" value={formData.name || ""} onChange={handleInputChange} className="mt-1 block w-full input-style" />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
            <textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleInputChange} rows={4} className="mt-1 block w-full input-style" placeholder="Tell us a bit about yourself" />
          </div>

          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
            <input type="url" id="github" name="github" value={formData.github || ""} onChange={handleInputChange} className="mt-1 block w-full input-style" placeholder="https://github.com/username"/>
          </div>

          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
            <input type="url" id="linkedin" name="linkedin" value={formData.linkedin || ""} onChange={handleInputChange} className="mt-1 block w-full input-style" placeholder="https://linkedin.com/in/username"/>
          </div>

          <div>
            <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio URL</label>
            <input type="url" id="portfolioUrl" name="portfolioUrl" value={formData.portfolioUrl || ""} onChange={handleInputChange} className="mt-1 block w-full input-style" placeholder="https://your-portfolio.com"/>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200">Cancel</button>
            <FormBtn name="Save Changes" />
          </div>
        </form>
      </div>
    </div>
    <Modal
        isOpen={notificationModal.isOpen}
        onClose={() => {
          const wasSuccess = notificationModal.type === 'success';
          setNotificationModal({ ...notificationModal, isOpen: false });
          if (wasSuccess) {
            onClose(); // Close the form modal on success
          }
        }}
        title={notificationModal.title}
        type={notificationModal.type}
      >
        {notificationModal.message}
      </Modal>
    </>
  );
}

export default ProfileForm;