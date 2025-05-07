import React, { useState, useEffect } from "react";
import axios from "axios";

function HeroCard({ hero, onEdit, onDelete }) {
    const [image, setImage] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            const res = await axios.get(`http://localhost:5000/superheroes/${hero.id}`);
            if (res.data.image) setImage(res.data.image);
        };
        fetch();
    }, [hero.id]);

    return (
        <div className="bg-white p-4 rounded shadow flex flex-col">
            {image && <img src={image} alt={hero.nickname} className="rounded w-full mb-2" />}
            <h2 className="font-bold text-xl">{hero.nickname}</h2>
            <p className="text-sm text-gray-600">{hero.real_name}</p>
            <p className="text-sm">{hero.origin_description}</p>
            <p className="text-sm italic">{hero.superpowers}</p>
            <p className="text-sm font-medium text-blue-800">{hero.catch_phrase}</p>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={onEdit}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black py-1 px-3 rounded"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default HeroCard;
