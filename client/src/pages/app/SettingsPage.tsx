import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Trash2, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signout, refreshProfile } = useAuth();
  const { activeEvent, eventsList, deleteEvent } = useEvent();

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Event Deletion State
  const [showEventDeleteModal, setShowEventDeleteModal] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteActiveEvent = async () => {
    if (!activeEvent) return;
    setIsDeletingEvent(true);
    try {
      await deleteEvent(activeEvent.id);
      setShowEventDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete active event:', err);
    } finally {
      setIsDeletingEvent(false);
    }
  };

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
    <div className="space-y-8 max-w-4xl text-slate-100">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Account & Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your organizer profile, credentials, and event workspace ownership.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="p-6 metallic-card rounded-2xl border border-white/15 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <User className="w-4 h-4 text-white" />
          <h2 className="font-bold text-sm text-white">Profile Information</h2>
        </div>

        {profileMessage && (
          <div className="p-3 bg-zinc-900 border border-white/30 text-white rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{profileMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs metallic-input rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Email Address (Identity)</label>
            <input
              type="text"
              disabled
              value={user?.email || 'organizer@eventpilot.com'}
              className="mt-1 block w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/10 text-zinc-500 rounded-xl cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="metallic-btn-primary px-4 py-2 font-bold rounded-xl text-xs transition-all"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* 2. Security & Password Change */}
      <div className="p-6 metallic-card rounded-2xl border border-white/15 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Shield className="w-4 h-4 text-white" />
          <h2 className="font-bold text-sm text-white">Security & Credentials</h2>
        </div>

        {user?.isGoogleLinked && !user.hasPassword ? (
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your account is authenticated via <strong className="text-white">Google Sign-In</strong>. Your login credentials and multi-factor authentication are managed directly through your Google Account.
          </p>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            {passwordMessage && (
              <div className="p-3 bg-zinc-900 border border-white/30 text-white rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{passwordMessage}</span>
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-zinc-900 border border-white/40 text-white rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs metallic-input rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs metallic-input rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              className="metallic-btn-primary px-4 py-2 font-bold rounded-xl text-xs transition-all"
            >
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* 3. Active Event Management */}
      {activeEvent && (
        <div className="p-6 metallic-card rounded-2xl border border-white/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              <h2 className="font-bold text-sm text-white">Active Event Management</h2>
            </div>
            <button
              onClick={() => navigate('/app/events')}
              className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
            >
              All Events ({eventsList.length}) →
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-white">{activeEvent.meta.name}</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {activeEvent.meta.type?.toUpperCase()} • {activeEvent.meta.location} • {activeEvent.meta.date}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Budget: ₹{activeEvent.meta.totalBudget.toLocaleString('en-IN')} • {activeEvent.meta.guestCount} guests
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/app/events')}
                className="metallic-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                Switch / Edit
              </button>
              <button
                onClick={() => setShowEventDeleteModal(true)}
                className="metallic-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Danger Zone: Destructive Account Deletion */}
      <div className="p-6 metallic-card rounded-2xl border border-white/25 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Trash2 className="w-4 h-4 text-white" />
          <h2 className="font-bold text-sm text-white">Danger Zone — Delete Account</h2>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Permanently delete your user account and all associated event plans, budgets, quotes, vendor records, and task trees. This action is irreversible.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="metallic-btn-secondary border border-white/30 text-white font-bold hover:border-white/60 px-4 py-2 rounded-xl text-xs transition-all"
        >
          Delete Account Permanently
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="metallic-card border border-white/25 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Irreversible Deletion</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure? This will permanently erase your profile and cascade delete all events and budgets owned by your account.
            </p>

            <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300">
              To proceed, please type <strong className="text-white">DELETE</strong> in all caps below:
            </div>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={e => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                onClick={handleDeleteAccount}
                className="metallic-btn-primary px-4 py-2 text-xs font-bold rounded-xl disabled:opacity-40 transition-all"
              >
                {isDeleting ? 'Deleting Everything...' : 'Confirm Account Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Event Deletion Confirmation Modal */}
      {showEventDeleteModal && activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="metallic-card border border-white/25 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Delete "{activeEvent.meta.name}"?
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                This will permanently erase all budget items, timeline tasks, vendor quotes, and guest entries associated with this plan. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingEvent}
                onClick={() => setShowEventDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingEvent}
                onClick={handleDeleteActiveEvent}
                className="metallic-btn-primary px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isDeletingEvent ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
