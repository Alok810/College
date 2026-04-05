import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  getAllBooks, addBook, deleteBook, borrowBook, returnBook,
  getBorrowedBooksForAdmin, getBorrowedBooksForUser,
  getReturnedBooksForAdmin, getReturnedBooksForUser,
  getAllUsersForAdmin, borrowBookByLibrarian, updateBook, returnBookByAdmin,
} from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, Edit, Trash2, BookOpen, Clock, CheckCircle, UserPlus, Library as LibIcon } from 'lucide-react';

const isOverdue = (dueDate) => new Date() > new Date(dueDate);

// --- Memoized Child Components ---

const BookList = memo(({ books, handleEdit, handleDelete, handleBorrow, borderButton, userRole }) => {
  const getAvailabilityStatus = (book) => book.quantity > 0;

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4 overflow-y-auto h-full pb-4 custom-scrollbar pr-1">
      {books?.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100 flex-shrink-0">
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm sm:text-base">No books found.</p>
        </div>
      ) : (
        books?.map((book) => {
          const isAvailable = getAvailabilityStatus(book);
          return (
            <div key={book._id} className="p-3.5 sm:p-5 bg-white rounded-[1rem] sm:rounded-[1.25rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-shadow hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 w-full flex-shrink-0">
              
              <div className="flex-1 w-full overflow-hidden">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className="text-[15px] sm:text-lg font-extrabold text-gray-900 leading-tight truncate">{book.title}</h3>
                  {userRole !== 'librarian' && (
                    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-full flex-shrink-0 ${isAvailable ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-sm text-gray-600 mb-1 font-medium truncate">{book.author}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <p className="text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 truncate max-w-[140px] sm:max-w-none">ISBN: {book.isbn}</p>
                  {userRole === 'librarian' && (
                    <p className={`text-[10px] sm:text-xs px-2 py-1 rounded-md border font-bold ${book.quantity > 0 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      Stock: {book.quantity}
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-auto flex gap-2 sm:flex-shrink-0 mt-1 sm:mt-0">
                {userRole === 'librarian' ? (
                  <>
                    <button onClick={() => handleEdit(book)} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg sm:rounded-xl hover:bg-purple-100 font-bold text-xs sm:text-sm active:scale-95 transition-all`}>
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(book._id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg sm:rounded-xl hover:bg-red-100 font-bold text-xs sm:text-sm active:scale-95 transition-all">
                      <Trash2 size={14} /> <span className="sm:hidden">Delete</span>
                    </button>
                  </>
                ) : (
                  isAvailable && (
                    <button onClick={() => handleBorrow(book._id)} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all">
                      <BookOpen size={14} className="sm:w-4 sm:h-4" /> Borrow
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
});

const AddBookForm = memo(({ handleSubmit, formRef, buttonStyle, gradientButton, borderButton, editBook, setEditBook }) => {
  const isEditing = !!editBook;

  useEffect(() => {
    if (isEditing) {
      formRef.current.title.value = editBook.title;
      formRef.current.author.value = editBook.author;
      formRef.current.isbn.value = editBook.isbn;
      formRef.current.price.value = editBook.price;
      formRef.current.quantity.value = editBook.quantity;
      formRef.current.isAvailable.checked = editBook.isAvailable;
      formRef.current.description.value = editBook.description;
    } else {
      formRef.current.reset();
    }
  }, [editBook, isEditing, formRef]);

  const formTitle = isEditing ? 'Edit Book' : 'Add New Book';
  const buttonText = isEditing ? 'Update Book' : 'Add Book';

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:border sm:border-gray-100">
      <h2 className="flex-shrink-0 text-base sm:text-xl font-extrabold mb-3 sm:mb-6 text-center text-gray-900">{formTitle}</h2>
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-3 sm:space-y-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input type="text" name="title" placeholder="Book Title" className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none text-sm" required />
          <input type="text" name="author" placeholder="Author Name" className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none text-sm" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input type="text" name="isbn" placeholder="ISBN" className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none text-sm" required />
          <input type="number" name="price" placeholder="Price ($)" className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none text-sm" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input type="number" name="quantity" placeholder="Quantity in Stock" className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none text-sm" required />
          <div className="flex items-center gap-2 px-2">
            <input type="checkbox" name="isAvailable" id="isAvailable" defaultChecked className="w-4 h-4 rounded text-purple-600 focus:ring-teal-500 border-gray-300" />
            <label htmlFor="isAvailable" className="text-xs sm:text-sm text-gray-700 font-medium">Available for borrowing</label>
          </div>
        </div>
        <textarea name="description" placeholder="Book Description" rows="3" className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all outline-none resize-none text-sm" required></textarea>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
          <button type="submit" className={`w-full py-2.5 sm:py-3 rounded-xl shadow-md hover:opacity-90 font-bold text-sm text-white active:scale-[0.98] transition-all ${gradientButton}`}>{buttonText}</button>
          {isEditing && (
            <button type="button" onClick={() => setEditBook(null)} className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

const BorrowForm = memo(({ users, books, handleLibrarianBorrow, buttonStyle, gradientButton }) => {
  const formRef = useRef(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  const filteredBooks = books.filter(book =>
    book.quantity > 0 && book.title?.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = formRef.current;
    const dueDate = form.dueDate.value;

    if (selectedUser && selectedBook && dueDate) {
      handleLibrarianBorrow(selectedUser._id, selectedBook._id, dueDate);
      form.reset();
      setUserSearchTerm('');
      setBookSearchTerm('');
      setSelectedUser(null);
      setSelectedBook(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:border sm:border-gray-100">
      <h2 className="flex-shrink-0 text-base sm:text-xl font-extrabold mb-3 sm:mb-6 text-center text-gray-900 hidden sm:block">Assign Book</h2>
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-3 sm:space-y-4 pb-4">
        <div className="relative">
          <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">Search User</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Name or email..."
              className="w-full pl-9 pr-3 py-2 sm:pl-10 sm:pr-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none text-sm"
              value={userSearchTerm}
              onChange={(e) => { setUserSearchTerm(e.target.value); setSelectedUser(null); }}
            />
          </div>
          {userSearchTerm && filteredUsers.length > 0 && !selectedUser && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
              {filteredUsers.map(user => (
                <li key={user._id} onClick={() => { setSelectedUser(user); setUserSearchTerm(user.name || user.instituteName); }} className="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-50 hover:bg-purple-50 cursor-pointer">
                  <span className="font-bold text-gray-800 block text-xs sm:text-sm truncate">{user.name || user.instituteName}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 truncate block">{user.email || user.instituteEmail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">Search Book</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Book title..."
              className="w-full pl-9 pr-3 py-2 sm:pl-10 sm:pr-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none text-sm"
              value={bookSearchTerm}
              onChange={(e) => { setBookSearchTerm(e.target.value); setSelectedBook(null); }}
            />
          </div>
          {bookSearchTerm && filteredBooks.length > 0 && !selectedBook && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto custom-scrollbar">
              {filteredBooks.map(book => (
                <li key={book._id} onClick={() => { setSelectedBook(book); setBookSearchTerm(book.title); }} className="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-50 hover:bg-purple-50 cursor-pointer text-xs sm:text-sm font-medium text-gray-800 truncate">
                  {book.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none text-gray-700 text-sm"
            required
          />
        </div>
        <div className="pt-1">
          <button type="submit" className={`w-full py-2.5 sm:py-3 rounded-xl shadow-md hover:opacity-90 font-bold text-sm text-white active:scale-[0.98] transition-all ${gradientButton}`}>
            Assign Book
          </button>
        </div>
      </form>
    </div>
  );
});

const ReturnedBookList = memo(({ returnedBooks, userRole }) => (
    <div className="flex flex-col h-full w-full overflow-hidden min-h-0 sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:border sm:border-gray-100">
      <h2 className="flex-shrink-0 text-base sm:text-xl font-extrabold mb-3 sm:mb-6 text-center text-gray-900 hidden sm:block">
        {userRole === 'librarian' ? 'Returned History' : 'My Returned History'}
      </h2>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
        <div className="flex flex-col gap-2.5 sm:gap-3 pb-4">
          {returnedBooks?.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-100 flex-shrink-0">
              <CheckCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No returned books found.</p>
            </div>
          ) : (
            returnedBooks?.map((record) => {
              const formattedDate = record.returnedDate ? new Date(record.returnedDate).toLocaleDateString() : 'N/A';
              return (
                <div key={record.id} className="p-3.5 sm:p-4 bg-white rounded-[1rem] sm:rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 w-full flex-shrink-0">
                  <div className="flex-1 overflow-hidden w-full">
                    <h3 className="text-[15px] sm:text-base font-bold text-gray-900 leading-tight mb-0.5 truncate">{record.title}</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">{record.author}</p>
                  </div>
                  <div className="w-full sm:w-auto bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none sm:text-right flex-shrink-0">
                    {userRole === 'librarian' && record.returnedBy && (
                      <p className="text-[11px] sm:text-xs text-gray-600 mb-0.5 truncate max-w-[200px] sm:max-w-none">
                        <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] sm:text-[10px]">User:</span> <span className="font-medium text-gray-800">{record.returnedBy}</span>
                      </p>
                    )}
                    <p className="text-[11px] sm:text-xs text-gray-600">
                      <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] sm:text-[10px]">Returned:</span> <span className="font-medium text-gray-800">{formattedDate}</span>
                    </p>
                  </div>
                </div>
              );
          })
          )}
        </div>
      </div>
    </div>
));

const LibrarianDashboard = memo(({
  books, borrowedBooks, returnedBooks, allUsers, activeTab, setActiveTab,
  handleSubmit, handleEdit, handleDelete, handleReturn, handleLibrarianBorrow,
  formRef, buttonStyle, gradientButton, borderButton, editBook, setEditBook,
  searchTerm, setSearchTerm,
}) => {
  
  const renderTabs = () => {
    const tabs = [
      { id: 'total', label: 'All Books' },
      { id: 'add', label: 'Add Book' },
      { id: 'borrow', label: 'Assign Book' },
      { id: 'borrowed', label: 'Borrowed' },
      { id: 'returned', label: 'History' },
      { id: 'users', label: 'Users' }
    ];

    return (
      <div className="flex-shrink-0 w-full sm:w-max sm:mx-auto overflow-hidden sm:bg-white sm:p-1 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        {/* ✅ Reduced tab gap */}
        <div className="flex overflow-x-auto custom-scrollbar snap-x snap-mandatory gap-1.5 sm:gap-1 pb-1 sm:pb-0 sm:justify-center">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`snap-start whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-[0.8rem] sm:rounded-[0.6rem] font-bold text-xs sm:text-sm transition-all duration-200 flex-shrink-0 ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'bg-white sm:bg-transparent border border-gray-100 sm:border-none text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    // ✅ Reduced gap between sections
    <div className="flex-1 flex flex-col w-full min-h-0 gap-2 sm:gap-3">
      {renderTabs()}

      <div className="flex-1 bg-white shadow-sm sm:shadow-inner rounded-[1.25rem] sm:rounded-[1.5rem] p-2.5 sm:p-6 border border-gray-100 sm:border-none flex flex-col min-h-0 overflow-hidden w-full">
        {activeTab === 'add' && <AddBookForm handleSubmit={handleSubmit} formRef={formRef} buttonStyle={buttonStyle} gradientButton={gradientButton} borderButton={borderButton} editBook={editBook} setEditBook={setEditBook} />}
        
        {activeTab === 'total' && (
          <div className="flex flex-col h-full w-full min-h-0 overflow-hidden sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:shadow-inner">
            <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-6 w-full">
              <h2 className="text-base sm:text-xl font-extrabold text-gray-900 hidden sm:block">Library Catalog</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-[0.8rem] focus:ring-2 focus:ring-purple-300 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 w-full overflow-hidden">
              <BookList books={books} handleEdit={handleEdit} handleDelete={handleDelete} borderButton={borderButton} userRole="librarian" />
            </div>
          </div>
        )}

        {activeTab === 'borrow' && (
          <BorrowForm users={allUsers} books={books} handleLibrarianBorrow={handleLibrarianBorrow} buttonStyle={buttonStyle} gradientButton={gradientButton} />
        )}

        {activeTab === 'borrowed' && (
          <div className="flex flex-col h-full w-full min-h-0 overflow-hidden sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:shadow-inner">
            <h2 className="flex-shrink-0 text-base sm:text-xl font-extrabold mb-3 sm:mb-6 text-center text-gray-900 hidden sm:block">Active Borrowings</h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 w-full min-h-0">
              <div className="flex flex-col gap-2.5 sm:gap-3 pb-4">
                {borrowedBooks?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-100 flex-shrink-0">
                     <Clock className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                     <p className="text-sm">No active borrowings.</p>
                  </div>
                ) : borrowedBooks?.map((record) => {
                  const overdue = isOverdue(record.dueDate);
                  const daysOverdue = overdue ? Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
                  const fine = daysOverdue * 1;

                  return (
                    // ✅ INCREASED vertical padding (p-5 sm:p-6)
                    <div key={record._id} className={`p-5 sm:p-6 bg-white rounded-[1rem] sm:rounded-xl shadow-sm border ${overdue ? 'border-red-200 shadow-red-100' : 'border-gray-100'} flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 w-full flex-shrink-0`}>
                      <div className="flex-1 w-full overflow-hidden">
                        <h3 className="text-[15px] sm:text-lg font-extrabold text-gray-900 leading-tight mb-1.5 truncate">{record.book?.title || 'Unknown Book'}</h3>
                        <p className="text-[11px] sm:text-sm text-gray-500 font-medium mb-2 truncate">User: <span className="text-purple-600 font-bold">{record.user?.name || 'N/A'}</span></p>
                        
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100 space-y-1.5 sm:space-y-2 mt-2">
                          <p className="text-[10px] sm:text-xs text-gray-500 flex justify-between"><span className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">Borrowed:</span> {new Date(record.borrowDate).toLocaleDateString()}</p>
                          <p className={`text-[10px] sm:text-xs flex justify-between ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}><span className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-gray-500">Due:</span> {new Date(record.dueDate).toLocaleDateString()}</p>
                        </div>

                        {overdue && (
                          <div className="mt-3 inline-block bg-red-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border border-red-100">
                            <span className="text-[11px] sm:text-xs font-bold text-red-600">
                              Fine: ${fine.toFixed(2)} <span className="text-red-400 font-medium">({daysOverdue} days)</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full sm:w-auto flex-shrink-0 mt-3 sm:mt-0">
                         <button onClick={() => handleReturn(record._id)} className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-purple-50 text-purple-700 font-bold rounded-lg sm:rounded-xl hover:bg-purple-100 active:scale-95 transition-all text-xs sm:text-sm border border-purple-200">
                           Mark Returned
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returned' && <ReturnedBookList returnedBooks={returnedBooks} userRole="librarian" />}
        
        {activeTab === 'users' && (
          <div className="flex flex-col h-full w-full min-h-0 overflow-hidden sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:shadow-inner">
            <h2 className="flex-shrink-0 text-base sm:text-xl font-extrabold mb-3 sm:mb-6 text-center text-gray-900 hidden sm:block">Registered Users</h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
              <div className="flex flex-col gap-2.5 sm:gap-3 w-full pb-4">
                {allUsers?.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 flex-shrink-0 text-sm">No users found.</p>
                ) : (
                  allUsers?.map((user) => (
                    <div key={user._id} className="p-3 sm:p-4 bg-white rounded-[1rem] sm:rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 w-full overflow-hidden flex-shrink-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-200">
                        <UserPlus size={16} className="text-purple-600 sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <div className="overflow-hidden w-full">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-tight">{user.name || user.instituteName}</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email || user.instituteEmail}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200">{user.role}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const UserDashboard = memo(({
  books, borrowedBooks, returnedBooks, activeTab, setActiveTab,
  handleBorrow, handleReturn, gradientButton, borderButton,
  searchTerm, setSearchTerm,
}) => {
  
  const renderTabs = () => {
    const tabs = [
      { id: 'total', label: 'Library Catalog' },
      { id: 'borrowed', label: 'My Borrowed' },
      { id: 'returned', label: 'Return History' }
    ];

    return (
      <div className="flex-shrink-0 w-full sm:w-max sm:mx-auto overflow-hidden sm:bg-white sm:p-1 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        {/* ✅ Reduced tab gap */}
        <div className="flex overflow-x-auto custom-scrollbar snap-x snap-mandatory gap-1.5 sm:gap-1 pb-1 sm:pb-0 px-1 sm:px-0 sm:justify-center">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`snap-start whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-[0.8rem] sm:rounded-[0.6rem] font-bold text-xs sm:text-sm transition-all duration-200 flex-shrink-0 ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'bg-white sm:bg-transparent border border-gray-100 sm:border-none text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    // ✅ Reduced gap between sections
    <div className="flex-1 flex flex-col w-full min-h-0 gap-2 sm:gap-3">
      {renderTabs()}
      <div className="flex-1 w-full bg-white shadow-sm sm:shadow-inner rounded-[1.25rem] sm:rounded-[1.5rem] p-2.5 sm:p-6 border border-gray-100 sm:border-none flex flex-col min-h-0 overflow-hidden">
        
        {activeTab === 'total' && (
          <div className="flex flex-col h-full w-full min-h-0 overflow-hidden sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:shadow-inner">
            <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-6 w-full">
              <h2 className="text-base sm:text-xl font-extrabold text-gray-900 hidden sm:block">Explore Books</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-[0.8rem] focus:ring-2 focus:ring-purple-300 outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 w-full overflow-hidden">
              <BookList books={books} handleBorrow={handleBorrow} borderButton={borderButton} userRole="user" />
            </div>
          </div>
        )}

        {activeTab === 'borrowed' && (
          <div className="flex flex-col h-full w-full min-h-0 overflow-hidden sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:shadow-inner">
            <h2 className="flex-shrink-0 text-base sm:text-xl font-extrabold mb-3 sm:mb-6 text-center text-gray-900 hidden sm:block">Books I'm Reading</h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 w-full min-h-0">
              <div className="flex flex-col gap-2.5 sm:gap-3 pb-4">
                {borrowedBooks?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-100 flex-shrink-0">
                     <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                     <p className="text-sm">You haven't borrowed any books yet.</p>
                  </div>
                ) : borrowedBooks?.map((record) => {
                  const overdue = isOverdue(record.dueDate);
                  const daysOverdue = overdue ? Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
                  const fine = daysOverdue * 1;

                  return (
                    // ✅ INCREASED vertical padding (p-5 sm:p-6)
                    <div key={record._id} className={`p-5 sm:p-6 bg-white rounded-[1rem] sm:rounded-xl shadow-sm border ${overdue ? 'border-red-200 shadow-red-100' : 'border-gray-100'} flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 w-full flex-shrink-0`}>
                      <div className="flex-1 w-full overflow-hidden">
                        <h3 className="text-[15px] sm:text-lg font-extrabold text-gray-900 leading-tight mb-1.5 truncate">{record.book?.title || 'Unknown Book'}</h3>
                        <p className="text-[11px] sm:text-sm text-gray-500 font-medium mb-2 truncate">{record.book?.author || 'N/A'}</p>
                        
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100 flex justify-between items-center mt-2">
                          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${overdue ? 'text-red-600' : 'text-gray-500'}`}>Due Date</span>
                          <span className={`text-[11px] sm:text-sm font-extrabold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>{new Date(record.dueDate).toLocaleDateString()}</span>
                        </div>

                        {overdue && (
                          <div className="mt-3 inline-block bg-red-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border border-red-100">
                            <span className="text-[11px] sm:text-xs font-bold text-red-600">
                              Fine: ${fine.toFixed(2)} <span className="text-red-400 font-medium">({daysOverdue} days)</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full sm:w-auto flex-shrink-0 mt-3 sm:mt-0">
                         <button onClick={() => handleReturn(record.book._id)} className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-purple-50 text-purple-700 font-bold rounded-lg sm:rounded-xl hover:bg-purple-100 active:scale-95 transition-all text-xs sm:text-sm border border-purple-200">
                           Return Book
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returned' && <ReturnedBookList returnedBooks={returnedBooks} userRole="user" />}
      </div>
    </div>
  );
});

const Library = ({ userRole }) => {
  const { loading } = useAuth();

  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [editBook, setEditBook] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const formRef = useRef(null);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('total');

  const buttonStyle = "py-2 rounded-lg shadow-md hover:opacity-90 font-semibold text-white";
  const gradientButton = "bg-gradient-to-r from-purple-600 to-teal-600";
  const borderButton = "px-4 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200";

  const displayMessage = useCallback((msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, 3000);
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      const allBooksData = await getAllBooks();
      setBooks(allBooksData);
    } catch (error) {
      console.error('Error fetching books:', error);
      displayMessage('Failed to fetch books.');
    }
  }, [displayMessage]);

  const fetchBorrowedBooks = useCallback(async () => {
    try {
      if (userRole === 'librarian') {
        const borrowedBooksData = await getBorrowedBooksForAdmin();
        setBorrowedBooks(borrowedBooksData);
      } else {
        const borrowedBooksData = await getBorrowedBooksForUser();
        setBorrowedBooks(borrowedBooksData);
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      displayMessage(error.message || 'Failed to fetch borrowed books.');
    }
  }, [userRole, displayMessage]);

  const fetchReturnedBooks = useCallback(async () => {
    try {
      if (userRole === 'librarian') {
        const returnedBooksData = await getReturnedBooksForAdmin();
        setReturnedBooks(returnedBooksData);
      } else {
        const returnedBooksData = await getReturnedBooksForUser();
        setReturnedBooks(returnedBooksData);
      }
    } catch (error) {
      console.error('Error fetching returned books:', error);
      displayMessage(error.message || 'Failed to fetch returned books.');
    }
  }, [userRole, displayMessage]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const usersData = await getAllUsersForAdmin();
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error fetching all users:', error);
      displayMessage(error.message || 'Failed to fetch all users.');
    }
  }, [displayMessage]);

  useEffect(() => {
    if (loading) return;
    if (activeTab === 'add' && !editBook) return;

    switch (activeTab) {
      case 'total':
        fetchBooks();
        break;
      case 'borrowed':
        fetchBorrowedBooks();
        break;
      case 'returned':
        fetchReturnedBooks();
        break;
      case 'users':
        if (userRole === 'librarian') fetchAllUsers();
        break;
      case 'borrow':
        if (userRole === 'librarian') {
          fetchAllUsers();
          fetchBooks();
        }
        break;
      default:
        fetchBooks();
    }
  }, [userRole, activeTab, loading, fetchBooks, fetchBorrowedBooks, fetchReturnedBooks, fetchAllUsers, editBook]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const bookData = {
      title: form.title.value,
      author: form.author.value,
      isbn: form.isbn.value,
      isAvailable: parseInt(form.quantity.value) > 0,
      description: form.description.value,
      price: parseFloat(form.price.value),
      quantity: parseInt(form.quantity.value)
    };

    try {
      if (editBook) {
        const updatedBook = await updateBook(editBook._id, bookData);
        displayMessage('Book updated successfully!');
        setBooks(prev => prev.map(book => book._id === updatedBook._id ? updatedBook : book));
        setEditBook(null);
      } else {
        const newBook = await addBook(bookData);
        displayMessage('Book added successfully!');
        setBooks(prev => [...prev, newBook]);
      }
      formRef.current.reset();
      setActiveTab('total');
    } catch (error) {
      console.error(`Error ${editBook ? 'updating' : 'adding'} book:`, error);
      displayMessage(error.message || `Failed to ${editBook ? 'update' : 'add'} book.`);
    }
  }, [displayMessage, formRef, editBook, setActiveTab, setEditBook]);

  const handleEdit = useCallback((book) => {
    setEditBook(book);
    setActiveTab('add');
  }, [setEditBook, setActiveTab]);

  const handleLibrarianBorrow = useCallback(async (userId, bookId, dueDate) => {
    try {
      await borrowBookByLibrarian(userId, bookId, dueDate);
      displayMessage('Book assigned successfully!');
      setActiveTab('borrowed');
    } catch (error) {
      console.error('Error assigning book:', error);
      displayMessage(error.message || 'Failed to assign book.');
    }
  }, [displayMessage, setActiveTab]);

  const handleBorrow = useCallback(async (bookId) => {
    try {
      await borrowBook(bookId);
      displayMessage('Book borrowed successfully!');
      setBooks(prev => prev.map(b => b._id === bookId ? { ...b, quantity: b.quantity - 1 } : b));
    } catch (error) {
      console.error('Error borrowing book:', error);
      displayMessage(error.message || 'Failed to borrow book.');
    }
  }, [displayMessage, setBooks]);

  const handleReturn = useCallback(async (recordId) => {
    const userConfirmed = window.confirm("Are you sure you want to return this book?");
    if (userConfirmed) {
      try {
        if (userRole === 'librarian') {
          await returnBookByAdmin(recordId);
        } else {
          await returnBook(recordId);
        }
        displayMessage('Book return processed successfully!');
      } catch (error) {
        console.error('Error returning book:', error);
        displayMessage(error.message || 'Failed to process book return.');
      }
      fetchBooks();
      fetchBorrowedBooks();
      fetchReturnedBooks();
    }
  }, [userRole, displayMessage, fetchBooks, fetchBorrowedBooks, fetchReturnedBooks]);

  const handleDelete = useCallback(async (bookId) => {
    const userConfirmed = window.confirm("Are you sure you want to delete this book?");
    if (userConfirmed) {
      try {
        await deleteBook(bookId);
        displayMessage('Book deleted successfully!');
        setBooks(prev => prev.filter(book => book._id !== bookId));
      } catch (error) {
        console.error('Error deleting book:', error);
        displayMessage('Failed to delete book.');
      }
    }
  }, [displayMessage, setBooks]);

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const titleA = a.title?.toLowerCase() || '';
    const titleB = b.title?.toLowerCase() || '';
    return titleA.localeCompare(titleB);
  });

  return (
    // ✅ SHIFTED UP: Reduced top padding (pt-1 sm:pt-2) to push content closer to the Institute Header
    <div className="flex flex-col items-center h-full w-full max-w-[100vw] overflow-x-hidden pb-20 sm:pb-2 pt-1 sm:pt-2">
      
      {showMessage && (
        <div className="fixed top-20 sm:top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-gray-900 text-white font-bold text-sm animate-in slide-in-from-top-4 fade-in">
          {message}
        </div>
      )}

      {/* ✅ REDUCED GAP: Gap between Header, Tabs, and Content reduced from gap-6 to gap-3 */}
      <div className="flex flex-col w-[94%] sm:w-full max-w-4xl mx-auto h-full min-h-0 gap-2 sm:gap-3">
        
        <div className="flex-shrink-0 flex items-center justify-between bg-white p-3 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] shadow-sm border border-gray-100 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] sm:rounded-2xl bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center border border-purple-200 flex-shrink-0">
              <LibIcon className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none truncate">
                Library
              </h1>
              <p className="text-[10px] sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1 truncate">Campus resources</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-gray-100">
             <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Access</span>
             <p className="font-extrabold text-purple-600 text-xs sm:text-sm">{userRole === 'librarian' ? 'Librarian' : 'Student'}</p>
          </div>
        </div>

        {userRole === 'librarian' ? (
          <LibrarianDashboard
            books={sortedBooks} borrowedBooks={borrowedBooks} returnedBooks={returnedBooks}
            allUsers={allUsers} activeTab={activeTab} setActiveTab={setActiveTab}
            handleSubmit={handleSubmit} handleEdit={handleEdit} handleDelete={handleDelete}
            handleReturn={handleReturn} handleLibrarianBorrow={handleLibrarianBorrow}
            formRef={formRef} buttonStyle={buttonStyle} gradientButton={gradientButton}
            borderButton={borderButton} editBook={editBook} setEditBook={setEditBook}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          />
        ) : (
          <UserDashboard
            books={sortedBooks} borrowedBooks={borrowedBooks} returnedBooks={returnedBooks}
            activeTab={activeTab} setActiveTab={setActiveTab} handleBorrow={handleBorrow}
            handleReturn={handleReturn} gradientButton={gradientButton} borderButton={borderButton}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default Library;