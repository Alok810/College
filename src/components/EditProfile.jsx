import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';

// This is the form, which only needs to be used by the modal.
// We can keep it in this file and not export it.
const EditModalForm = ({ formData, handleChange }) => {
    const relationshipOptions = ['Single', 'In a relationship', 'Married', 'Engaged', 'In a civil union', 'Separated', 'Divorced', 'Widowed', 'In a complicated situation', 'Not specified'];
    
    return (
        <div className='space-y-4 max-h-[55vh] overflow-y-auto pr-2'>
            {/* ... Form fields ... */}
            <div>
                <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">Pronouns (e.g., He/Him)</label>
                <input
                    type="text"
                    id="pronouns"
                    name="pronouns"
                    value={formData.pronouns || ''}
                    onChange={handleChange}
                    placeholder="Add your pronouns"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="work" className="block text-sm font-medium text-gray-700">Works at</label>
                <input
                    type="text"
                    id="work"
                    name="work"
                    value={formData.work || ''}
                    onChange={handleChange}
                    placeholder="Add your workplace/role (e.g., Student)"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
                <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university || ''}
                    onChange={handleChange}
                    placeholder="National Institute of Advanced Manufacturing Technology Ranchi"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="highSchool" className="block text-sm font-medium text-gray-700">High School</label>
                <input
                    type="text"
                    id="highSchool"
                    name="highSchool"
                    value={formData.highSchool || ''}
                    onChange={handleChange}
                    placeholder="Sarswati Shishu Vidya Mandir"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700">Current Town/City (Lives in)</label>
                <input
                    type="text"
                    id="currentCity"
                    name="currentCity"
                    value={formData.currentCity || ''}
                    onChange={handleChange}
                    placeholder="Sugauli"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="hometown" className="block text-sm font-medium text-gray-700">Home Town (From)</label>
                <input
                    type="text"
                    id="hometown"
                    name="hometown"
                    value={formData.hometown || ''}
                    onChange={handleChange}
                    placeholder="Sugauli"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Relationship</label>
                <select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship || 'Not specified'}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                    {relationshipOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="joined" className="block text-sm font-medium text-gray-700">Joined Platform</label>
                <input
                    type="text"
                    id="joined"
                    name="joined"
                    value={formData.joined || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-gray-50 text-gray-500"
                />
            </div>

            <div>
                <label htmlFor="socialLink" className="block text-sm font-medium text-gray-700">Social Link (Instagram ID)</label>
                <div className='flex items-center mt-1'>
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm h-full">
                        @
                    </span>
                    <input
                        type="text"
                        id="socialLink"
                        name="socialLink"
                        value={formData.socialLink || ''}
                        onChange={handleChange}
                        placeholder="alokgond.in"
                        className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>
        </div>
    );
}

// This is the main modal component, which we will export
const EditProfile = ({ user, setShowEdit, setUser }) => {
    const [formData, setFormData] = useState({
        pronouns: user.pronouns || '',
        work: user.work || '',
        university: user.university || '',
        highSchool: user.highSchool || '',
        currentCity: user.currentCity || '',
        hometown: user.hometown || '',
        relationship: user.relationship || 'Not specified',
        joined: user.joined || 'N/A',
        socialLink: user.socialLink || '',
        followers: user.followers || 0,
        _id: user._id,
        full_name: user.full_name,
        profilePicture: user.profilePicture,
        cover_photo: user.cover_photo,
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);

        setTimeout(() => {
            setUser(formData);
            setIsSaving(false);
            setShowEdit(false);
        }, 800);
    };

    return (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl transform transition-all duration-300 scale-100'>
                <h2 className='text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex justify-between items-center'>
                    Edit Profile Details
                    <button onClick={() => setShowEdit(false)} className='text-gray-400 hover:text-gray-600 transition'>
                        <span className="text-xl font-light">×</span>
                    </button>
                </h2>

                <form onSubmit={handleSubmit}>
                    <EditModalForm formData={formData} handleChange={handleChange} />

                    <div className='mt-6 flex justify-end space-x-3'>
                        <button
                            type="button"
                            onClick={() => setShowEdit(false)}
                            className='py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-150'
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className='py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center gap-2'
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className='w-5 h-5' />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;