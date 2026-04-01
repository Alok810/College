import React, { useState, useRef } from 'react';
import { Loader2, Save, Camera } from 'lucide-react';
import { updateUserProfile } from '../api';

const EditProfile = ({ user, setShowEdit, setUser }) => {
    // --- Text Data State ---
    const [formData, setFormData] = useState({
        bio: user.bio || '',
        pronouns: user.pronouns || '',
        work: user.work || '',
        university: user.university || '',
        highSchool: user.highSchool || '',
        currentCity: user.currentCity || '',
        hometown: user.hometown || '',
        relationship: user.relationship || 'Not specified',
        socialLink: user.socialLink || '',
    });

    // --- Image File & Preview State ---
    const [profileFile, setProfileFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=EBF4FF&color=4F46E5&size=150`);
    const [coverPreview, setCoverPreview] = useState(user.coverPhoto || "https://images.unsplash.com/photo-1707343843437-caacff5cfa74");

    const [isSaving, setIsSaving] = useState(false);
    const profileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    // Handle Text Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // Handle Image Selection & Preview
    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (type === 'profile') {
                    setProfilePreview(reader.result);
                    setProfileFile(file);
                } else {
                    setCoverPreview(reader.result);
                    setCoverFile(file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit Everything
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // We MUST use FormData because we are sending actual files now!
        const submitData = new FormData();
        Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
        
        if (profileFile) submitData.append("profilePicture", profileFile);
        if (coverFile) submitData.append("coverPhoto", coverFile);

        try {
            const response = await updateUserProfile(submitData);
            setUser(response.user); 
            setShowEdit(false); 
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const relationshipOptions = ['Single', 'In a relationship', 'Married', 'Engaged', 'In a civil union', 'Separated', 'Divorced', 'Widowed', 'In a complicated situation', 'Not specified'];

    return (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-white w-full max-w-lg rounded-xl shadow-2xl transform transition-all duration-300 overflow-hidden flex flex-col max-h-[90vh]'>
                
                {/* Header */}
                <div className='p-4 border-b flex justify-between items-center bg-white z-10'>
                    <h2 className='text-xl font-bold text-gray-800'>Edit Profile</h2>
                    <button onClick={() => setShowEdit(false)} className='text-gray-400 hover:text-gray-600 transition text-2xl leading-none'>×</button>
                </div>

                {/* Scrollable Form Content */}
                <div className='overflow-y-auto custom-scrollbar flex-1 pb-6'>
                    
                    {/* --- Image Uploaders --- */}
                    <div className='relative h-36 bg-gray-200'>
                        {/* Cover Photo */}
                        <img src={coverPreview} alt="Cover Preview" className='w-full h-full object-cover' />
                        <div className='absolute inset-0 bg-black/20'></div>
                        <button 
                            type="button"
                            onClick={() => coverInputRef.current.click()}
                            className='absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow hover:bg-white transition'
                        >
                            <Camera className='w-5 h-5 text-gray-700' />
                        </button>
                        <input type="file" ref={coverInputRef} onChange={(e) => handleImageChange(e, 'cover')} className="hidden" accept="image/*" />

                        {/* Profile Photo */}
                        <div className='absolute -bottom-12 left-6'>
                            <div className='relative'>
                                <img src={profilePreview} alt="Profile Preview" className='w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg bg-white' />
                                <button 
                                    type="button"
                                    onClick={() => profileInputRef.current.click()}
                                    className='absolute bottom-0 right-0 bg-gray-200 p-1.5 rounded-full shadow hover:bg-gray-300 transition border-2 border-white'
                                >
                                    <Camera className='w-4 h-4 text-gray-700' />
                                </button>
                                <input type="file" ref={profileInputRef} onChange={(e) => handleImageChange(e, 'profile')} className="hidden" accept="image/*" />
                            </div>
                        </div>
                    </div>

                    {/* --- Text Fields --- */}
                    <form id="editProfileForm" onSubmit={handleSubmit} className='px-6 pt-16 space-y-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border resize-none" />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pronouns</label>
                                <input type="text" name="pronouns" value={formData.pronouns} onChange={handleChange} placeholder="e.g., He/Him" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Relationship</label>
                                <select name="relationship" value={formData.relationship} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                                    {relationshipOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Works at</label>
                            <input type="text" name="work" value={formData.work} onChange={handleChange} placeholder="e.g., Student" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">University</label>
                            <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Institute Name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">High School</label>
                            <input type="text" name="highSchool" value={formData.highSchool} onChange={handleChange} placeholder="High School Name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current City</label>
                                <input type="text" name="currentCity" value={formData.currentCity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hometown</label>
                                <input type="text" name="hometown" value={formData.hometown} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Instagram ID</label>
                            <div className='flex items-center mt-1'>
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm h-full">@</span>
                                <input type="text" name="socialLink" value={formData.socialLink} onChange={handleChange} placeholder="username" className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className='p-4 border-t bg-gray-50 flex justify-end space-x-3 z-10'>
                    <button type="button" onClick={() => setShowEdit(false)} disabled={isSaving} className='py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-150'>
                        Cancel
                    </button>
                    <button type="submit" form="editProfileForm" disabled={isSaving} className='py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center gap-2'>
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className='w-5 h-5' />}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;