import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyResults, getAllResultsForAdmin, publishResult, updateResult, deleteResult, getAdminUsers, getClassResultsForStudents, getInstituteDepartments } from '../api';
import { Lock } from 'lucide-react';

// Import our new modular components!
import { AdminDashboard } from '../components/Result/AdminDashboard';
import StudentCGPAList from '../components/Result/StudentCGPAList';

const Result = () => {
  const { authData, loading } = useAuth();
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isOfficial = authData?.userType === "Institute" || authData?.role === "admin" || authData?.role === "superadmin";
  const isVerified = authData?.isVerifiedByInstitute === true;

  const displayMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    // Hard block! If there is no user logged in, stop immediately.
    if (!authData) return; 

    try {
      if (isOfficial) {
        // 🟢 FIX 1: Fetch up to 5000 results instead of just page 1
        const resultsResponse = await getAllResultsForAdmin(1, 5000); 
        setResults(resultsResponse.results || resultsResponse);
        if (resultsResponse.pagination) setTotalPages(1);

        // 🟢 FIX 2: Fetch up to 5000 users so no student is left behind
        const usersResponse = await getAdminUsers(1, 5000);
        setUsers(usersResponse.users || usersResponse);

        try {
          const deptRes = await getInstituteDepartments();
          setDepartments(deptRes.departments || []);
        } catch (e) {
          console.error("Failed to load departments:", e);
        }
        
      } else {
        try {
          // 🟢 FIX 3: Fetch up to 5000 class results for the student rankings
          const data = await getClassResultsForStudents(1, 5000);
          setResults(data.results || data);
          setUsers(data.users || []);
          if (data.pagination) setTotalPages(1);
        } catch (e) {
          console.error("Failed to fetch class results:", e);
          const myResults = await getMyResults();
          setResults(myResults.results || myResults);
          setUsers([{ _id: authData?._id, ...authData }]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [isOfficial, authData]);

  useEffect(() => { 
    if (!authData) return;

    if (!loading && (isOfficial || isVerified)) {
        fetchData(currentPage); 
    }
  }, [loading, fetchData, currentPage, isOfficial, isVerified, authData]);

  const handleUpload = async (resultData, isUpdate, resultId) => {
    try {
      if (isUpdate) {
        await updateResult(resultId, resultData);
        displayMessage("Draft updated successfully!");
      } else {
        await publishResult(resultData);
        displayMessage("Draft saved successfully!");
      }
      fetchData(currentPage); 
    } catch (error) {
      console.error("Save Draft Error:", error);
      displayMessage("Failed to save draft.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this record?")) {
      try {
        await deleteResult(id);
        displayMessage("Record deleted.");
        fetchData(currentPage);
      } catch (error) {
        console.error("Delete Error:", error);
        displayMessage("Failed to delete.");
      }
    }
  };

  if (!loading && !isOfficial && !isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200 shadow-sm max-w-md text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-4 border-amber-100">
             <Lock className="w-10 h-10 text-amber-500" />
           </div>
           <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Account Pending</h1>
           <p className="text-slate-500 font-medium text-sm">
             Your account is currently waiting for verification from the Institute Administration. You will gain access to your Academic Results once approved.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center h-[calc(100dvh-60px)] sm:h-[calc(100vh-80px)] w-full max-w-[100vw] overflow-hidden -mt-4 sm:pt-4 pb-20 sm:pb-4">
      {message && <div className="fixed top-20 sm:top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg bg-slate-900 text-white font-bold text-sm animate-in slide-in-from-top-4 fade-in w-[90%] sm:w-auto text-center">{message}</div>}
      
      <div className="flex flex-col flex-1 w-[94%] sm:w-full max-w-6xl mx-auto h-full min-h-0 gap-3 sm:gap-4 relative">
        {isOfficial ? (
          <AdminDashboard 
            results={results} 
            users={users} 
            departments={departments} 
            handleUpload={handleUpload} 
            handleDelete={handleDelete} 
            fetchAdminData={() => fetchData(currentPage)} 
            displayMessage={displayMessage} 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <StudentCGPAList 
            results={results} 
            users={users} 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Result;