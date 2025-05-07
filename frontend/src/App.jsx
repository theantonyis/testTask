import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, ArrowLeft } from "lucide-react";
import HeroForm from "./components/HeroForm.jsx";
import HeroList from "./components/HeroList.jsx";
import HeroDetail from "./components/HeroDetail.jsx"; // You'll need to create this component

const API = "http://localhost:5000";

function App() {
    const [heroes, setHeroes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [viewingHero, setViewingHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState("list"); // "list", "form", "detail"

    const fetchHeroes = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/superheroes`);
            setHeroes(res.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch heroes:", err);
            setError("Failed to load superheroes. Please try again later.");
            // If API is not available in development, use empty array
            setHeroes([]);
        } finally {
            setLoading(false);
        }
    };

    // Centralized function to manage view transitions
    const setViewState = (newView, options = {}) => {
        setView(newView);
        setEditingId(options.editingId || null);
        setViewingHero(options.viewingHero || null);
        if (options.scrollToTop) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleEdit = async (hero) => {
        try {
            const res = await axios.get(`${API}/superheroes/${hero.id}`);
            setViewState("form", { editingId: hero.id, scrollToTop: true });
        } catch (err) {
            console.error("Failed to fetch hero data:", err);
            alert("Failed to load hero data. Please try again.");
        }
    };

    const handleView = (hero) => {
        setViewState("detail", { viewingHero: hero, scrollToTop: true });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this hero?")) {
            try {
                await axios.delete(`${API}/superheroes/${id}`);
                fetchHeroes();
            } catch (err) {
                console.error("Failed to delete hero:", err);
                alert("Failed to delete superhero. Please try again.");
            }
        }
    };

    const handleAddNew = () => {
        setViewState("form", { scrollToTop: true });
    };

    const handleBack = () => {
        setViewState("list");
    };

    useEffect(() => {
        fetchHeroes();
    }, []);

    // When editing is cancelled, go back to list view
    useEffect(() => {

    }, [editingId, view]);

    // Render different views based on state
    const renderView = () => {
        if (view === "detail" && viewingHero) {
            return <HeroDetail hero={viewingHero} onBack={handleBack} onEdit={() => handleEdit(viewingHero)} />;
        }

        if (view === "form") { // Ensure form view is rendered when view is "form"
            return (
                <HeroForm
                    fetchHeroes={fetchHeroes}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    initialData={viewingHero}
                    onBack={handleBack} // Provide onBack handler for form view
                />
            );
        }

        return (
            <>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Superhero Registry</h1>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Add New Hero
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                ) : (
                    <HeroList
                        heroes={heroes}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                )}
            </>
        );
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Back button for form and detail views */}
            {(view === "form" || view === "detail") && (
                <button
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to List
                </button>
            )}

            {renderView()}
        </div>
    );
}

export default App;
