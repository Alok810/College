import React, { useState, useEffect, useRef, memo } from 'react';
import { Clock, DollarSign, UserPlus, Search, BookOpen, Download, ClipboardList } from 'lucide-react';
import { getFineLedger, exportFineLedger } from '../../api';
import { LibraryHeader, BookList, ReturnedBookList } from './LibraryShared.jsx';
import { isOverdue, CATEGORIES } from './libraryUtils.js';

const AnalyticsOverview = memo(({ books, borrowedBooks }) => {
  const [ledger, setLedger] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const data = await getFineLedger();
        setLedger(data.fines);
        setTotalRevenue(data.totalRevenue);
      } catch (error) {
        console.error("Failed to fetch ledger", error);
      }
    };
    fetchLedger();
  }, []);

  const handleExport = async () => {
    try {
      const blob = await exportFineLedger();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Rigya_Fine_Ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Export error:", error); 
      alert("Failed to download ledger.");
    }
  };

  const totalBooks = books.length;
  const totalStock = books.reduce((sum, book) => sum + book.quantity, 0);
  const activeBorrows = borrowedBooks.length;
  
  let totalPendingFines = 0;
  
  borrowedBooks.forEach(record => {
    if (isOverdue(record.dueDate)) {
      const daysOverdue = Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24));
      totalPendingFines += (daysOverdue * 1);
    }
  });

  return (
    <div className="w-full flex flex-col gap-6 pb-4">
      <div>
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 hidden sm:block">Library Snapshot</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider relative z-10">Total Titles</span>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 leading-none">{totalBooks}</span>
              <span className="text-xs font-bold text-slate-500 mb-1">({totalStock} copies)</span>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider relative z-10">Active Borrows</span>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 leading-none">{activeBorrows}</span>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider relative z-10">Pending Fines</span>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-3xl sm:text-4xl font-black text-amber-500 leading-none">${totalPendingFines.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 sm:p-5 rounded-2xl border border-emerald-600 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
            <span className="text-[10px] sm:text-xs font-black text-emerald-100 uppercase tracking-wider relative z-10">Total Revenue</span>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-3xl sm:text-4xl font-black text-white leading-none">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Fine Collections</h2>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
            <Download size={14} /> Export CSV
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Student</th><th className="px-6 py-4">Book Title</th><th className="px-6 py-4">Days Overdue</th><th className="px-6 py-4 text-right">Amount Paid</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {!ledger || ledger.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-bold">No fines collected yet.</td></tr>
                ) : (
                  ledger.map((entry, index) => (
                    <tr key={entry?._id || `fine-${index}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">{entry?.paidAt ? new Date(entry.paidAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{entry?.user?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-xs truncate max-w-[200px]">{entry?.book?.title || 'Unknown'}</td>
                      <td className="px-6 py-4 text-rose-500 font-bold">{entry?.daysOverdue || 0} days</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600">${entry?.amount?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

// 🟢 UPDATED: Stripped out the bulk import UI (now in the header)
const AddBookForm = memo(({ handleSubmit, formRef, gradientButton, editBook, setEditBook }) => {
  const isEditing = !!editBook;

  useEffect(() => {
    if (isEditing) {
      formRef.current.title.value = editBook.title;
      formRef.current.author.value = editBook.author;
      formRef.current.isbn.value = editBook.isbn;
      formRef.current.price.value = editBook.price;
      formRef.current.quantity.value = editBook.quantity;
      formRef.current.category.value = editBook.category || 'Other';
      formRef.current.isAvailable.checked = editBook.isAvailable;
      formRef.current.description.value = editBook.description;
    } else {
      formRef.current.reset();
    }
  }, [editBook, isEditing, formRef]);

  return (
    <div className="w-full flex flex-col gap-6">
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-4 pb-0">
        
        {isEditing && (
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            Edit Book Record
          </h3>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Book Title</label>
            <input type="text" name="title" placeholder="Enter title" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-800" required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Author Name</label>
            <input type="text" name="author" placeholder="Enter author" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-800" required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">ISBN Number</label>
            <input type="text" name="isbn" placeholder="e.g. 978-3-16..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-800" required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
            <select name="category" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-800">
              {CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Price ($)</label>
            <input type="number" name="price" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-800" required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Upload Cover Image</label>
            <input type="file" name="coverImage" accept="image/*" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700" />
            {isEditing && editBook?.coverImageUrl && <p className="text-[10px] text-emerald-600 mt-1 font-bold">✓ Has existing cover image</p>}
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Upload E-Book/PDF</label>
            <input type="file" name="eBookFile" accept="application/pdf" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700" />
            {isEditing && editBook?.eBookUrl && <p className="text-[10px] text-emerald-600 mt-1 font-bold">✓ Has existing E-Book attached</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Stock Quantity</label>
            <input type="number" name="quantity" placeholder="Number of copies" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-800" required />
          </div>
          <div className="flex flex-col justify-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50 h-full">
              <input type="checkbox" name="isAvailable" id="isAvailable" defaultChecked className="w-4 h-4 rounded text-purple-600 focus:ring-teal-500" />
              <label htmlFor="isAvailable" className="text-xs sm:text-sm text-slate-700 font-bold">Available</label>
            </div>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
          <textarea name="description" placeholder="Brief summary..." rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none resize-none text-sm font-medium text-slate-700" required></textarea>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" className={`w-full py-3.5 rounded-xl shadow-md hover:shadow-lg font-black text-sm text-white transition-all ${gradientButton}`}>{isEditing ? 'Update Book Record' : 'Save Book to Catalog'}</button>
          {isEditing && <button type="button" onClick={() => setEditBook(null)} className="w-full sm:w-1/3 py-3.5 bg-slate-100 text-slate-600 font-black text-sm rounded-xl hover:bg-slate-200 transition-all">Cancel Edit</button>}
        </div>
      </form>
    </div>
  );
});

const BorrowForm = memo(({ users, books, handleLibrarianBorrow, gradientButton }) => {
  const formRef = useRef(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()));
  const filteredBooks = books.filter(b => b.quantity > 0 && b.title?.toLowerCase().includes(bookSearchTerm.toLowerCase()));

  const handleSubmit = (e) => {
    e.preventDefault();
    const dueDate = formRef.current.dueDate.value;
    if (selectedUser && selectedBook && dueDate) {
      handleLibrarianBorrow(selectedUser._id, selectedBook._id, dueDate);
      formRef.current.reset(); setUserSearchTerm(''); setBookSearchTerm(''); setSelectedUser(null); setSelectedBook(null);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-4 pb-0">
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">1. Select User</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search Name..." className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" value={userSearchTerm} onChange={(e) => { setUserSearchTerm(e.target.value); setSelectedUser(null); }} />
          </div>
          {userSearchTerm && filteredUsers.length > 0 && !selectedUser && (
            <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
              {filteredUsers.map(user => <li key={user._id} onClick={() => { setSelectedUser(user); setUserSearchTerm(user.name || user.instituteName); }} className="px-4 py-3 border-b hover:bg-purple-50 cursor-pointer"><span className="font-bold text-slate-800 block text-sm">{user.name || user.instituteName}</span></li>)}
            </ul>
          )}
        </div>
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">2. Select Book</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search catalog..." className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800" value={bookSearchTerm} onChange={(e) => { setBookSearchTerm(e.target.value); setSelectedBook(null); }} />
          </div>
          {bookSearchTerm && filteredBooks.length > 0 && !selectedBook && (
            <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
              {filteredBooks.map(book => <li key={book._id} onClick={() => { setSelectedBook(book); setBookSearchTerm(book.title); }} className="px-4 py-3 border-b hover:bg-purple-50 cursor-pointer text-sm font-bold">{book.title}</li>)}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">3. Return Due Date</label>
          <input type="date" name="dueDate" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" required />
        </div>
        <div className="pt-2">
          <button type="submit" className={`w-full py-3.5 rounded-xl shadow-md hover:shadow-lg font-black text-sm text-white transition-all ${gradientButton}`}>Assign Book</button>
        </div>
      </form>
    </div>
  );
});

const PendingRequestCard = memo(({ request, onApprove, onReject }) => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 14);
  const [dueDate, setDueDate] = useState(defaultDate.toISOString().split('T')[0]);

  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl shadow-sm border border-amber-200 bg-amber-50/30 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center w-full">
      <div className="flex flex-col overflow-hidden">
        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">{request.book?.title || 'Unknown Book'}</h3>
        <p className="text-xs text-slate-500 font-bold mt-1.5 truncate">User: <span className="text-purple-600">{request.user?.name || 'N/A'}</span></p>
      </div>
      
      <div className="flex flex-col items-start sm:items-center w-full">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Set Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-purple-400 shadow-sm"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-start sm:justify-end gap-2 w-full">
        <button 
          onClick={() => onApprove(request._id, dueDate)} 
          disabled={!dueDate} 
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-xl hover:shadow-md active:scale-95 transition-all text-xs shadow-sm disabled:opacity-50"
        >
          Approve
        </button>
        <button 
          onClick={() => onReject(request._id)} 
          className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 text-rose-600 font-black rounded-xl hover:bg-rose-100 active:scale-95 transition-all text-xs shadow-sm border border-rose-200"
        >
          Reject
        </button>
      </div>
    </div>
  );
});

export const LibrarianDashboard = memo(({
  books, borrowedBooks, returnedBooks, allUsers, activeTab, handleTabChange,
  handleSubmit, handleEdit, handleDelete, handleReturn, handleLibrarianBorrow,
  formRef, buttonStyle, gradientButton, borderButton, editBook, setEditBook,
  searchTerm, setSearchTerm, activeCategory, setActiveCategory, handleBulkImport,
  pendingRequests, handleApproveRequest, handleRejectRequest
}) => {
  
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'total', label: 'All Books' },
      { id: 'add', label: 'Add Book' },
      { id: 'borrow', label: 'Assign Book' },
      { id: 'requests', label: 'Requests' }, 
      { id: 'borrowed', label: 'Borrowed' },
      { id: 'returned', label: 'History' },
      { id: 'users', label: 'Users' }
    ];

    return (
      <div className="flex-shrink-0 w-fit mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 z-10">
        <div className="flex gap-1 justify-start sm:justify-center overflow-x-auto custom-scrollbar snap-x snap-mandatory pb-1 sm:pb-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              {tab.label === 'Requests' && pendingRequests?.length > 0 && (
                <span className="mr-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-md text-[10px]">{pendingRequests.length}</span>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col flex-1 min-h-0 gap-4">
      {renderTabs()}
      <div className="bg-white shadow-sm rounded-[1.5rem] border border-slate-100 w-full flex flex-col flex-1 min-h-0 mb-4 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white z-10 flex-shrink-0">
          <LibraryHeader 
            userRole="librarian" 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            showSearch={activeTab === 'total'} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
            activeTab={activeTab} // 🟢 Passes state up
            handleBulkImport={handleBulkImport} // 🟢 Passes function up
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
          {activeTab === 'overview' && <AnalyticsOverview books={books} borrowedBooks={borrowedBooks} />}
          {activeTab === 'add' && <AddBookForm handleSubmit={handleSubmit} formRef={formRef} buttonStyle={buttonStyle} gradientButton={gradientButton} borderButton={borderButton} editBook={editBook} setEditBook={setEditBook} />}
          {activeTab === 'total' && (
            <BookList books={books} handleEdit={handleEdit} handleDelete={handleDelete} borderButton={borderButton} userRole="librarian" />
          )}
          {activeTab === 'borrow' && <BorrowForm users={allUsers} books={books} handleLibrarianBorrow={handleLibrarianBorrow} buttonStyle={buttonStyle} gradientButton={gradientButton} />}
          
          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 gap-3 pb-4 w-full">
              {pendingRequests?.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No pending book requests.</p>
                </div>
              ) : pendingRequests?.map((request) => (
                <PendingRequestCard 
                  key={request._id} 
                  request={request} 
                  onApprove={handleApproveRequest} 
                  onReject={handleRejectRequest} 
                />
              ))}
            </div>
          )}

          {activeTab === 'borrowed' && (
            <div className="grid grid-cols-1 gap-3 pb-4 w-full">
              {borrowedBooks?.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No active borrowings.</p>
                </div>
              ) : borrowedBooks?.map((record) => {
                const overdue = isOverdue(record.dueDate);
                const daysOverdue = overdue ? Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
                const fine = daysOverdue * 1;

                return (
                  <div key={record._id} className={`p-4 sm:p-5 bg-white rounded-xl shadow-sm border ${overdue ? 'border-rose-300 shadow-rose-50' : 'border-slate-200'} grid grid-cols-1 sm:grid-cols-3 gap-4 items-center w-full h-full`}>
                    <div className="flex flex-col overflow-hidden">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">{record.book?.title || 'Unknown Book'}</h3>
                      <p className="text-xs text-slate-500 font-bold mt-1.5 truncate">User: <span className="text-purple-600">{record.user?.name || 'N/A'}</span></p>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:mx-auto">
                      <div className="flex items-center gap-4"><span className="text-xs font-bold text-slate-500 w-16">Borrowed:</span><span className="text-xs font-medium text-slate-800">{new Date(record.borrowDate).toLocaleDateString()}</span></div>
                      <div className="flex items-center gap-4"><span className="text-xs font-bold text-slate-500 w-16">Due:</span><span className={`text-xs font-medium ${overdue ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>{new Date(record.dueDate).toLocaleDateString()}</span></div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full">
                      <button onClick={() => handleReturn(record._id, overdue ? fine : 0)} className={`w-full sm:w-auto px-5 py-2.5 font-black rounded-xl active:scale-95 transition-all text-xs shadow-sm border flex items-center justify-center gap-1.5 ${overdue ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                        {overdue ? <><DollarSign size={14}/> Collect Fine & Return</> : 'Mark Returned'}
                      </button>
                      {overdue && <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">Pending Fine: ${fine.toFixed(2)} <span className="text-rose-400 font-bold">({daysOverdue} days)</span></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'returned' && <ReturnedBookList returnedBooks={returnedBooks} userRole="librarian" />}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 gap-3 w-full pb-4">
              {allUsers?.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p className="text-sm font-medium">No users found.</p></div>
              ) : (
                allUsers?.map((user) => (
                  <div key={user._id} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 w-full h-full hover:border-purple-300 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-200"><UserPlus size={16} className="text-purple-600" /></div>
                    <div className="overflow-hidden w-full">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate leading-tight">{user.name || user.instituteName}</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold truncate">{user.email || user.instituteEmail}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-slate-200">{user.role}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});