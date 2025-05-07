import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';

function HeroDetail({ hero, onBack, onEdit }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!hero) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-center text-gray-500">No hero selected</p>
            </div>
        );
    }

    const { nickname, real_name, origin_description, superpowers, catch_phrase, images = [] } = hero;

    const nextImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Hero header with main info */}
            <div className="p-6 bg-blue-600 text-white">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{nickname}</h1>
                    <button
                        onClick={() => onEdit(hero)}
                        className="bg-white text-blue-600 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <Edit size={18} /> Edit Hero
                    </button>
                </div>
                <p className="text-blue-100 mt-2">Real Name: {real_name}</p>
            </div>

            <div className="p-6">
                {/* Image gallery */}
                {images && images.length > 0 && (
                    <div className="mb-8">
                        <div className="relative h-64 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={images[currentImageIndex]}
                                alt={nickname}
                                className="w-full h-full object-contain"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                            {/* Image counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>
                        {/* Thumbnail gallery for multiple images */}
                        {images.length > 1 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-16 h-16 rounded border-2 cursor-pointer flex-shrink-0 ${
                                            idx === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
                                        }`}
                                        onClick={() => setCurrentImageIndex(idx)}
                                    >
                                        <img src={img} alt={`${nickname} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Hero details */}
                <div className="grid gap-6">
                    {/* Origin */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Origin</h2>
                        <p className="text-gray-600">{origin_description}</p>
                    </div>

                    {/* Superpowers */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Superpowers</h2>
                        {Array.isArray(superpowers) && superpowers.length > 0 ? (
                            <ul className="list-disc pl-5 text-gray-600 grid gap-1">
                                {superpowers.map((power, idx) => (
                                    <li key={idx}>{power}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600">{superpowers || "No superpowers listed"}</p>
                        )}
                    </div>

                    {/* Catch phrase */}
                    {catch_phrase && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Catch Phrase</h2>
                            <blockquote className="italic text-gray-600 border-l-4 border-blue-400 pl-4 py-2">
                                "{catch_phrase}"
                            </blockquote>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer with back button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ChevronLeft size={18} /> Back to Heroes
                </button>
            </div>
        </div>
    );
}

export default HeroDetail;