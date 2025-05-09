import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ChevronRight, ChevronLeft, ChevronRight as ChevronRightArrow, Loader } from 'lucide-react';
import api from '../api/axios';

const ITEMS_PER_PAGE = 5;

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
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-white rounded-lg shadow-lg">
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
                        <ul className="space-y-3">
                            {paginated.map(hero => (
                                <li key={hero.id} className="transform transition-all duration-200 hover:-translate-y-1">
                                    <Link
                                        to={`/hero/${hero.id}`}
                                        className="block bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {hero.images && hero.images.length > 0 && (
                                                    <img
                                                        src={`http://localhost:5000/uploads/${hero.images[0]}`}
                                                        alt={hero.nickname}
                                                        className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                                                    />
                                                )}
                                                <div>
                                                    <h3 className="text-xl font-semibold text-blue-700">{hero.nickname}</h3>
                                                    {hero.real_name && (
                                                        <p className="text-gray-600 text-sm mt-1">AKA: {hero.real_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRightArrow className="h-6 w-6 text-gray-400" />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {pageCount > 1 && (
                        <div className="mt-8 flex justify-center">
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
