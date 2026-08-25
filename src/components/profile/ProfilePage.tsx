import React, { useState } from 'react';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Camera, Loader2, Moon, Sun, Key } from 'lucide-react';
import { toast } from 'sonner';
import UsageIndicator from '../UsageIndicator';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, signOut } = useAuthStore();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [darkMode, setDarkMode] = useState(() => 
    window.localStorage.getItem('theme') === 'dark'
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingAvatar(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // First, remove old avatar if it exists
      if (user.avatar_url) {
        const oldFileName = user.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || newUsername === user.username) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Username updated successfully');
      setEditingUsername(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update username');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-jet-700">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-jet-700 rounded-full cursor-pointer hover:bg-jet-600 transition-colors">
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="space-y-1">
              {editingUsername ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input"
                    placeholder="Enter new username"
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    className="btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUsername(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">
                    {user.username}
                  </h2>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="btn-icon-secondary"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => signOut()}
              className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="card space-y-6">
        <h3 className="text-lg font-medium text-white">
          Subscription
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">Current Plan</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-white capitalize">
                {user.subscriptionTier}
              </span>
              {user.subscriptionEndsAt && (
                <span className="text-sm text-gray-400">
                  (Expires {format(user.subscriptionEndsAt, 'PP')})
                </span>
              )}
            </div>
          </div>

          {user.subscriptionTier === 'pro' && (
            <div>
              <div className="text-sm text-gray-400 mb-2">API Key</div>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-400" />
                <code className="text-sm bg-jet-900 px-2 py-1 rounded">
                  {user.apiKey || 'No API key generated'}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="card space-y-6">
        <h3 className="text-lg font-medium text-white">
          Usage This Month
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">PDF Conversions</div>
            <UsageIndicator type="pdfConversions" />
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">Image Compressions</div>
            <UsageIndicator type="imageCompressions" />
          </div>
        </div>
      </div>
    </div>
  );
}