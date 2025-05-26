import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Overview from '../components/Overview';
import TransactionList from '../components/TransactionList';
import AddTransaction from '../components/AddTransaction';
import EditTransaction from '../components/EditTransaction';

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow p-4 sm:p-6 lg:p-8 bg-gray-50">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/edit-transaction/:id" element={<EditTransaction />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;