import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  getAllBooks,
  addBook,
  deleteBook,
  borrowBook,
  returnBook,
  getBorrowedBooksForAdmin,
  getBorrowedBooksForUser,
  getReturnedBooksForUser,
  getAllUsersForAdmin,
  borrowBookByLibrarian 
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
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                <p className="text-sm text-gray-600">Author: {book.author}</p>
                <p className="text-sm text-gray-600">ISBN: {book.isbn}</p>
                {userRole === 'librarian' && <p className="text-sm text-gray-600">Stock: {book.quantity}</p>}
                <span className={`px-2 py-1 text-xs font-bold rounded-full mt-2 inline-block ${isAvailable ? 'bg-teal-200 text-teal-800' : 'bg-red-200 text-red-800'}`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                {userRole === 'librarian' ? (
                  <>
                    <button onClick={() => handleEdit(book)} className={borderButton}>Edit</button>
                    <button onClick={() => handleDelete(book._id)} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200">Delete</button>
                  </>
                ) : (
                  isAvailable ? (
                    <button onClick={() => handleBorrow(book._id)} className={borderButton}>Borrow</button>
                  ) : (
                    <button disabled className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg cursor-not-allowed">Unavailable</button>
                  )
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
const AddBookForm = memo(({ handleSubmit, formRef, buttonStyle, gradientButton }) => (
  <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
    <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Add New Book</h2>
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
        <button type="submit" className={`w-full ${buttonStyle} ${gradientButton}`}>Add Book</button>
      </div>
    </form>
  </div>
));

// New component for the librarian to assign a book
const BorrowForm = memo(({ users, books, handleLibrarianBorrow, buttonStyle, gradientButton }) => {
  const formRef = useRef(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
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
        {/* Corrected User Search Input with Recommendations */}
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

        {/* Book Search Input with Recommendations */}
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

        {/* Other form fields */}
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

// Define memoized components outside the main component
// Pass all dynamic data and handlers as props
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
  borderButton
}) => (
  <>
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <div className="flex justify-center mb-4 space-x-2">
        <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'add' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Add New Book</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'users' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>All Users</button>
        <button onClick={() => setActiveTab('total')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'total' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Total Books</button>
        <button onClick={() => setActiveTab('borrow')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrow' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Assign</button>
        <button onClick={() => setActiveTab('borrowed')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrowed' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Borrowed Books</button>
        <button onClick={() => setActiveTab('returned')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'returned' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Returned History</button>
      </div>
    </div>

    <div className="w-full max-w-4xl bg-white shadow-inner rounded-2xl p-8 space-y-8">
      {activeTab === 'add' && <AddBookForm handleSubmit={handleSubmit} formRef={formRef} buttonStyle={buttonStyle} gradientButton={gradientButton} />}
      {activeTab === 'total' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">All Books</h2>
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
                  const fine = daysOverdue * 1; // Assuming $1 per day fine
                  
                  return (
                    <li key={record._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{record.book?.title || 'Unknown Book'}</h3>
                        <p className="text-sm text-gray-600">User: {record.user?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Borrowed On: {new Date(record.borrowDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Due Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                      </div>
                      {/* NEW: Fine and Return button in the same row */}
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
      {activeTab === 'returned' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Returned History</h2>
          <div className="overflow-y-auto max-h-[50vh]">
            <ul className="divide-y divide-gray-200">
              {returnedBooks?.length === 0 ? <p className="text-center text-gray-500">No returned books found.</p> : returnedBooks?.map((book) => (
                <li key={book.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">Author: {book.author}</p>
                    <p className="text-sm text-gray-600">Returned on: {book.returnedDate}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">All Users</h2>
          <div className="overflow-y-auto max-h-[50vh]">
            <ul className="divide-y divide-gray-200">
              {allUsers?.length === 0 ? <p className="text-center text-gray-500">No users found for this institute.</p> : allUsers?.map((user) => (
                <li key={user._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name || user.instituteName}</h3>
                    <p className="text-sm text-gray-600">Email: {user.email || user.instituteEmail}</p>
                    <p className="text-sm text-gray-600">Role: {user.role}</p>
                    <p className="text-sm text-gray-600">Type: {user.userType}</p>
                  </div>
                </li>
              ))}
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
  borderButton
}) => (
  <>
    <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
      <div className="flex justify-center mb-4 space-x-2">
        <button onClick={() => setActiveTab('total')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'total' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>All Books</button>
        <button onClick={() => setActiveTab('borrowed')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrowed' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>My Borrowed Books</button>
        <button onClick={() => setActiveTab('returned')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'returned' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>My Returned History</button>
      </div>
    </div>
    <div className="w-full max-w-4xl bg-white shadow-inner rounded-2xl p-8 space-y-8">
      {activeTab === 'total' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">All Books</h2>
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
                  const fine = daysOverdue * 1; // Assuming $1 per day fine

                  return (
                    <li key={record._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{record.book?.title || 'Unknown Book'}</h3>
                        <p className="text-sm text-gray-600">Author: {record.book?.author || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Return Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                      </div>
                      {/* NEW: Fine and Return button in the same row */}
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
      {activeTab === 'returned' && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">My Returned History</h2>
          <div className="overflow-y-auto max-h-[50vh]">
            <ul className="divide-y divide-gray-200">
              {returnedBooks?.length === 0 ? <p className="text-center text-gray-500">You have not returned any books yet.</p> : returnedBooks?.map((book) => (
                <li key={book.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">Author: {book.author}</p>
                    <p className="text-sm text-gray-600">Returned on: {book.returnedDate}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  </>
));



const Library = ({ userRole }) => {
  const { loading } = useAuth();

  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const formRef = useRef(null);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('total');

  const buttonStyle = "py-2 rounded-lg shadow-md hover:opacity-90 font-semibold text-white";
  const gradientButton = "bg-gradient-to-r from-purple-600 to-teal-600";
  const borderButton = "px-4 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200";

  // Wrap displayMessage in useCallback to make its reference stable
  const displayMessage = useCallback((msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, 3000);
  }, []);

  // --- Memoized Fetch Functions ---
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
      const returnedBooksData = await getReturnedBooksForUser();
      setReturnedBooks(returnedBooksData);
    } catch (error) {
      console.error('Error fetching returned books:', error);
      displayMessage(error.message || 'Failed to fetch returned books.');
    }
  }, [displayMessage]);

  // NEW: Fetch all users for the librarian
  const fetchAllUsers = useCallback(async () => {
    try {
      const usersData = await getAllUsersForAdmin();
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error fetching all users:', error);
      displayMessage(error.message || 'Failed to fetch all users.');
    }
  }, [displayMessage]);


  // --- Fetch Data Effect (Optimized) ---
  useEffect(() => {
    if (loading) return;

    if (activeTab === 'add') {
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
        if (userRole === 'user' || userRole === 'librarian') {
          fetchReturnedBooks();
        }
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
  }, [userRole, activeTab, loading, fetchBooks, fetchBorrowedBooks, fetchReturnedBooks, fetchAllUsers]);


  // --- Handlers ---
  const handleSubmit = async (e) => {
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
      const newBook = await addBook(bookData);
      displayMessage('Book added successfully!');
      formRef.current.reset();
      // Update state directly instead of a full re-fetch
      setBooks(prev => [...prev, newBook]);
      // Switch back to 'total' books tab after adding
      setActiveTab('total');
    } catch (error) {
      console.error('Error adding book:', error);
      displayMessage(error.message || 'Failed to add book.');
    }
  };

  // New handler for librarian-initiated borrowing
  const handleLibrarianBorrow = async (userId, bookId, dueDate) => {
    try {
      await borrowBookByLibrarian(userId, bookId, dueDate);
      displayMessage('Book assigned successfully!');
      setActiveTab('borrowed');
    } catch (error) {
      console.error('Error assigning book:', error);
      displayMessage(error.message || 'Failed to assign book.');
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      await borrowBook(bookId);
      displayMessage('Book borrowed successfully!');
    } catch (error) {
      console.error('Error borrowing book:', error);
      displayMessage(error.message || 'Failed to borrow book.');
    }
    // Refresh relevant data
    fetchBooks();
    fetchBorrowedBooks();
  };

  const handleReturn = async (bookId) => {
    displayMessage('Confirmation required: Please confirm the return in the prompt modal.');

    const userConfirmed = true;

    if (userConfirmed) {
      try {
        await returnBook(bookId);
        displayMessage('Book return processed successfully!');
      } catch (error) {
        console.error('Error returning book:', error);
        displayMessage(error.message || 'Failed to process book return.');
      }
      // Refresh relevant data
      fetchBooks();
      fetchBorrowedBooks();
      fetchReturnedBooks();
    }
  };

  const handleEdit = (book) => {
    displayMessage("Edit functionality is currently being refactored for controlled inputs.");
  };

  const handleDelete = async (bookId) => {
    displayMessage('Confirmation required: Please confirm deletion in the prompt modal.');

    const userConfirmed = true;

    if (userConfirmed) {
      try {
        await deleteBook(bookId);
        displayMessage('Book deleted successfully!');
        // Update state directly instead of a full re-fetch
        setBooks(prev => prev.filter(book => book._id !== bookId));
      } catch (error) {
        console.error('Error deleting book:', error);
        displayMessage('Failed to delete book.');
      }
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen my-8"
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
          <>
            <LibrarianDashboard
              books={books}
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
            />
          </>
        ) : (
          <UserDashboard
            books={books}
            borrowedBooks={borrowedBooks}
            returnedBooks={returnedBooks}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleBorrow={handleBorrow}
            handleReturn={handleReturn}
            gradientButton={gradientButton}
            borderButton={borderButton}
          />
        )}
      </div>
    </div>
  );
};

export default Library;