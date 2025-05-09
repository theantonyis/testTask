import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Upload, Check, Loader, XCircle } from 'lucide-react';
import api from '../api/axios';

function HeroForm({ edit }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(edit);
    const [submitting, setSubmitting] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [form, setForm] = useState({
        nickname: '',
        real_name: '',
        origin_description: '',
        superpowers: '',
        catch_phrase: '',
    });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (edit && id) {
            api.get(`/superheroes/${id}`)
                .then(res => {
                    const { nickname, real_name, origin_description, superpowers, catch_phrase, images } = res.data;
                    setForm({ nickname, real_name, origin_description, superpowers, catch_phrase });

                    // Ensure images is an array
                    if (Array.isArray(images)) {
                        setExistingImages(images);
                    } else {
                        setExistingImages([]); // or set it to a default value if images is not an array
                    }
                })
                .catch(err => {
                    console.error('Error fetching hero data:', err);
                    alert('Could not load hero data. Please try again.');
                })
                .finally(() => setLoading(false));
        }
    }, [edit, id]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Clear validation error when field is updated
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = e => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

        // Create preview URLs for the new files
        const previews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewImages(prevPreviews => [...prevPreviews, ...previews]);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.nickname.trim()) newErrors.nickname = 'Nickname is required';
        if (!form.real_name.trim()) newErrors.real_name = 'Real name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        const formData = new FormData();

        // Append form fields to the formData
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Append selected files (images) to the formData
        files.forEach((file) => formData.append("images", file));

        // If editing, append the existing images (make sure this is correct on your backend)
        if (edit) {
            formData.append('existingImages', JSON.stringify(existingImages));
        }

        try {
            const method = edit ? api.put : api.post;
            const endpoint = edit ? `/superheroes/${id}` : '/superheroes';

            // Submit the form data (including images)
            await method(endpoint, formData);

            // Cleanup and redirect
            previewImages.forEach((preview) => URL.revokeObjectURL(preview));
            navigate('/', {
                state: {
                    message: edit ? 'Hero updated successfully' : 'Hero created successfully',
                },
            });
        } catch (error) {
            console.error('Error saving hero:', error);
            alert(edit ? 'Failed to update hero' : 'Failed to create hero');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-6 flex justify-center items-center h-64">
                <Loader className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
                <Link to="/" className="mr-4 text-blue-600 hover:text-blue-800 flex items-center">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to List
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <h1 className="text-3xl font-bold text-blue-800 flex-grow">{edit ? 'Edit Superhero' : 'Create New Superhero'}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                                Nickname <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="nickname"
                                name="nickname"
                                value={form.nickname}
                                onChange={handleChange}
                                className={`w-full border ${errors.nickname ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="e.g. Superman"
                            />
                            {errors.nickname && <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>}
                        </div>

                        <div>
                            <label htmlFor="real_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Real Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="real_name"
                                name="real_name"
                                value={form.real_name}
                                onChange={handleChange}
                                className={`w-full border ${errors.real_name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="e.g. Clark Kent"
                            />
                            {errors.real_name && <p className="mt-1 text-sm text-red-600">{errors.real_name}</p>}
                        </div>

                        <div>
                            <label htmlFor="catch_phrase" className="block text-sm font-medium text-gray-700 mb-1">
                                Catch Phrase
                            </label>
                            <input
                                id="catch_phrase"
                                name="catch_phrase"
                                value={form.catch_phrase}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Up, up and away!"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="origin_description" className="block text-sm font-medium text-gray-700 mb-1">
                                Origin Description
                            </label>
                            <textarea
                                id="origin_description"
                                name="origin_description"
                                value={form.origin_description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief description of the hero's origin..."
                            />
                        </div>

                        <div>
                            <label htmlFor="superpowers" className="block text-sm font-medium text-gray-700 mb-1">
                                Superpowers
                            </label>
                            <textarea
                                id="superpowers"
                                name="superpowers"
                                value={form.superpowers}
                                onChange={handleChange}
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="List of superpowers..."
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hero Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                    <span>Upload images</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                </div>

                {existingImages.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Images:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {existingImages.map((imgUrl, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={`http://localhost:5000${imgUrl}`} // Ensure imgUrl contains correct path like '/uploads/hero-image.jpg'
                                        alt={`Existing ${idx + 1}`}
                                        className="h-48 w-full object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setExistingImages(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {previewImages.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Image Previews:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previewImages.map((preview, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${idx + 1}`}
                                        className="h-48 w-full object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewImages(prev => prev.filter((_, i) => i !== idx));
                                            setFiles(prev => prev.filter((_, i) => i !== idx));
                                        }}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                            <span>{edit ? 'Update Hero' : 'Create Hero'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HeroForm;
