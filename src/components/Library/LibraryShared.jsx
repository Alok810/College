import React, { useState, memo, useRef } from 'react';
import { Search, BookOpen, CheckCircle, Library as LibIcon, Heart, Star, X, Clock, ChevronDown, Upload } from 'lucide-react';
import { CATEGORIES } from './libraryUtils.js';
import { useAuth } from '../../context/AuthContext'; 

export const LibraryHeader = ({ userRole, searchTerm, setSearchTerm, showSearch, activeCategory, setActiveCategory, activeTab, handleBulkImport }) => {
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && handleBulkImport) {
      handleBulkImport(file);
      e.target.value = null; 
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center border border-purple-200 flex-shrink-0">
          <LibIcon className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate">Campus Library</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">Resource Management</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-end">
        {showSearch && (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            
            <div className="relative w-full sm:w-40 flex-shrink-0">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-700 cursor-pointer transition-colors hover:bg-slate-100"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search title, author, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-400 outline-none text-sm font-bold text-slate-700"
              />
            </div>
          </div>
        )}

        {/* 🟢 NEW: Segmented Control for Add Book Tab */}
        {userRole === 'librarian' && activeTab === 'add' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
            <div className="px-4 py-2 bg-white shadow-sm rounded-lg border border-slate-200 text-xs font-bold text-slate-800 whitespace-nowrap">
              Single Book (Manual)
            </div>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={onFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 bg-transparent text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 hover:text-slate-800 transition-all whitespace-nowrap"
            >
              <Upload size={14} /> Whole Catalog (CSV)
            </button>
          </div>
        )}

        <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hidden sm:block flex-shrink-0">
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access</span>
          <p className="font-extrabold text-purple-600 text-xs sm:text-sm">{userRole === 'librarian' ? 'Librarian' : 'Student'}</p>
        </div>
      </div>
    </div>
  );
};

