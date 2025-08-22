import { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import Modal from "../Modal";

export interface IProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  github: string;
  linkedin: string;
  portfolioUrl: string;
  skills: { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' }[];
}

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: IProfileData | null;
  onUpdate: (updatedData: IProfileData) => void;
}

function ProfileForm({ isOpen, onClose, profileData, onUpdate }: ProfileFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: "", message: "", type: "error" as "error" | "success" });

  const { register, handleSubmit, control, reset, getValues, formState: { errors } } = useForm<IProfileData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const [newSkill, setNewSkill] = useState({ name: "", level: "Beginner" as "Beginner" | "Intermediate" | "Advanced" });
  const [skillError, setSkillError] = useState<string | null>(null);

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

  useEffect(() => {
    if (profileData) {
      reset(profileData);
    }
    if (isOpen) {
        setCurrentStep(1);
    }
  }, [profileData, reset, isOpen]);

  const onSubmit = async (data: IProfileData) => {
    const accessToken = localStorage.getItem("token");
    try {
      const res = await axios.put("http://localhost:3000/users/profile/me", data, {
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
        skills: updatedProfile.skills || [],
      };

      onUpdate(fullProfile);
      setNotificationModal({ isOpen: true, title: "Profile Updated", message: "Your profile was updated successfully.", type: "success" });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setNotificationModal({ isOpen: true, title: "Update Failed", message: "Failed to update profile. Please try again.", type: "error" });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(step => step + 1);
  };
  
  const prevStep = () => {
      if (currentStep > 1) setCurrentStep(step => step - 1);
  };

  if (!isOpen) return null;

  const stepTitles = ["Personal Info", "Skills", "Social Links"];

  return (
    <>
      <div className="fixed inset-0 dark:bg-gray-900 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300" role="dialog" aria-modal="true">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {currentStep}: {stepTitles[currentStep - 1]}</p>
                 </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
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
                            <input type="text" id="name" {...register("name")} className="mt-1 block w-full input-style" />
                          </div>
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                            <textarea id="bio" {...register("bio")} rows={4} className="mt-1 block w-full input-style" placeholder="Tell us a bit about yourself" />
                          </div>
                       </div>
                  )}
                  {currentStep === 2 && (
                      <div className="animate-fade-in space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Skills</h3>
                            <div className="space-y-4">
                              {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                  <input
                                    {...register(`skills.${index}.name` as const, { required: "Skill name is required." })}
                                    className="input-style flex-grow"
                                    placeholder="Skill Name (e.g., React)"
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
                               {errors.skills && <p className="text-red-500 text-xs mt-1">Please ensure all skill names are filled out.</p>}
                            </div>

                             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-md font-medium text-gray-800 dark:text-gray-300 mb-2">Add a new skill</h4>
                                <div className="flex items-start sm:items-center gap-2 flex-col sm:flex-row">
                                    <div className="flex-grow w-full">
                                        <input
                                            value={newSkill.name}
                                            onChange={(e) => {
                                                setNewSkill({ ...newSkill, name: e.target.value });
                                                if (skillError) setSkillError(null);
                                            }}
                                            className="input-style w-full"
                                            placeholder="Skill Name (e.g., TypeScript)"
                                        />
                                    </div>
                                    <select
                                        value={newSkill.level}
                                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                                        className="input-style w-full sm:w-auto"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="w-full sm:w-auto text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md px-4 py-2 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                {skillError && <p className="text-red-500 text-xs mt-2">{skillError}</p>}
                            </div>
                          </div>
                      </div>
                  )}
                  {currentStep === 3 && (
                      <div className="animate-fade-in space-y-6">
                          <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Links</h3>
                              <div>
                                <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                                <input type="url" id="github" {...register("github")} className="mt-1 block w-full input-style" placeholder="https://github.com/username"/>
                              </div>
                              <div className="mt-4">
                                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
                                <input type="url" id="linkedin" {...register("linkedin")} className="mt-1 block w-full input-style" placeholder="https://linkedin.com/in/username"/>
                              </div>
                              <div className="mt-4">
                                <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio URL</label>
                                <input type="url" id="portfolioUrl" {...register("portfolioUrl")} className="mt-1 block w-full input-style" placeholder="https://your-portfolio.com"/>
                              </div>
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
                    <button type="button" onClick={onClose} className="py-2 px-6 rounded-md text-sm font-semibold transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
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