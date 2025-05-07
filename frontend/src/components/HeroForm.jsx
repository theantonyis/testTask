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

    useEffect(() => {
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
            setImages([]);
            setPreview(null);
        }
    }, [editingId, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === "superpowers") {
                    value.split(",").map((item) => item.trim()).filter(Boolean).forEach(power => {
                        form.append("superpowers", power);
                    });
                } else {
                    form.append(key, value);
                }
            });

            if (images.length > 0) {
                form.append("image", images[0]);
            }

            const response = await fetch(
                `${API}/superheroes${editingId ? `/${editingId}` : ""}`,
                {
                    method: editingId ? "PUT" : "POST",
                    body: form
                }
            );

            if (!response.ok) throw new Error("Failed to save");

            // Reset form and refresh list
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
            console.error("Error:", err);
            alert("Failed to save superhero.");
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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Nickname*</label>
                        <div className="relative">
                            <User className="absolute inset-y-0 left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                required
                                placeholder="Superhero Nickname"
                                className="w-full pl-10 p-3 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Real Name</label>
                        <div className="relative">
                            <User className="absolute inset-y-0 left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="real_name"
                                value={formData.real_name}
                                onChange={handleChange}
                                placeholder="Real Name"
                                className="w-full pl-10 p-3 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Catch Phrase</label>
                        <div className="relative">
                            <MessageSquare className="absolute inset-y-0 left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="catch_phrase"
                                value={formData.catch_phrase}
                                onChange={handleChange}
                                placeholder="Catch Phrase"
                                className="w-full pl-10 p-3 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Superhero Images</label>
                        <label htmlFor="image-upload" className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                            <ImagePlus className="text-gray-400 mb-2" size={24} />
                            <p className="text-sm text-gray-500">
                                {images.length > 0
                                    ? `${images.length} image selected`
                                    : "Click to select image"}
                            </p>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                        {preview && (
                            <div className="mt-2 relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreview(null);
                                        setImages([]);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Superpowers</label>
                        <div className="relative">
                            <Zap className="absolute inset-y-0 left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="superpowers"
                                value={formData.superpowers}
                                onChange={handleChange}
                                placeholder="Superpowers (comma separated)"
                                className="w-full pl-10 p-3 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Origin Story</label>
                        <div className="relative">
                            <FileText className="absolute top-3 left-3 text-gray-500" size={18} />
                            <textarea
                                name="origin_description"
                                value={formData.origin_description}
                                onChange={handleChange}
                                placeholder="Origin Story"
                                className="w-full pl-10 p-3 border rounded-lg h-32"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save size={18} />
                            )}
                            {editingId ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default HeroForm;
