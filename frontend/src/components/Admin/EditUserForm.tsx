import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Modal from "../Modal";
import type { IEditableUserData } from "../../pages/Admin/EditUserPage";

interface EditUserFormProps {
    userData: IEditableUserData;
}

function EditUserForm({ userData }: EditUserFormProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { register, handleSubmit, control, reset, getValues, formState: { errors } } = useForm<IEditableUserData>({
    defaultValues: userData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const [newSkill, setNewSkill] = useState({ name: "", level: "Beginner" as "Beginner" | "Intermediate" | "Advanced" });
  const [skillError, setSkillError] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "", type: "error" });

  useEffect(() => {
    reset(userData);
  }, [userData, reset]);

  const handleAddSkill = () => {
    const trimmedName = newSkill.name.trim();
    if (trimmedName === "") {
        setSkillError("Skill name cannot be empty.");
        return;
    }
    const currentSkills = getValues('skills') || [];
    if (currentSkills.some(skill => skill.name.toLowerCase() === trimmedName.toLowerCase())) {
        setSkillError("This skill has already been added.");
        return;
    }
    append({ name: trimmedName, level: newSkill.level });
    setNewSkill({ name: "", level: "Beginner" });
    setSkillError(null);
  };

  const onSubmit = async (data: IEditableUserData) => {
    const accessToken = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:3000/api/admin/user/${userData._id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(step => step + 1);
  };
  
  const prevStep = () => {
      if (currentStep > 1) setCurrentStep(step => step - 1);
  };

  const stepTitles = ["Account Details", "Profile & Skills", "Social Links"];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-2xl flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User: {userData.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {currentStep}: {stepTitles[currentStep - 1]}</p>
                 </div>
             </div>
             <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-4">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((currentStep -1) / (totalSteps - 1)) * 100}%` }}></div>
             </div>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto p-6 sm:p-8">
              <div className="space-y-6">
                  {currentStep === 1 && (
                       <div className="animate-fade-in space-y-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" id="name" {...register("name", { required: "Full name is required" })} className="mt-1 block w-full input-style" />
                          </div>
                          <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                            <input type="text" id="username" {...register("username", { required: "Username is required" })} className="mt-1 block w-full input-style" />
                          </div>
                           <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" id="email" {...register("email", { required: "Email is required" })} className="mt-1 block w-full input-style" />
                          </div>
                          <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                            <select id="role" {...register("role")} className="mt-1 block w-full input-style">
                                <option value="professional">Professional</option>
                                <option value="admin">Admin</option>
                            </select>
                          </div>
                       </div>
                  )}
                  {currentStep === 2 && (
                      <div className="animate-fade-in space-y-6">
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                            <textarea id="bio" {...register("bio")} rows={4} className="mt-1 block w-full input-style" placeholder="User's bio" />
                          </div>
                          <div>
                            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Skills</h3>
                            <div className="space-y-2">
                              {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                  <input
                                    {...register(`skills.${index}.name` as const)}
                                    className="input-style flex-grow"
                                  />
                                  <select
                                    {...register(`skills.${index}.level` as const)}
                                    className="input-style"
                                  >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                  </select>
                                  <button type="button" onClick={() => remove(index)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                      </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                <input
                                    value={newSkill.name}
                                    onChange={(e) => {
                                      setNewSkill({ ...newSkill, name: e.target.value });
                                      if (skillError) setSkillError(null);
                                    }}
                                    className="input-style flex-grow"
                                    placeholder="Add new skill..."
                                />
                                <select value={newSkill.level} onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })} className="input-style">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                                <button type="button" onClick={handleAddSkill} className="text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2">Add</button>
                            </div>
                            {skillError && <p className="text-red-500 text-xs mt-1">{skillError}</p>}
                          </div>
                      </div>
                  )}
                  {currentStep === 3 && (
                      <div className="animate-fade-in space-y-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Social Links</h3>
                          <div>
                            <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                            <input type="url" id="github" {...register("github")} className="mt-1 block w-full input-style" />
                          </div>
                          <div>
                            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
                            <input type="url" id="linkedin" {...register("linkedin")} className="mt-1 block w-full input-style" />
                          </div>
                          <div>
                            <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio URL</label>
                            <input type="url" id="portfolioUrl" {...register("portfolioUrl")} className="mt-1 block w-full input-style" />
                          </div>
                      </div>
                  )}
              </div>
            </div>
            {/* Footer */}
            <div className="flex-shrink-0 flex justify-between gap-4 p-6 sm:p-8 border-t border-gray-200 dark:border-gray-700">
                <div>
                    {currentStep > 1 && (
                        <button type="button" onClick={prevStep} className="py-2 px-6 rounded-md text-sm font-semibold transition-colors duration-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200">
                            Previous
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/admin/users" className="py-2 px-6 rounded-md text-sm font-semibold transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</Link>
                    {currentStep < totalSteps && (
                        <button type="button" onClick={nextStep} className="text-white py-2 px-6 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-semibold">
                            Next
                        </button>
                    )}
                    {currentStep === totalSteps && (
                        <button type="submit" className="text-white py-2 px-6 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-semibold">
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
          </form>
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

export default EditUserForm;