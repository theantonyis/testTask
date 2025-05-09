import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, ImageOff, Loader } from 'lucide-react';
import api from '../api/axios';

function HeroDetail() {
    const { id } = useParams();
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get(`/superheroes/${id}`)
            .then(res => setHero(res.data))
            .catch(err => console.error('Error fetching hero details:', err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/superheroes/${id}`);
            navigate('/', { state: { message: 'Hero successfully deleted' } });
        } catch (error) {
            console.error('Error during deletion:', error);
            setDeleting(false);
            setShowConfirmation(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-64">
                <Loader className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!hero) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-red-50 rounded-lg shadow text-center">
                <h2 className="text-2xl font-bold text-red-700 mb-2">Hero Not Found</h2>
                <p className="mb-4">The requested superhero could not be found.</p>
                <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors">
                    Return to Heroes List
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
                <Link to="/" className="mr-4 text-blue-600 hover:text-blue-800 flex items-center">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back to List
                </Link>
                <h1 className="text-3xl font-bold text-blue-800 flex-grow">{hero.nickname}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="bg-blue-50 p-6 rounded-lg shadow-inner mb-6">
                        <h2 className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2 mb-4">Hero Details</h2>

                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Real Name</h3>
                                <p className="text-lg">{hero.real_name || 'Unknown'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Origin</h3>
                                <p className="text-base">{hero.origin_description || 'Unknown'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Superpowers</h3>
                                <p className="text-base">{hero.superpowers || 'None'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Catch Phrase</h3>
                                <p className="text-base italic">"{hero.catch_phrase || 'None'}"</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Link
                            to={`/edit/${hero.id}`}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2.5 rounded-lg flex justify-center items-center transition-colors shadow-md"
                        >
                            <Edit className="h-5 w-5 mr-2" />
                            Edit Hero
                        </Link>
                        <button
                            onClick={() => setShowConfirmation(true)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg flex justify-center items-center transition-colors shadow-md"
                            disabled={deleting}
                        >
                            <Trash2 className="h-5 w-5 mr-2" />
                            {deleting ? 'Deleting...' : 'Delete Hero'}
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-blue-700 mb-4">Hero Images</h2>
                    {hero.images && hero.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {hero.images.map((src, i) => (
                                <div key={i} className="overflow-hidden rounded-lg shadow-md border border-gray-200 bg-gray-100">
                                    <img
                                        src={`http://localhost:5000${src}`}
                                        alt={hero.nickname}
                                        className="w-full h-auto max-h-64 object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 text-center">
                            <ImageOff className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600">No images available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Confirmation</h3>
                        <p className="mb-4 text-gray-600">Are you sure you want to delete <span className="font-semibold">{hero.nickname}</span>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HeroDetail;
