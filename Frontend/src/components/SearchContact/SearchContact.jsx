import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../features/user/userthunks";
import { createChat,getChat } from "../../features/chat/chatThunks";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

const SearchContact = () => {
  const [searchInput, setSearchInput] = useState("");
  const [contacts, setContacts] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [filteredContacts, setfilteredContacts] = useState([]);

  useEffect(() => {
    const getContact = async () => {
      try {
        const result = await dispatch(fetchAllUsers()).unwrap();
        console.log(result);
        setContacts(result);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch contacts");
      }
    };

    getContact();
  }, [dispatch]);

  useEffect(() => {
    if (!searchInput.trim()) {
      setfilteredContacts(contacts);
      return;
    }

    const lowerInput = searchInput.toLowerCase();
    const filtered = contacts.filter(
      (c) =>
        c.username.toLowerCase().includes(lowerInput) ||
        c.email.toLowerCase().includes(lowerInput)
    );
    setfilteredContacts(filtered);
  }, [searchInput, contacts]);

  const handleCreateChat = async (id) => {
    try {
      const payload = {
        isGroup: false,
        members: [user._id, id],
      };

      const result = await dispatch(createChat(payload)).unwrap();
      console.log("Chat created:", result);
      await dispatch(getChat(result._id)).unwrap();
      toast.success("Chat created successfully");
      navigate("/chats");
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create chat");
    }
  };

  return (
    <div className="ml-20 w-82 flex flex-col p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full shadow-2xl rounded-lg overflow-hidden border border-slate-700">
      <h2 className="text-2xl font-bold mb-4 px-2 text-blue-100">Contacts</h2>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search Contacts..."
          className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 placeholder-slate-400"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
        <ul className="flex flex-col space-y-3">
          {loading ? (
            <li className="text-slate-400">Loading contacts...</li>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <li
                key={contact._id}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 transition-all duration-200 rounded-xl cursor-pointer shadow-sm border border-slate-600 hover:border-slate-500"
                onClick={() => {
                  handleCreateChat(contact._id);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 mr-3">
                    <img
                      src={`https://i.pinimg.com/736x/ad/39/25/ad392542df831f9fea026691d1ecec67.jpg`}
                      alt={`${contact.username}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-blue-100">
                      {contact.username}
                    </div>
                    <div className="text-sm text-slate-300">{contact.email}</div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="text-slate-400">No contacts found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SearchContact;