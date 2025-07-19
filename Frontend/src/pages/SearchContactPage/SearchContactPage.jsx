import React from "react";
import TwoPanelLayout from "../../Layouts/TwoPanelLayout";
import SearchContact from "../../components/SearchContact/SearchContact";
import Chatbox from "../../components/Chatbox/Chatbox";

const SearchContactPage = () => {
  return <TwoPanelLayout left={<SearchContact />} right={<Chatbox />} />;
};

export default SearchContactPage;