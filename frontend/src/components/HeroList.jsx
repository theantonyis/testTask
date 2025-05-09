import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import api from '../api/axios';

const ITEMS_PER_PAGE = 6; // Increased to 6 for a better grid layout

function HeroList() {
    const [heroes, setHeroes] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/superheroes')
            .then(res => setHeroes(res.data))
            .catch(err => console.error('Error fetching heroes:', err))
            .finally(() => setLoading(false));
    }, []);

    const paginated = Array.isArray(heroes)
        ? heroes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
        : [];
    const pageCount = Math.ceil(heroes.length / ITEMS_PER_PAGE);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-white rounded-lg shadow-lg">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-blue-800 mb-4">Superhero Database</h1>
                <p className="text-gray-600 mb-6">Browse our collection of legendary superheroes</p>
                <Link
                    to="/add"
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add New Hero
                </Link>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
            ) : (
                <>
                    {heroes.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No heroes found. Add some to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {paginated.map(hero => (
                                <Link
                                    key={hero.id}
                                    to={`/hero/${hero.id}`}
                                    className="block transform transition-all duration-200 hover:-translate-y-1"
                                >
                                    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 h-full flex flex-col">
                                        <div className="h-36 overflow-hidden bg-gray-100 rounded-t-xl">
                                        {hero.images && hero.images.length > 0 ? (
                                                <img
                                                    src={`http://localhost:5000${hero.images[0]}`}
                                                    alt={hero.nickname}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                                    <span className="text-blue-300 text-4xl font-bold">{hero.nickname.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold text-blue-700 mb-2">{hero.nickname}</h3>
                                                {hero.real_name && (
                                                    <p className="text-gray-600 text-sm">AKA: {hero.real_name}</p>
                                                )}
                                            </div>
                                            <div className="flex justify-end mt-4">
                                                <span className="inline-flex items-center text-sm font-medium text-blue-600">
                                                    View Details
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {pageCount > 1 && (
                        <div className="mt-10 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {Array.from({ length: pageCount }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            page === i + 1
                                                ? 'z-10 bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, pageCount))}
                                    disabled={page === pageCount}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default HeroList;
