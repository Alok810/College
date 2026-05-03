import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getAllBooks, addBook, deleteBook, borrowBook, returnBook,
  getBorrowedBooksForAdmin, getBorrowedBooksForUser,
  getReturnedBooksForAdmin, getReturnedBooksForUser,
  getAllUsersForAdmin, borrowBookByLibrarian, updateBook, returnBookByAdmin,
  addBookReview, bulkImportBooks,
  getPendingBorrowRequests, approveRequest, rejectRequest, getMyPendingRequests
} from '../api';
import { useAuth } from '../context/AuthContext';

// ✅ IMPORT THE BOUNCER COMPONENT
import RequireVerification from '../components/RequireVerification';

// Import components from the new folder structure
import { ReviewModal } from "../components/Library/LibraryShared.jsx";
import { LibrarianDashboard } from "../components/Library/LibrarianView.jsx";
import { UserDashboard } from "../components/Library/UserView.jsx";

const Library = ({ userRole }) => {
  const { loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || (userRole === 'librarian' ? 'overview' : 'total'); 

  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [editBook, setEditBook] = useState(null);
  
  const [pendingRequests, setPendingRequests] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('library_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [bookToReview, setBookToReview] = useState(null);

  const openReviewModal = useCallback((book) => {
    setBookToReview(book);
    setReviewModalOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('library_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((bookId) => {
    setWishlist(prev => prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]);
  }, []);

  const formRef = useRef(null);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const buttonStyle = "py-2 rounded-lg shadow-md hover:opacity-90 font-semibold text-white";
  const gradientButton = "bg-gradient-to-r from-purple-600 to-teal-600";
  const borderButton = "px-4 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200";

  const displayMessage = useCallback((msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => { setShowMessage(false); setMessage(''); }, 3000);
  }, []);

  const fetchBooks = useCallback(async () => {
    try { setBooks(await getAllBooks()); } 
    catch (error) { console.error(error); displayMessage('Failed to fetch books.'); }
  }, [displayMessage]);

  const fetchBorrowedBooks = useCallback(async () => {
    try {
      if (userRole === 'librarian') setBorrowedBooks(await getBorrowedBooksForAdmin());
      else setBorrowedBooks(await getBorrowedBooksForUser());
    } catch (error) { displayMessage(error.message || 'Failed to fetch borrowed books.'); }
  }, [userRole, displayMessage]);

  const fetchReturnedBooks = useCallback(async () => {
    try {
      if (userRole === 'librarian') setReturnedBooks(await getReturnedBooksForAdmin());
      else setReturnedBooks(await getReturnedBooksForUser());
    } catch (error) { displayMessage(error.message || 'Failed to fetch returned books.'); }
  }, [userRole, displayMessage]);

  const fetchAllUsers = useCallback(async () => {
    try { setAllUsers(await getAllUsersForAdmin()); } 
    catch (error) { console.error(error); displayMessage('Failed to fetch all users.'); }
  }, [displayMessage]);

  const fetchPendingRequests = useCallback(async () => {
    try {
      if (userRole === 'librarian') {
        setPendingRequests(await getPendingBorrowRequests());
      } else {
        setPendingRequests(await getMyPendingRequests());
      }
    } catch (error) { console.error(error); }
  }, [userRole]);

  useEffect(() => {
    if (loading) return;
    if (activeTab === 'add' && !editBook) return;

    switch (activeTab) {
      case 'overview': 
        fetchBooks();
        if (userRole === 'librarian') { 
          fetchBorrowedBooks(); 
          fetchPendingRequests();
        }
        break;
      case 'total': 
        fetchBooks(); 
        if (userRole !== 'librarian') {
          fetchPendingRequests();
          fetchBorrowedBooks();
        }
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
        if (userRole === 'librarian') { fetchAllUsers(); fetchBooks(); } 
        break;
      case 'requests':
        if (userRole === 'librarian') fetchPendingRequests();
        break;
      default: 
        fetchBooks();
    }
  }, [userRole, activeTab, loading, fetchBooks, fetchBorrowedBooks, fetchReturnedBooks, fetchAllUsers, fetchPendingRequests, editBook]);

  const handleTabChange = useCallback((tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
    setSearchTerm('');
    setActiveCategory('All');
  }, [setSearchParams]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const formData = new FormData();
    
    formData.append('title', form.title.value);
    formData.append('author', form.author.value);
    formData.append('isbn', form.isbn.value);
    formData.append('category', form.category.value);
    formData.append('description', form.description.value);
    formData.append('price', form.price.value);
    formData.append('quantity', form.quantity.value);
    formData.append('isAvailable', parseInt(form.quantity.value) > 0);

    if (form.coverImage.files[0]) formData.append('coverImage', form.coverImage.files[0]);
    if (form.eBookFile.files[0]) formData.append('eBookFile', form.eBookFile.files[0]);

    try {
      displayMessage('Uploading files and saving book... Please wait.');
      if (editBook) {
        const updatedBook = await updateBook(editBook._id, formData);
        displayMessage('Book updated successfully!');
        setBooks(prev => prev.map(book => book._id === updatedBook._id ? updatedBook : book));
        setEditBook(null);
      } else {
        const newBook = await addBook(formData);
        displayMessage('Book added successfully!');
        setBooks(prev => [...prev, newBook]);
      }
      formRef.current.reset();
      handleTabChange('total');
    } catch (error) {
      displayMessage(error.message || `Failed to ${editBook ? 'update' : 'add'} book.`);
    }
  }, [displayMessage, formRef, editBook, handleTabChange, setEditBook]);

  const handleBulkImport = useCallback(async (file) => {
    try {
      displayMessage('Uploading and processing CSV... Please wait.');
      const formData = new FormData();
      formData.append('csvFile', file);
      const response = await bulkImportBooks(formData);
      displayMessage(response.message || 'Books imported successfully!');
      fetchBooks();
      handleTabChange('total');
    } catch (error) {
      displayMessage(error.message || 'Failed to import books.');
    }
  }, [displayMessage, fetchBooks, handleTabChange]);

  const handleEdit = useCallback((book) => { setEditBook(book); handleTabChange('add'); }, [setEditBook, handleTabChange]);

  const handleLibrarianBorrow = useCallback(async (userId, bookId, dueDate) => {
    try {
      await borrowBookByLibrarian(userId, bookId, dueDate);
      displayMessage('Book assigned successfully!');
      handleTabChange('borrowed');
    } catch (error) { displayMessage(error.message || 'Failed to assign book.'); }
  }, [displayMessage, handleTabChange]);

  const handleBorrow = useCallback(async (bookId) => {
    try {
      await borrowBook(bookId);
      displayMessage('Book requested successfully! Awaiting librarian approval.');
      fetchBooks(); 
      fetchPendingRequests(); 
    } catch (error) { displayMessage(error.message || 'Failed to request book.'); }
  }, [displayMessage, fetchBooks, fetchPendingRequests]);

  const handleReturn = useCallback(async (recordId, fineAmount = 0) => {
    const confirmMessage = fineAmount > 0 
      ? `This book has a fine of $${fineAmount.toFixed(2)}. Confirm collection and return?` 
      : "Are you sure you want to return this book?";

    if (window.confirm(confirmMessage)) {
      try {
        if (userRole === 'librarian') await returnBookByAdmin(recordId, fineAmount); 
        else await returnBook(recordId);
        displayMessage('Book return processed successfully!');
      } catch (error) { displayMessage(error.message || 'Failed to process book return.'); }
      fetchBooks(); fetchBorrowedBooks(); fetchReturnedBooks();
    }
  }, [userRole, displayMessage, fetchBooks, fetchBorrowedBooks, fetchReturnedBooks]);

  const handleDelete = useCallback(async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(bookId);
        displayMessage('Book deleted successfully!');
        setBooks(prev => prev.filter(book => book._id !== bookId));
      } catch (error) { 
        console.error(error);
        displayMessage('Failed to delete book.'); 
      }
    }
  }, [displayMessage, setBooks]);

  const handleReviewSubmit = useCallback(async (rating, comment) => {
    if (!bookToReview) return;
    try {
      await addBookReview(bookToReview._id, { rating, comment });
      displayMessage("Review submitted! Thank you.");
      setReviewModalOpen(false);
      fetchBooks();
    } catch (error) { displayMessage(error.message || "Failed to submit review."); }
  }, [bookToReview, displayMessage, fetchBooks]);
  
  const handleApproveRequest = useCallback(async (requestId, dueDate) => {
    try {
      await approveRequest(requestId, dueDate);
      displayMessage('Request approved successfully! Book issued.');
      fetchPendingRequests();
      fetchBooks(); 
    } catch (error) {
      displayMessage(error.message || 'Failed to approve request.');
    }
  }, [displayMessage, fetchPendingRequests, fetchBooks]);

  const handleRejectRequest = useCallback(async (requestId) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      try {
        await rejectRequest(requestId);
        displayMessage('Request rejected and removed.');
        fetchPendingRequests();
      } catch (error) {
        displayMessage(error.message || 'Failed to reject request.');
      }
    }
  }, [displayMessage, fetchPendingRequests]);

  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter(book => {
        const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || book.author?.toLowerCase().includes(searchTerm.toLowerCase()) || book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (a.title?.toLowerCase() || '').localeCompare(b.title?.toLowerCase() || ''));
  }, [books, searchTerm, activeCategory]);

  return (
    // ✅ ENTIRE PAGE IS NOW WRAPPED IN REQUIREVERIFICATION
    <RequireVerification>
      <div className="flex flex-col flex-1 items-center h-[calc(100dvh-60px)] sm:h-[calc(100vh-80px)] w-full max-w-[100vw] overflow-hidden -mt-4 sm:pt-4 pb-20 sm:pb-4 relative">
        {showMessage && (
          <div className="fixed top-20 sm:top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg bg-slate-900 text-white font-bold text-sm animate-in slide-in-from-top-4 fade-in w-[90%] sm:w-auto text-center">
            {message}
          </div>
        )}

        <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} onSubmit={handleReviewSubmit} bookTitle={bookToReview?.title} />

        <div className="flex flex-col flex-1 w-[94%] sm:w-full max-w-6xl mx-auto h-full min-h-0 gap-3 sm:gap-4 relative">
          {userRole === 'librarian' ? (
            <LibrarianDashboard
              books={filteredAndSortedBooks} borrowedBooks={borrowedBooks} returnedBooks={returnedBooks}
              allUsers={allUsers} activeTab={activeTab} handleTabChange={handleTabChange}
              handleSubmit={handleSubmit} handleEdit={handleEdit} handleDelete={handleDelete}
              handleReturn={handleReturn} handleLibrarianBorrow={handleLibrarianBorrow}
              formRef={formRef} buttonStyle={buttonStyle} gradientButton={gradientButton} borderButton={borderButton} editBook={editBook} setEditBook={setEditBook}
              searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
              handleBulkImport={handleBulkImport} 
              pendingRequests={pendingRequests}
              handleApproveRequest={handleApproveRequest}
              handleRejectRequest={handleRejectRequest}
            />
          ) : (
            <UserDashboard
              books={filteredAndSortedBooks} borrowedBooks={borrowedBooks} returnedBooks={returnedBooks}
              activeTab={activeTab} handleTabChange={handleTabChange} handleBorrow={handleBorrow}
              handleReturn={handleReturn} gradientButton={gradientButton} borderButton={borderButton}
              searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
              wishlist={wishlist} toggleWishlist={toggleWishlist} onOpenReview={openReviewModal} pendingRequests={pendingRequests}
            />
          )}
        </div>
      </div>
    </RequireVerification>
  );
};

export default Library;