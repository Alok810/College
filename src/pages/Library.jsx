import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  getAllBooks,
  addBook,
  deleteBook,
  borrowBook,
  returnBook,
  getBorrowedBooksForAdmin,
  getBorrowedBooksForUser,
  getReturnedBooksForAdmin,
  getReturnedBooksForUser,
  getAllUsersForAdmin,
  borrowBookByLibrarian,
  updateBook,
  returnBookByAdmin,
} from '../api';
import { useAuth } from '../context/AuthContext';

// --- Utility function to check if a book is overdue ---
const isOverdue = (dueDate) => new Date() > new Date(dueDate);

// --- Memoized Child Components ---

// Component for displaying the list of books/users in the dashboard view
const BookList = memo(({ books, handleEdit, handleDelete, handleBorrow, borderButton, userRole }) => {
  const getAvailabilityStatus = (book) => book.quantity > 0;

  return (
    <ul className="divide-y divide-gray-200 overflow-y-scroll h-full">
      {books?.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No books found.</p>
      ) : (
        books?.map((book) => {
          const isAvailable = getAvailabilityStatus(book);
          return (
            <li key={book._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
              {/* Left-hand side: Book details without the availability badge */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                <p className="text-sm text-gray-600">Author: {book.author}</p>
                <p className="text-sm text-gray-600">ISBN: {book.isbn}</p>
                {userRole === 'librarian' && (
                  <p className={`text-sm ${book.quantity > 0 ? 'text-teal-800' : 'bg-red-200 text-red-800'} font-bold`}>
                    Stock: {book.quantity}
                  </p>
                )}
              </div>

              {/* Right-hand side: Buttons or availability status */}
              <div className="mt-4 md:mt-0 flex gap-2">
                {userRole === 'librarian' ? (
                  <>
                    <button onClick={() => handleEdit(book)} className={borderButton}>Edit</button>
                    <button onClick={() => handleDelete(book._id)} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200">Delete</button>
                  </>
                ) : (
                  // Display the availability status on the right side for users
                  <span className={`px-2 py-1 text-xs font-bold rounded-full mt-2 inline-block ${isAvailable ? 'bg-teal-200 text-teal-800' : 'bg-red-200 text-red-800'}`}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            </li>
          );
        })
      )}
    </ul>
  );
});

// Component for the Add New Book form
const AddBookForm = memo(({ handleSubmit, formRef, buttonStyle, gradientButton, borderButton, editBook, setEditBook }) => {
  const isEditing = !!editBook;

  // Use useEffect to populate the form fields when a book is selected for editing
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
      // Clear the form when not in editing mode
      formRef.current.reset();
    }
  }, [editBook, isEditing, formRef]);

  const formTitle = isEditing ? 'Edit Book' : 'Add New Book';
  const buttonText = isEditing ? 'Update Book' : 'Add Book';

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-700">{formTitle}</h2>
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="title" placeholder="Book Title" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" required />
          <input type="text" name="author" placeholder="Author Name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="isbn" placeholder="ISBN" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" required />
          <input type="number" name="price" placeholder="Price ($)" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="number" name="quantity" placeholder="Quantity in Stock" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" required />
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isAvailable" id="isAvailable" defaultChecked className="rounded-full text-purple-600 focus:ring-teal-500" />
            <label htmlFor="isAvailable" className="text-gray-700">Available</label>
          </div>
        </div>
        <textarea name="description" placeholder="Book Description" rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" required></textarea>
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="submit" className={`w-full ${buttonStyle} ${gradientButton}`}>{buttonText}</button>
          {isEditing && (
            <button
              type="button"
              onClick={() => setEditBook(null)}
              className={`w-full ${borderButton}`}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

// New component for the librarian to assign a book
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

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserSearchTerm(user.name || user.instituteName);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setBookSearchTerm(book.title);
  };

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
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Assign Book to User</h2>
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
        <div className="relative">
          <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700">Search User</label>
          <input
            type="text"
            id="userSearch"
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow"
            value={userSearchTerm}
            onChange={(e) => { setUserSearchTerm(e.target.value); setSelectedUser(null); }}
          />
          {userSearchTerm && filteredUsers.length > 0 && !selectedUser && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-inner mt-1 max-h-48 overflow-y-auto">
              {filteredUsers.map(user => (
                <li key={user._id} onClick={() => handleUserSelect(user)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  {user.name || user.instituteName} ({user.email || user.instituteEmail})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label htmlFor="bookSearch" className="block text-sm font-medium text-gray-700">Search Book</label>
          <input
            type="text"
            id="bookSearch"
            placeholder="Search by title..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow"
            value={bookSearchTerm}
            onChange={(e) => { setBookSearchTerm(e.target.value); setSelectedBook(null); }}
          />
          {bookSearchTerm && filteredBooks.length > 0 && !selectedBook && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-inner mt-1 max-h-48 overflow-y-auto">
              {filteredBooks.map(book => (
                <li key={book._id} onClick={() => handleBookSelect(book)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  {book.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Return Due Date</label>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow"
            required
          />
        </div>
        <button type="submit" className={`w-full ${buttonStyle} ${gradientButton}`}>Assign Book</button>
      </form>
    </div>
  );
});

// Reusable component for displaying the returned book history
const ReturnedBookList = memo(({ returnedBooks, userRole }) => (
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-700">{userRole === 'librarian' ? 'Returned History' : 'My Returned History'}</h2>
      <div className="overflow-y-auto max-h-[50vh]">
        <ul className="divide-y divide-gray-200">
          {returnedBooks?.length === 0 ? <p className="text-center text-gray-500">No returned books found.</p> : returnedBooks?.map((record) => {
            // FIX: Handle both a date object and a valid date string
            const formattedDate = record.returnedDate ? new Date(record.returnedDate).toLocaleDateString() : 'N/A';

            return (
              <li key={record.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                  <p className="text-sm text-gray-600">Author: {record.author}</p>
                </div>
                <div className="mt-2 md:mt-0 md:ml-4 text-right">
                  {userRole === 'librarian' && record.returnedBy && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">Returned by:</span> {record.returnedBy}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">Returned on:</span> {formattedDate}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
));

// Define memoized components outside the main component
const LibrarianDashboard = memo(({
  books,
  borrowedBooks,
  returnedBooks,
  allUsers,
  activeTab,
  setActiveTab,
  handleSubmit,
  handleEdit,
  handleDelete,
  handleReturn,
  handleLibrarianBorrow,
  formRef,
  buttonStyle,
  gradientButton,
  borderButton,
  editBook,
  setEditBook,
  searchTerm,
  setSearchTerm,
}) => (
  <>
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <div className="flex justify-center mb-4 flex-wrap gap-2">
        <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'add' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Add New Book</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'users' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>All Users</button>
        <button onClick={() => setActiveTab('total')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'total' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Total Books</button>
        <button onClick={() => setActiveTab('borrow')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrow' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Assign</button>
        <button onClick={() => setActiveTab('borrowed')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrowed' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Borrowed Books</button>
        <button onClick={() => setActiveTab('returned')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'returned' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Returned History</button>
      </div>
    </div>

    <div className="w-full max-w-4xl bg-white shadow-inner rounded-2xl p-8 space-y-8">
      {activeTab === 'add' && <AddBookForm handleSubmit={handleSubmit} formRef={formRef} buttonStyle={buttonStyle} gradientButton={gradientButton} borderButton={borderButton} editBook={editBook} setEditBook={setEditBook} />}
      {activeTab === 'total' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">All Books</h2>
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow"
            />
          </div>
          <div className="overflow-y-auto max-h-[50vh]">
            <BookList books={books} handleEdit={handleEdit} handleDelete={handleDelete} borderButton={borderButton} userRole="librarian" />
          </div>
        </div>
      )}
      {activeTab === 'borrow' && (
        <BorrowForm users={allUsers} books={books} handleLibrarianBorrow={handleLibrarianBorrow} buttonStyle={buttonStyle} gradientButton={gradientButton} />
      )}
      {activeTab === 'borrowed' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Borrowed Books</h2>
          <div className="overflow-y-auto max-h-[50vh]">
            <ul className="divide-y divide-gray-200">
              {borrowedBooks?.length === 0 ? <p className="text-center text-gray-500">No borrowed books.</p> : borrowedBooks?.map((record) => {
                const overdue = isOverdue(record.dueDate);
                const daysOverdue = overdue ? Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
                const fine = daysOverdue * 1;

                return (
                  <li key={record._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{record.book?.title || 'Unknown Book'}</h3>
                      <p className="text-sm text-gray-600">User: {record.user?.name || 'N/A'}</p>
                    </div>

                    <div className="mt-4 md:mt-0 md:flex-1 md:flex md:flex-col md:items-center">
                      <p className="text-sm text-gray-600">Borrowed On: {new Date(record.borrowDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Due Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                      {overdue && (
                        <span className="text-sm font-semibold text-red-600 mt-1">
                          Fine: ${fine.toFixed(2)} <span className="text-gray-500">(Overdue by {daysOverdue} days)</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                       <button onClick={() => handleReturn(record._id)} className={borderButton}>Return</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {activeTab === 'returned' && <ReturnedBookList returnedBooks={returnedBooks} userRole="librarian" />}
      {activeTab === 'users' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">All Users</h2>
          <div className="overflow-y-auto max-h-[50vh]">
            <ul className="divide-y divide-gray-200">
              {allUsers?.length === 0 ? (
                <p className="text-center text-gray-500">No users found.</p>
              ) : (
                allUsers?.map((user) => (
                  <li key={user._id} className="py-4">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name || user.instituteName}</h3>
                    <p className="text-sm text-gray-600">Email: {user.email || user.instituteEmail}</p>
                    <p className="text-sm text-gray-600">Role: {user.role}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  </>
));


const UserDashboard = memo(({
  books,
  borrowedBooks,
  returnedBooks,
  activeTab,
  setActiveTab,
  handleBorrow,
  handleReturn,
  gradientButton,
  borderButton,
  searchTerm,
  setSearchTerm,
}) => (
  <>
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <div className="flex justify-center mb-4 flex-wrap gap-2">
        <button onClick={() => setActiveTab('total')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'total' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>All Books</button>
        <button onClick={() => setActiveTab('borrowed')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrowed' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>My Borrowed Books</button>
        <button onClick={() => setActiveTab('returned')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'returned' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>My Returned History</button>
      </div>
    </div>
    <div className="w-full max-w-4xl bg-white shadow-inner rounded-2xl p-8 space-y-8">
      {activeTab === 'total' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">All Books</h2>
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow"
            />
          </div>
          <div className="overflow-y-auto max-h-[50vh]">
            <BookList books={books} handleBorrow={handleBorrow} borderButton={borderButton} userRole="user" />
          </div>
        </div>
      )}
      {activeTab === 'borrowed' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">My Borrowed Books</h2>
          <div className="overflow-y-auto max-h-[50vh]">
            <ul className="divide-y divide-gray-200">
              {borrowedBooks?.length === 0 ? <p className="text-center text-gray-500">You have no borrowed books.</p> : borrowedBooks?.map((record) => {
                const overdue = isOverdue(record.dueDate);
                const daysOverdue = overdue ? Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
                const fine = daysOverdue * 1;

                return (
                  <li key={record._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{record.book?.title || 'Unknown Book'}</h3>
                      <p className="text-sm text-gray-600">Author: {record.book?.author || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Return Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-4 items-center">
                      {overdue && (
                        <span className="text-sm font-semibold text-red-600">
                          Fine: ${fine.toFixed(2)} <span className="text-gray-500">(Overdue by {daysOverdue} days)</span>
                        </span>
                      )}
                      <button onClick={() => handleReturn(record.book._id)} className={borderButton}>Return</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {activeTab === 'returned' && <ReturnedBookList returnedBooks={returnedBooks} userRole="user" />}
    </div>
  </>
));


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

    if (activeTab === 'add' && !editBook) {
      return;
    }

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
        if (userRole === 'librarian') {
          fetchAllUsers();
        }
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

  // Handle both add and edit logic in one function
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
    <div className="flex flex-col items-center min-h-screen pt-4"
      style={{ background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)", backgroundAttachment: "fixed" }}>
      {showMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg bg-white">
          {message}
        </div>
      )}

      <div className="w-full max-w-4xl bg-white shadow-inner rounded-2xl p-8 space-y-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-600 pb-1">
            Library Management
          </h1>
          <span className="px-4 py-2 text-sm">
            Current User: <span className="font-semibold">{userRole === 'librarian' ? 'Librarian' : 'User'}</span>
          </span>
        </div>

        {userRole === 'librarian' ? (
          <LibrarianDashboard
            books={sortedBooks}
            borrowedBooks={borrowedBooks}
            returnedBooks={returnedBooks}
            allUsers={allUsers}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleSubmit={handleSubmit}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleReturn={handleReturn}
            handleLibrarianBorrow={handleLibrarianBorrow}
            formRef={formRef}
            buttonStyle={buttonStyle}
            gradientButton={gradientButton}
            borderButton={borderButton}
            editBook={editBook}
            setEditBook={setEditBook}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        ) : (
          <UserDashboard
            books={sortedBooks}
            borrowedBooks={borrowedBooks}
            returnedBooks={returnedBooks}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleBorrow={handleBorrow}
            handleReturn={handleReturn}
            gradientButton={gradientButton}
            borderButton={borderButton}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default Library;