export const ReviewModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 leading-tight text-lg">Rate this Book</h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5 truncate max-w-[250px]">{bookTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200">
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(rating, comment); setComment(""); }} className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button type="button" key={num} onClick={() => setRating(num)} className="p-1 hover:scale-110 transition-transform">
                  <Star size={32} className={`${num <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-50'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this book? Did it help with your coursework?"
              rows="3"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-400 outline-none resize-none text-sm font-medium text-slate-700"
            ></textarea>
          </div>

          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-black rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-sm">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export const BookList = memo(({ books, handleEdit, handleDelete, handleBorrow, userRole, wishlist = [], toggleWishlist, onOpenReview, borrowedBooks = [], pendingRequests = [] }) => {
  const getAvailabilityStatus = (book) => book.quantity > 0;
  const { authData } = useAuth();

  return (
    <div className="grid grid-cols-1 gap-3 w-full pb-4">
      {books?.length === 0 ? (
        <div className="col-span-full text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-sm sm:text-base font-medium">No books found in this category.</p>
        </div>
      ) : (
        books?.map((book, index) => {
          const isAvailable = getAvailabilityStatus(book);
          
          const hasReviewed = book.reviews?.some(review => 
            review.user === authData?._id || review.user?._id === authData?._id
          );

          const isAlreadyBorrowed = borrowedBooks.some(record => 
            record.book?._id === book._id || record.book === book._id
          );

          const isPending = pendingRequests.some(record => 
            record.book?._id === book._id || record.book === book._id
          );

          return (
            <div key={book?._id || `catalog-book-${index}`} className="p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:border-purple-300 hover:shadow-md grid grid-cols-1 sm:grid-cols-[1fr_140px_230px] md:grid-cols-[1fr_150px_240px] lg:grid-cols-[1fr_170px_270px] gap-3 items-center w-full">
              
              <div className="flex items-center gap-3 overflow-hidden w-full">
                <div className="w-10 h-14 sm:w-12 sm:h-16 bg-slate-100 rounded-md border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <LibIcon className="text-slate-300 w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col overflow-hidden w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col overflow-hidden pr-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">{book.title}</h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5 truncate">{book.author}</p>
                    </div>
                    
                    {userRole !== 'librarian' && toggleWishlist && (
                      <button 
                        onClick={() => toggleWishlist(book._id)}
                        className="p-1 -mr-1 hover:bg-rose-50 rounded-full transition-colors group flex-shrink-0"
                      >
                        <Heart 
                          size={16} 
                          className={`transition-colors ${wishlist.includes(book._id) ? 'fill-rose-500 text-rose-500' : 'text-slate-300 group-hover:text-rose-400'}`} 
                        />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{book.category || 'Uncategorized'}</span>
                    
                    {book.averageRating > 0 && (
                      <div className="flex items-center gap-1 bg-amber-50 px-1 py-0.5 rounded-md border border-amber-100">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-600">{book.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800">ISBN: {book.isbn}</span>
                  
                  {userRole === 'librarian' && (
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800">Stock: {book.quantity}</span>
                  )}
                  
                  {userRole !== 'librarian' && (
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border w-fit ${isAvailable ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      {isAvailable && (
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                          Stock: <span className="text-slate-800">{book.quantity}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-start sm:justify-end gap-2 w-full">
                
                {userRole !== 'librarian' && onOpenReview && (
                  hasReviewed ? (
                    <button disabled className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-black text-[11px] sm:text-xs shadow-sm opacity-80 cursor-not-allowed">
                      <CheckCircle size={12} className="text-emerald-500" /> Reviewed
                    </button>
                  ) : (
                    <button onClick={() => onOpenReview(book)} className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-black text-[11px] sm:text-xs shadow-sm hover:bg-amber-100 transition-all active:scale-95">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> Rate
                    </button>
                  )
                )}

                {book.eBookUrl && userRole !== 'librarian' && (
                  <a href={book.eBookUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-black text-[11px] sm:text-xs shadow-md hover:bg-slate-800 transition-all">
                    Read E-Book
                  </a>
                )}

                {userRole === 'librarian' ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={() => handleEdit(book)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 font-bold text-[11px] sm:text-xs transition-colors">
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button onClick={() => handleDelete(book._id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 font-bold text-[11px] sm:text-xs transition-colors">
                       <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                ) : (
                  isAlreadyBorrowed ? (
                    <button disabled className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 sm:py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg font-black text-[11px] sm:text-xs shadow-sm opacity-80 cursor-not-allowed">
                      <CheckCircle size={14} /> Borrowed
                    </button>
                  ) : isPending ? (
                    <button disabled className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 sm:py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-black text-[11px] sm:text-xs shadow-sm opacity-90 cursor-not-allowed">
                      <Clock size={14} /> Requested
                    </button>
                  ) : isAvailable ? (
                    <button onClick={() => handleBorrow(book._id)} className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 sm:py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-lg font-black text-[11px] sm:text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all">
                      <BookOpen size={14} /> Borrow
                    </button>
                  ) : null
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
});

export const ReturnedBookList = memo(({ returnedBooks, userRole }) => (
  <div className="w-full grid grid-cols-1 gap-3 sm:gap-4 pb-4">
    {returnedBooks?.length === 0 ? (
      <div className="col-span-full text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <CheckCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-sm font-medium">No returned books found.</p>
      </div>
    ) : (
      returnedBooks?.map((record, index) => {
        const formattedDate = record.returnedDate ? new Date(record.returnedDate).toLocaleDateString() : 'N/A';
        return (
          <div key={record?.id || record?._id || `history-${index}`} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full h-full">
            <div className="flex-1 overflow-hidden w-full">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight mb-0.5 truncate">{record.title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold truncate">{record.author}</p>
            </div>
            <div className="w-full sm:w-auto bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none sm:text-right flex-shrink-0 border border-slate-100 sm:border-none mt-2 sm:mt-0">
              {userRole === 'librarian' && record.returnedBy && (
                <p className="text-[11px] sm:text-xs text-slate-600 mb-1 truncate max-w-[250px] sm:max-w-none">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">User:</span> <span className="font-bold text-slate-800">{record.returnedBy}</span>
                </p>
              )}
              <p className="text-[11px] sm:text-xs text-slate-600">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Returned:</span> <span className="font-black text-emerald-600">{formattedDate}</span>
              </p>
            </div>
          </div>
        );
      })
    )}
  </div>
));