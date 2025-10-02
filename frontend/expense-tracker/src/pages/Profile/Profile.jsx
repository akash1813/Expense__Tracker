import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { FiUser, FiImage, FiLock } from 'react-icons/fi';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';

const Profile = () => {
  const { user, updateUser, loading } = useUserAuth();

  const [fullName, setFullName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || '');
  }, [user?.fullName]);

  const handleSaveName = async () => {
    if (savingName) return;
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSavingName(true);
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE, { fullName: fullName.trim() });
      if (res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile updated');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (savingPassword) return;
    if (!currentPassword || !newPassword) {
      toast.error('Please fill both current and new password');
      return;
    }
    try {
      setSavingPassword(true);
      await axiosInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUploadImage = async () => {
    if (uploadingImage || !imageFile) {
      toast.error('Please select an image file');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      setUploadingImage(true);
      
      // Use the backend endpoint for image upload
      const res = await axiosInstance.post(API_PATHS.AUTH.UPLOAD_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile image updated successfully');
        setImageFile(null);
      } else {
        throw new Error(res.data?.message || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout activeMenu="Profile">
      <div className="my-6 mx-auto max-w-5xl">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-pink-50 mb-6">
          <div className="absolute inset-0 pointer-events-none opacity-70" aria-hidden>
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 400">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="100%" stopColor="#fbcfe8" />
                </linearGradient>
              </defs>
              <circle cx="90" cy="60" r="80" fill="url(#g)" opacity="0.25" />
              <circle cx="520" cy="320" r="120" fill="url(#g)" opacity="0.2" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6">
            <div className="shrink-0">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-200 border border-slate-300" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-semibold text-slate-800">
                {user?.fullName || 'Your Name'}
              </h1>
              {user?.email && (
                <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">Manage your personal information and security settings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Update Name */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <FiUser className="text-primary" />
              <h2 className="font-medium">Update Name</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1 text-slate-600">Full Name</label>
                <input
                  className="w-full border border-slate-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-lg px-3 py-2 outline-none bg-white"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white shadow hover:shadow-md disabled:opacity-60"
                  onClick={handleSaveName}
                  disabled={savingName}
                >
                  {savingName ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <FiLock className="text-primary" />
              <h2 className="font-medium">Change Password</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1 text-slate-600">Current Password</label>
                <input
                  type="password"
                  className="w-full border border-slate-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-lg px-3 py-2 outline-none"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-600">New Password</label>
                <input
                  type="password"
                  className="w-full border border-slate-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-lg px-3 py-2 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white shadow hover:shadow-md disabled:opacity-60"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Upload Image */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <FiImage className="text-primary" />
              <h2 className="font-medium">Profile Picture</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="shrink-0">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Current Profile"
                    className="w-20 h-20 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200" />
                )}
                <p className="text-[11px] text-slate-400 mt-2 text-center">Current</p>
              </div>

              <div className="flex-1 w-full">
                <ProfilePhotoSelector image={imageFile} setImage={setImageFile} />
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white shadow hover:shadow-md disabled:opacity-60"
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
