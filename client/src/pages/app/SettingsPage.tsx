import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signout, refreshProfile } = useAuth();

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      await api.updateProfile({ displayName });
      await refreshProfile();
      setProfileMessage('Profile information updated successfully.');
    } catch {
      setProfileMessage('Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Verify your current password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      signout();
      navigate('/');
    } catch {
      signout();
      navigate('/');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Account & Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your organizer profile, credentials, and event workspace ownership.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-slate-700" />
          <h2 className="font-bold text-sm text-slate-900">Profile Information</h2>
        </div>

        {profileMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address (Identity)</label>
            <input
              type="text"
              disabled
              value={user?.email || 'organizer@eventpilot.com'}
              className="mt-1 block w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* 2. Security & Password Change */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-slate-700" />
          <h2 className="font-bold text-sm text-slate-900">Security & Credentials</h2>
        </div>

        {user?.isGoogleLinked && !user.hasPassword ? (
          <p className="text-xs text-slate-600 leading-relaxed">
            Your account is authenticated via <strong>Google Sign-In</strong>. Your login credentials and multi-factor authentication are managed directly through your Google Account.
          </p>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            {passwordMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordMessage}</span>
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
            >
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* 3. Danger Zone: Destructive Account Deletion */}
      <div className="p-6 bg-red-50/50 rounded-2xl border border-red-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-red-100">
          <Trash2 className="w-4 h-4 text-red-600" />
          <h2 className="font-bold text-sm text-red-950">Danger Zone — Delete Account</h2>
        </div>

        <p className="text-xs text-red-900 leading-relaxed">
          Permanently delete your user account and all associated event plans, budgets, quotes, vendor records, and task trees. This action is irreversible.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
        >
          Delete Account Permanently
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Irreversible Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure? This will permanently erase your profile and cascade delete all events and budgets owned by your account.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              To proceed, please type <strong>DELETE</strong> in all caps below:
            </div>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={e => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs"
              >
                {isDeleting ? 'Deleting Everything...' : 'Confirm Account Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
