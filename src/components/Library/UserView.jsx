import React, { memo } from 'react';
import { BookOpen } from 'lucide-react';
import { LibraryHeader, BookList, ReturnedBookList } from './LibraryShared.jsx';
import { isOverdue } from './libraryUtils.js'; 

export const UserDashboard = memo(({
  books, borrowedBooks, returnedBooks, activeTab, handleTabChange,
  handleBorrow, handleReturn, borderButton,
  searchTerm, setSearchTerm, activeCategory, setActiveCategory,
  wishlist, toggleWishlist, onOpenReview,
  pendingRequests 
}) => {
  
  const renderTabs = () => {
    const tabs = [
      { id: 'total', label: 'Library Catalog' },
      { id: 'wishlist', label: 'My Wishlist' },
      { id: 'borrowed', label: 'My Borrowed' },
      { id: 'returned', label: 'Return History' }
    ];

    return (
      <div className="flex-shrink-0 w-fit mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 z-10">
        <div className="flex gap-1 justify-start sm:justify-center overflow-x-auto custom-scrollbar snap-x snap-mandatory pb-1 sm:pb-0">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id)} 
              className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
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
            userRole="user" 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            showSearch={activeTab === 'total'} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
          
          {activeTab === 'total' && (
            <BookList books={books} handleBorrow={handleBorrow} borderButton={borderButton} userRole="user" wishlist={wishlist} toggleWishlist={toggleWishlist} onOpenReview={onOpenReview} borrowedBooks={borrowedBooks} pendingRequests={pendingRequests} />
          )}

          {activeTab === 'wishlist' && (
            <div className="w-full flex flex-col gap-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest hidden sm:block">Saved for Later</h2>
              <BookList books={books.filter(b => wishlist.includes(b._id))} handleBorrow={handleBorrow} userRole="user" wishlist={wishlist} toggleWishlist={toggleWishlist} onOpenReview={onOpenReview} borrowedBooks={borrowedBooks} pendingRequests={pendingRequests} />
            </div>
          )}

          {activeTab === 'borrowed' && (
            <div className="grid grid-cols-1 gap-3 pb-4 w-full">
              {borrowedBooks?.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">You haven't borrowed any books yet.</p>
                </div>
              ) : borrowedBooks?.map((record) => {
                const overdue = isOverdue(record.dueDate);
                const daysOverdue = overdue ? Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
                const fine = daysOverdue * 1;

                return (
                  <div key={record._id} className={`p-4 sm:p-5 bg-white rounded-xl shadow-sm border ${overdue ? 'border-rose-300 shadow-rose-50' : 'border-slate-200'} grid grid-cols-1 sm:grid-cols-3 gap-4 items-center w-full h-full`}>
                    
                    <div className="flex flex-col overflow-hidden">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-1 truncate">{record.book?.title || 'Unknown Book'}</h3>
                      <p className="text-xs text-slate-500 font-bold truncate">{record.book?.author || 'N/A'}</p>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-center w-full">
                      <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 flex items-center justify-between sm:justify-center gap-4 w-full sm:w-auto min-w-[160px]">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Due Date</span>
                        <span className={`text-xs sm:text-sm font-black ${overdue ? 'text-rose-600' : 'text-slate-800'}`}>{new Date(record.dueDate).toLocaleDateString()}</span>
                      </div>
                      
                      {overdue && (
                        <div className="mt-2 text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
                          Fine: ${fine.toFixed(2)} <span className="text-rose-400 font-bold">({daysOverdue} days)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end w-full justify-center">
                       <button onClick={() => handleReturn(record.book._id)} className="w-full sm:w-auto px-6 py-2.5 bg-emerald-50 text-emerald-700 font-black rounded-xl hover:bg-emerald-100 active:scale-95 transition-all text-sm shadow-sm border border-emerald-200">
                         Return Book
                       </button>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'returned' && <ReturnedBookList returnedBooks={returnedBooks} userRole="user" />}
        </div>
      </div>
    </div>
  );
});