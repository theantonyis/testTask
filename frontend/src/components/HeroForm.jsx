import React, { useState, useEffect } from "react";
import { Save, X, User, FileText, Zap, MessageSquare, ImagePlus } from "lucide-react";

function HeroForm({ fetchHeroes, editingId, setEditingId, initialData = {} }) {
    const [formData, setFormData] = useState({
        nickname: "",
        real_name: "",
        origin_description: "",
        superpowers: "",
        catch_phrase: "",
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const API = "http://localhost:5000";

    // Reset form when editingId changes or initialData updates
    useEffect(() => {
        console.log("Editing ID:", editingId);
        console.log("Initial Data:", initialData);

        if (editingId && initialData) {
            setFormData({
                nickname: initialData.nickname || "",
                real_name: initialData.real_name || "",
                origin_description: initialData.origin_description || "",
                superpowers: Array.isArray(initialData.superpowers)
                    ? initialData.superpowers.join(", ")
                    : initialData.superpowers || "",
                catch_phrase: initialData.catch_phrase || "",
            });

            if (initialData.images && initialData.images.length > 0) {
                setPreview(initialData.images[0]);
            }
        } else {
            setFormData({
                nickname: "",
                real_name: "",
                origin_description: "",
                superpowers: "",
                catch_phrase: "",
            });
            setPreview(null);
            setImages([]);
        }
    }, [editingId, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field changed: ${name} = ${value}`);
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };
            console.log("Updated formData:", updated);
            return updated;
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        // Create preview for the first image
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        console.log("Submitting form data:", formData);

        try {
            const form = new FormData();

            // Append all form fields
            Object.keys(formData).forEach((key) => {
                console.log(`Appending ${key}: ${formData[key]}`);
                form.append(key, formData[key]);
            });

            // Append single image if available
            if (images.length > 0) {
                console.log(`Appending image: ${images[0].name}`);
                form.append("image", images[0]);
            }

            let response;
            if (editingId) {
                console.log(`Updating hero with ID: ${editingId}`);
                response = await fetch(`${API}/superheroes/${editingId}`, {
                    method: 'PUT',
                    body: form
                });
            } else {
                console.log("Creating new hero");
                response = await fetch(`${API}/superheroes`, {
                    method: 'POST',
                    body: form
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log("Hero saved successfully!");

            // Reset form
            setFormData({
                nickname: "",
                real_name: "",
                origin_description: "",
                superpowers: "",
                catch_phrase: "",
            });
            setImages([]);
            setPreview(null);
            setEditingId(null);
            fetchHeroes();
        } catch (err) {
            console.error("Error saving hero:", err);
            alert("Failed to save superhero. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            nickname: "",
            real_name: "",
            origin_description: "",
            superpowers: "",
            catch_phrase: "",
        });
        setImages([]);
        setPreview(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
                {editingId ? "Edit Superhero" : "Add New Superhero"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Nickname*</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="Superhero Nickname"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Real Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="real_name"
                                value={formData.real_name}
                                onChange={handleChange}
                                placeholder="Real Name"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Catch Phrase</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <MessageSquare size={18} />
                            </div>
                            <input
                                type="text"
                                name="catch_phrase"
                                value={formData.catch_phrase}
                                onChange={handleChange}
                                placeholder="Catch Phrase"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Superhero Images</label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="hero-image-upload" className="flex flex-col w-full h-32 border-2 border-dashed rounded-lg border-gray-300 hover:bg-gray-50 hover:border-blue-500 cursor-pointer">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <ImagePlus className="text-gray-400 mb-2" size={24} />
                                    <p className="text-sm text-gray-500">
                                        {images.length > 0
                                            ? `${images.length} image${images.length > 1 ? 's' : ''} selected`
                                            : "Click to browse images"}
                                    </p>
                                </div>
                                <input
                                    id="hero-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>

                    {preview && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-1">Preview:</p>
                            <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    onClick={() => {
                                        setPreview(null);
                                        setImages([]);
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-1">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Superpowers</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <Zap size={18} />
                            </div>
                            <input
                                type="text"
                                name="superpowers"
                                value={formData.superpowers}
                                onChange={handleChange}
                                placeholder="Superpowers (comma separated)"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Origin Story</label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 text-gray-500 pointer-events-none">
                                <FileText size={18} />
                            </div>
                            <textarea
                                name="origin_description"
                                value={formData.origin_description}
                                onChange={handleChange}
                                placeholder="Origin Story"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save size={18} />
                            )}
                            {editingId ? "Update Hero" : "Save Hero"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroForm;