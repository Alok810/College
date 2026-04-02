import React, { useState, useRef } from 'react';
import { Loader2, Save, Camera } from 'lucide-react';
import { updateUserProfile } from '../api';

const EditProfile = ({ user, setShowEdit, setUser }) => {
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

    const [profileFile, setProfileFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=EBF4FF&color=4F46E5&size=150`);
    const [coverPreview, setCoverPreview] = useState(user.coverPhoto || "https://images.unsplash.com/photo-1707343843437-caacff5cfa74");

    const [isSaving, setIsSaving] = useState(false);
    const profileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

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

    // 💅 MODERN UI STYLES 
    const inputClasses = "mt-1.5 block w-full rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-800 transition-all duration-200 hover:bg-gray-100/50 focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 outline-none shadow-sm";
    const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider ml-2";

    return (
        <>
        <style>{`
            @keyframes slideUpSheet {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `}</style>

        <div 
            className='fixed inset-0 flex items-end sm:items-center justify-center z-[999] sm:p-6 bg-transparent sm:bg-slate-900/10'
            onClick={() => setShowEdit(false)} 
        >
            {/* ✅ ADDED: sm:top-12 to physically shift it down on desktop. 
                ✅ ADJUSTED: sm:max-h-[80vh] so the bottom doesn't get clipped after shifting it down. */}
            <div 
                className='bg-white w-full sm:max-w-2xl rounded-t-[2.5rem] rounded-b-none sm:rounded-[2rem] flex flex-col max-h-[92vh] sm:max-h-[80vh] overflow-hidden relative shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] sm:top-12'
                style={{ animation: 'slideUpSheet 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Native iOS style Drag Handle (Hidden on Desktop) */}
                <div className="w-full flex justify-center pt-3 pb-2 sm:hidden absolute top-0 z-30 bg-white rounded-t-[2.5rem]">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                {/* Header */}
                <div className='px-6 py-4 mt-5 sm:mt-0 border-b border-gray-50 flex justify-between items-center bg-white z-20'>
                    <h2 className='text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500'>
                        Edit Profile
                    </h2>
                    <button onClick={() => setShowEdit(false)} className='text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all duration-200'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className='overflow-y-auto custom-scrollbar flex-1 relative bg-white'>
                    
                    {/* Cover & Profile Photos */}
                    <div className='relative h-44 sm:h-52 bg-gray-100 group'>
                        <img src={coverPreview} alt="Cover" className='w-full h-full object-cover transition duration-300 group-hover:brightness-95' />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent'></div>
                        <button 
                            type="button"
                            onClick={() => coverInputRef.current.click()}
                            className='absolute top-4 right-4 bg-white/90 p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all text-gray-800'
                        >
                            <Camera className='w-5 h-5' />
                        </button>
                        <input type="file" ref={coverInputRef} onChange={(e) => handleImageChange(e, 'cover')} className="hidden" accept="image/*" />

                        <div className='absolute -bottom-14 left-6 sm:left-8'>
                            <div className='relative group/profile'>
                                <img src={profilePreview} alt="Profile" className='w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-xl bg-white' />
                                <button 
                                    type="button"
                                    onClick={() => profileInputRef.current.click()}
                                    className='absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-white p-2 sm:p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border border-gray-100 text-gray-800'
                                >
                                    <Camera className='w-4 h-4 sm:w-5 sm:h-5' />
                                </button>
                                <input type="file" ref={profileInputRef} onChange={(e) => handleImageChange(e, 'profile')} className="hidden" accept="image/*" />
                            </div>
                        </div>
                    </div>

                    <form id="editProfileForm" onSubmit={handleSubmit} className='px-6 pt-20 sm:pt-24 pb-8 space-y-6 sm:px-8'>
                        <div>
                            <label className={labelClasses}>Bio</label>
                            <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." className={`${inputClasses} resize-none`} />
                        </div>
                        
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            <div>
                                <label className={labelClasses}>Pronouns</label>
                                <input type="text" name="pronouns" value={formData.pronouns} onChange={handleChange} placeholder="e.g., He/Him" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Relationship</label>
                                <select name="relationship" value={formData.relationship} onChange={handleChange} className={`${inputClasses} appearance-none bg-white`}>
                                    {relationshipOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Works at</label>
                            <input type="text" name="work" value={formData.work} onChange={handleChange} placeholder="e.g., Software Engineer at Tech Corp" className={inputClasses} />
                        </div>
                        
                        <div>
                            <label className={labelClasses}>University</label>
                            <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Institute Name" className={inputClasses} />
                        </div>
                        
                        <div>
                            <label className={labelClasses}>High School</label>
                            <input type="text" name="highSchool" value={formData.highSchool} onChange={handleChange} placeholder="High School Name" className={inputClasses} />
                        </div>
                        
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            <div>
                                <label className={labelClasses}>Current City</label>
                                <input type="text" name="currentCity" value={formData.currentCity} onChange={handleChange} placeholder="Where do you live now?" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Hometown</label>
                                <input type="text" name="hometown" value={formData.hometown} onChange={handleChange} placeholder="Where are you from?" className={inputClasses} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Instagram ID</label>
                            <div className='flex items-center mt-1.5 shadow-sm rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-purple-400/10 focus-within:border-purple-400 border border-gray-200 transition-all bg-gray-50/80'>
                                <span className="flex items-center justify-center px-4 text-gray-500 font-bold h-12 border-r border-gray-200">@</span>
                                <input type="text" name="socialLink" value={formData.socialLink} onChange={handleChange} placeholder="username" className="flex-1 block w-full bg-transparent px-4 py-3 text-sm text-gray-800 outline-none h-12" />
                            </div>
                        </div>
                    </form>
                </div>

                <div className='px-6 sm:px-8 py-4 pb-20 sm:pb-5 border-t border-gray-100 bg-white flex justify-end gap-3 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]'>
                    <button type="button" onClick={() => setShowEdit(false)} disabled={isSaving} className='py-3 px-6 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 hover:text-gray-900 transition-all duration-200'>
                        Cancel
                    </button>
                    <button type="submit" form="editProfileForm" disabled={isSaving} className='py-3 px-8 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-200 flex items-center gap-2 active:scale-95'>
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className='w-5 h-5' />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default EditProfile;