import React from "react";
import Profile from "../../components/Profile/Profile";
import TwoPanelLayout from "../../Layouts/TwoPanelLayout";
import profile from "../../assets/profile.jpg";

const LeftPanelContent = () => (
  <div className="ml-20 w-82 flex flex-col justify-center items-center p-4 text-white h-full shadow-2xl rounded-lg overflow-hidden bg-[#152034] border border-slate-700">
    <h2 className="text-3xl font-bold mb-4 text-blue-100">Your Account</h2>
    <div className="relative w-[300px] h-60 overflow-hidden rounded-lg mb-4">
      <div className="absolute top-0 left-0 flex w-[1800px] animate-scroll-x">
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src={profile}
            alt="profile"
            className="w-[300px] h-56 object-fill"
          />
        ))}
      </div>
    </div>

    <p className="text-sm text-center leading-relaxed text-slate-300">
      Personalize your space. Click your bio or photo to edit.
    </p>

    {/* Tip */}
    <p className="text-xs mt-2 text-center text-slate-400">
      Keep your info fresh—help friends recognize you.
    </p>
    
  </div>
);

const ProfilePage = () => {
  return <TwoPanelLayout left={<LeftPanelContent />} right={<Profile />} />;
};

export default ProfilePage;
