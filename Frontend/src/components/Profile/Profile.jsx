import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiEdit3,
  FiCamera,
  FiUser,
  FiMail,
  FiClock,
  FiStar,
  FiActivity,
} from "react-icons/fi";
import {
  updateProfilepic,
  updateBio,
  updateUsername,
} from "../../features/auth/authThunks";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, updatingDetails } = useSelector((state) => state.auth);

  const [bio, setBio] = useState(user?.bio || "");
  const [editingBio, setEditingBio] = useState(false);

  const [username, setUsername] = useState(user?.username || "");
  const [editingUsername, setEditingUsername] = useState(false);

  const [preview, setPreview] = useState(user?.profilePic);
  const [file, setFile] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProfilePicChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));

      const formData = new FormData();
      formData.append("profilePic", selectedFile);
      await dispatch(updateProfilepic(formData)).unwrap();
      setPreview(null);
      setFile(null);
    }
  };

  const handleBioSave = async () => {
    await dispatch(updateBio({ bio })).unwrap();
    setEditingBio(false);
  };

  const handleUsernameSave = async () => {
    await dispatch(updateUsername({ username })).unwrap();
    setEditingUsername(false);
  };

  const profilePicSrc =
    preview ||
    user?.profilePic ||
    "https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg";

  return (
    <div className="flex-1 m-5 rounded-lg text-white shadow-2xl flex flex-col h-full relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700">
      {/* Subtle animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400/5 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Header with subtle enhancements */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b rounded-t-lg backdrop-blur-sm bg-slate-800/80 border-slate-600">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-wide text-blue-100">
            My Profile
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center relative z-10">
        {/* Enhanced Profile Picture */}
        <div
          className={`relative mb-6 group transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="relative w-36 h-36">
            {/* Animated border */}
            <div className="absolute inset-0 rounded-full opacity-75 bg-gradient-to-r from-blue-400 to-purple-400"></div>
            <div className="absolute inset-1 rounded-full bg-slate-800"></div>

            <img
              src={profilePicSrc}
              alt="Profile"
              className="absolute inset-2 w-32 h-32 rounded-full object-cover transition-all duration-500 group-hover:scale-105"
            />

            {/* Loading Overlay */}
            {updatingDetails && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full backdrop-blur-sm">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Hover Overlay */}
            <label
              htmlFor="profilePicInput"
              className="absolute inset-0 bg-black/60 group-hover:flex hidden justify-center items-center rounded-full cursor-pointer transition-all duration-300"
              title="Change Picture"
            >
              <div className="p-3 rounded-full border bg-slate-800 border-slate-600">
                <FiCamera className="text-white text-xl" />
              </div>
            </label>

            <input
              type="file"
              id="profilePicInput"
              className="hidden"
              accept="image/*"
              onChange={handleProfilePicChange}
            />
          </div>
        </div>

        {/* Enhanced User Info */}
        <div
          className={`w-full max-w-md transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Username + Email + Status */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              {editingUsername ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-white border rounded-md px-2 py-1 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-slate-800 border-slate-600"
                  />
                  <button
                    onClick={handleUsernameSave}
                    className="text-xs px-3 py-1 rounded-md transition-all duration-200 hover:scale-105 hover:opacity-80 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingUsername(false);
                      setUsername(user?.username || "");
                    }}
                    className="text-xs px-3 py-1 rounded-md transition-all duration-200 hover:scale-105 hover:opacity-80 bg-slate-700 text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-blue-100">
                    {user?.username}
                  </h3>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <FiEdit3 className="text-white" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm text-slate-300">{user?.email}</p>
            <div
              className={`mt-2 inline-block px-2 py-1 text-xs rounded-full font-medium ${
                user?.status === "online"
                  ? "bg-green-700 text-green-200"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {user?.status}
            </div>
          </div>

          {/* Email Section */}
          <div className="border rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg hover:bg-slate-700/80 bg-slate-800/80 border-slate-600 hover:border-blue-400">
            <div className="flex items-center gap-3 mb-2">
              <FiMail className="text-green-400" />
              <span className="text-sm font-medium text-slate-300">Email</span>
            </div>
            <p className="text-blue-100">{user?.email}</p>
          </div>

          {/* Status Section */}
          <div className="border rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg hover:bg-slate-700/80 bg-slate-800/80 border-slate-600 hover:border-blue-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiActivity className="text-blue-400" />
                <span className="text-sm font-medium text-slate-300">
                  Status
                </span>
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  user?.status === "online"
                    ? "bg-green-700/30 text-green-300 border border-green-600/30"
                    : "bg-gray-600/30 text-gray-300 border border-gray-600/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    user?.status === "online" ? "bg-green-400" : "bg-gray-400"
                  } animate-pulse`}
                ></div>
                {user?.status}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="border rounded-lg p-4 mb-4 transition-all duration-300 hover:shadow-lg hover:bg-slate-700/80 bg-slate-800/80 border-slate-600 hover:border-blue-400">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FiStar className="text-yellow-400" />
                <span className="text-sm font-medium text-slate-300">Bio</span>
              </div>
              {!editingBio && (
                <button
                  onClick={() => setEditingBio(true)}
                  className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <FiEdit3 className="text-white text-sm" />
                </button>
              )}
            </div>

            {editingBio ? (
              <div className="space-y-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 text-sm rounded-md border text-white focus:outline-none focus:border-blue-400 transition-colors resize-none bg-slate-900 border-slate-600"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleBioSave}
                    className="px-4 py-2 text-sm rounded-md transition-all duration-200 hover:scale-105 hover:opacity-80 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingBio(false);
                      setBio(user?.bio || "");
                    }}
                    className="px-4 py-2 text-sm rounded-md transition-all duration-200 hover:scale-105 hover:opacity-80 bg-slate-700 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-blue-100">
                {bio || "Click the edit icon to add bio"}
              </div>
            )}
          </div>

          {/* Last Seen Section */}
          <div className="border rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:bg-slate-700/80 bg-slate-800/80 border-slate-600 hover:border-blue-400">
            <div className="flex items-center gap-3 mb-2">
              <FiClock className="text-blue-400" />
              <span className="text-sm font-medium text-slate-300">
                Last Seen
              </span>
            </div>
            <span className="text-blue-100">
              {user?.status === "online"
                ? "Currently online"
                : user?.lastSeen
                ? new Date(user.lastSeen).toLocaleString()
                : "Not available"}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="sticky bottom-0 z-10 px-6 py-3 border-t rounded-b-lg bg-slate-800/80 border-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">
            Edit your info and keep it up to date.
          </span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-200"></div>
            <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
