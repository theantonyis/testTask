import React, { useState } from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

// Mock data array - use this for development until the API is connected
const MOCK_HEROES = [
    {
        id: 1,
        nickname: "Superman",
        real_name: "Clark Kent",
        origin_description: "He was born Kal-El on the planet Krypton, before being rocketed to Earth as an infant by his scientist father Jor-El, moments before Krypton's destruction...",
        superpowers: "Solar energy absorption and healing factor, solar flare and heat vision, solar invulnerability, flight",
        catch_phrase: "Look, up in the sky, it's a bird, it's a plane, it's Superman!",
        images: ["/api/placeholder/400/300"]
    },
    {
        id: 2,
        nickname: "Spider-Man",
        real_name: "Peter Parker",
        origin_description: "Bitten by a radioactive spider, Peter Parker gained spider-like abilities and uses them to fight crime in New York City.",
        superpowers: "Enhanced strength, speed, agility, spider-sense, wall-crawling",
        catch_phrase: "With great power comes great responsibility.",
        images: ["/api/placeholder/400/300"]
    },
    {
        id: 3,
        nickname: "Wonder Woman",
        real_name: "Diana Prince",
        origin_description: "Princess of the Amazons, Diana was raised on the hidden island of Themyscira before venturing into the world of men.",
        superpowers: "Superhuman strength, speed, durability, flight, combat skill",
        catch_phrase: "For the glory of Hera!",
        images: ["/api/placeholder/400/300"]
    },
    {
        id: 4,
        nickname: "Iron Man",
        real_name: "Tony Stark",
        origin_description: "A billionaire industrialist who developed a powered suit of armor to save his life and escape captivity, later deciding to use the suit to protect the world as Iron Man.",
        superpowers: "Genius-level intellect, powered armor providing superhuman strength, durability, flight, and advanced weaponry",
        catch_phrase: "I am Iron Man.",
        images: ["/api/placeholder/400/300"]
    },
    {
        id: 5,
        nickname: "Black Widow",
        real_name: "Natasha Romanoff",
        origin_description: "Trained from a young age as a Russian spy and assassin, she later defected to the United States and became a member of the Avengers.",
        superpowers: "Expert martial artist, spy, and tactician; slowed aging process and enhanced immune system",
        catch_phrase: "I'm always picking up after you boys.",
        images: ["/api/placeholder/400/300"]
    },
    {
        id: 6,
        nickname: "Black Panther",
        real_name: "T'Challa",
        origin_description: "King of the African nation of Wakanda who gains enhanced abilities by ingesting the heart-shaped herb, as well as using advanced Vibranium technology.",
        superpowers: "Enhanced strength, speed, agility, durability, and senses; genius-level intellect; master martial artist",
        catch_phrase: "Wakanda Forever!",
        images: ["/api/placeholder/400/300"]
    }
];

function HeroList({ heroes = MOCK_HEROES, onEdit, onDelete, onView }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // If heroes array is empty (e.g., when loading), use mock data
    const displayHeroes = heroes.length > 0 ? heroes : MOCK_HEROES;

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
            <h2 className="text-xl font-bold mb-6 text-gray-800">Superhero Database</h2>

            <div className="grid grid-cols-1 gap-4">
                {currentHeroes.map(hero => (
                    <div key={hero.id} className="border rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                        <div className="w-full md:w-1/4 h-40">
                            {hero.image ? (
                                <img
                                    src={hero.image}
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