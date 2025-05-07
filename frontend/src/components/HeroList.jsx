import React, { useState } from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

function HeroList({ onEdit, onDelete, onView }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Pagination logic
    const indexOfLastHero = currentPage * itemsPerPage;
    const indexOfFirstHero = indexOfLastHero - itemsPerPage;
    const currentHeroes = displayHeroes.slice(indexOfFirstHero, indexOfLastHero);

    const totalPages = Math.ceil(displayHeroes.length / itemsPerPage);

    // Function to handle hero viewing (you'll need to implement onView in App.js)
    const handleView = (hero) => {
        if (typeof onView === 'function') {
            onView(hero);
        } else {
            console.log("View details for:", hero);
            // Fallback if onView not provided
            alert(`Hero Details: ${hero.nickname} (${hero.real_name})`);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 gap-4">
                {currentHeroes.map(hero => (
                    <div key={hero.id} className="border rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                        <div className="w-full md:w-1/4 h-40">
                            {hero.image ? (
                                <img
                                    src={`http://localhost:5000${hero.image}`}
                                    alt={hero.nickname}
                                    className="w-full h-full object-cover"
                                />
                            ) : hero.images && hero.images.length > 0 ? (
                                <img
                                    src={hero.images[0]}
                                    alt={hero.nickname}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{hero.nickname}</h3>
                                <p className="text-gray-600">Real name: {hero.real_name}</p>
                                <p className="text-gray-500 mt-2 line-clamp-2">{hero.origin_description}</p>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => handleView(hero)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="View details"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={() => onEdit(hero)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                    title="Edit hero"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete ${hero.nickname}?`)) {
                                            onDelete(hero.id);
                                        }
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete hero"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {displayHeroes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No superheroes found. Add your first hero!
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-l-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="border-t border-b px-4 flex items-center bg-white">
                        Page {currentPage} of {totalPages}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-r-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default HeroList;