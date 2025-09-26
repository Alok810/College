import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  getAllBooks, 
  addBook, 
  updateBook, 
  deleteBook, 
  borrowBook, 
  returnBook, 
  getBorrowedBooksForAdmin, 
  getBorrowedBooksForUser, 
  getReturnedBooksForUser 
} from '../api';
import { useAuth } from '../context/AuthContext'; 

const Library = ({ userRole }) => {
  const { loading } = useAuth();
  
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  
  // UNCONTROLLED COMPONENT FIX: Use refs to get form values on submit
  const formRef = useRef(null);

  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('total');

  const displayMessage = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, 3000);
  };
  
  const fetchBooks = async () => {
    try {
      const allBooksData = await getAllBooks();
      setBooks(allBooksData);
    } catch (error) {
      console.error('Error fetching books:', error);
      displayMessage('Failed to fetch books.');
    }
  };

  const fetchBorrowedBooks = async () => {
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
  };
  
  const fetchReturnedBooks = async () => {
    try {
      const returnedBooksData = await getReturnedBooksForUser();
      setReturnedBooks(returnedBooksData);
    } catch (error) {
      console.error('Error fetching returned books:', error);
      displayMessage('Failed to fetch returned books.');
    }
  };

  useEffect(() => {
    if (!loading) { 
      fetchBooks();
      fetchBorrowedBooks();
      fetchReturnedBooks();
    }
  }, [userRole, activeTab, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // UNCONTROLLED COMPONENT FIX: Read values directly from form
    const form = formRef.current;
    const bookData = { 
        title: form.title.value, 
        author: form.author.value, 
        isbn: form.isbn.value, 
        isAvailable: form.isAvailable.checked, 
        description: form.description.value, 
        price: parseFloat(form.price.value), 
        quantity: parseInt(form.quantity.value) 
    };

    try {
      await addBook(bookData);
      displayMessage('Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
      displayMessage(error.message); 
    }
    
    // Clear the form after submission
    formRef.current.reset();
    fetchBooks();
  };
  
  const handleBorrow = async (bookId) => {
    try {
      await borrowBook(bookId);
      displayMessage('Book borrowed successfully!');
    } catch (error) {
      console.error('Error borrowing book:', error);
      displayMessage(error.message);
    }
    fetchBooks();
    fetchBorrowedBooks();
  };

  const handleReturn = async (bookId) => {
    const isConfirmed = window.confirm('Are you sure you want to return this book?');
    if (isConfirmed) {
      try {
        await returnBook(bookId);
        displayMessage('Book returned successfully!');
      } catch (error) {
        console.error('Error returning book:', error);
        displayMessage(error.message);
      }
      fetchBooks();
      fetchBorrowedBooks();
      fetchReturnedBooks();
    }
  };

  // NOTE: Edit functionality will require a modal and controlled inputs.
  // The current uncontrolled fix only addresses the add form.
  const handleEdit = (book) => {
    displayMessage("Edit functionality is currently being refactored for this form.");
  };

  const handleDelete = async (bookId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this book?');
    if (isConfirmed) {
      try {
        await deleteBook(bookId);
        displayMessage('Book deleted successfully!');
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        displayMessage('Failed to delete book.');
      }
    }
  };

  const buttonStyle = "py-2 rounded-lg shadow-md hover:opacity-90 font-semibold text-white";
  const gradientButton = "bg-gradient-to-r from-purple-600 to-teal-600";
  const borderButton = "px-4 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200";

  const LibrarianDashboard = memo(() => (
    <>
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Add New Book</h2>
        {/* UNCONTROLLED COMPONENT FIX: Assign ref to form */}
        <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs are now uncontrolled, read on submit */}
            <input 
              type="text" 
              name="title"
              placeholder="Book Title" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" 
              required 
            />
            <input 
              type="text" 
              name="author"
              placeholder="Author Name" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300 transition-shadow" 
              required 
            />
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
      
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
        <div className="flex justify-center mb-4 space-x-2">
          <button onClick={() => setActiveTab('total')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'total' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Total Books</button>
          <button onClick={() => setActiveTab('borrowed')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrowed' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Borrowed Books</button>
          <button onClick={() => setActiveTab('returned')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'returned' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>Returned Books</button>
        </div>

        <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
          {activeTab === 'total' ? 'All Books' : activeTab === 'borrowed' ? 'Borrowed Books' : 'Returned Books'}
        </h2>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {activeTab === 'total' && (
            <ul className="divide-y divide-gray-200">
              {books?.length === 0 ? <p className="text-center text-gray-500">No books found.</p> : books?.map((book) => (
                <li key={book._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">Author: {book.author}</p>
                    <p className="text-sm text-gray-600">ISBN: {book.isbn}</p>
                    <p className="text-sm text-gray-600">Stock: {book.quantity}</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full mt-2 inline-block ${book.isAvailable ? 'bg-teal-200 text-teal-800' : 'bg-red-200 text-red-800'}`}>
                      {book.availibility ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <button onClick={() => handleEdit(book)} className={borderButton}>Edit</button>
                    <button onClick={() => handleDelete(book._id)} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'borrowed' && (
            <ul className="divide-y divide-gray-200">
              {borrowedBooks?.length === 0 ? <p className="text-center text-gray-500">No borrowed books.</p> : borrowedBooks?.map((record) => (
                <li key={record._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{record.book?.title || 'Unknown Book'}</h3>
                    <p className="text-sm text-gray-600">User: {record.user?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Borrowed On: {new Date(record.borrowDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Due Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <button onClick={() => handleReturn(record.book._id)} className={borderButton}>Return</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'returned' && (
            <ul className="divide-y divide-gray-200">
              {returnedBooks?.length === 0 ? <p className="text-center text-gray-500">No returned books.</p> : returnedBooks?.map((book) => (
                <li key={book.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">Author: {book.author}</p>
                    <p className="text-sm text-gray-600">Returned on: {book.returnedDate}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  ));

  const UserDashboard = memo(() => (
    <>
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
        <div className="flex justify-center mb-4 space-x-2">
          <button onClick={() => setActiveTab('total')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'total' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>All Books</button>
          <button onClick={() => setActiveTab('borrowed')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'borrowed' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>My Borrowed Books</button>
          <button onClick={() => setActiveTab('returned')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'returned' ? gradientButton : 'bg-gray-300 text-gray-700'}`}>My Returned Books</button>
        </div>

        <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
          {activeTab === 'total' ? 'All Books' : activeTab === 'borrowed' ? 'My Borrowed Books' : 'My Returned Books'}
        </h2>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {activeTab === 'total' && (
            <ul className="divide-y divide-gray-200">
              {books?.length === 0 ? <p className="text-center text-gray-500">No books found.</p> : books?.map((book) => (
                <li key={book._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">Author: {book.author}</p>
                    <p className="text-sm text-gray-600">ISBN: {book.isbn}</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full mt-2 inline-block ${book.availibility ? 'bg-teal-200 text-teal-800' : 'bg-red-200 text-red-800'}`}>
                      {book.availibility ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    {book.availibility ? (
                      <button onClick={() => handleBorrow(book._id)} className={borderButton}>Borrow</button>
                    ) : (
                      <button disabled className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg cursor-not-allowed">Unavailable</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'borrowed' && (
            <ul className="divide-y divide-gray-200">
              {borrowedBooks?.length === 0 ? <p className="text-center text-gray-500">You have no borrowed books.</p> : borrowedBooks?.map((record) => (
                <li key={record._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{record.book?.title || 'Unknown Book'}</h3>
                    <p className="text-sm text-gray-600">Author: {record.book?.author || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Return Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <button onClick={() => handleReturn(record.book._id)} className={borderButton}>Return</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'returned' && (
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
          )}
        </div>
      </div>
    </>
  ));
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen my-8"
         style={{ background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)", backgroundAttachment: "fixed" }}>
      {showMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg bg-white">
          {message}
        </div>
      )}

      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-8 space-y-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-600">
            Library Management
          </h1>
          <span className="px-4 py-2 text-sm">
            Current User: <span className="font-semibold">{userRole === 'librarian' ? 'Librarian' : 'User'}</span>
          </span>
        </div>

        {userRole === 'librarian' ? <LibrarianDashboard /> : <UserDashboard />}
      </div>
    </div>
  );
};

export default Library;