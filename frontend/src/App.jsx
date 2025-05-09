import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroList from './components/HeroList';
import HeroDetail from './components/HeroDetail';
import HeroForm from './components/HeroForm';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HeroList />} />
                <Route path="/hero/:id" element={<HeroDetail />} />
                <Route path="/add" element={<HeroForm />} />
                <Route path="/edit/:id" element={<HeroForm edit />} />
            </Routes>
        </Router>
    );
}

export default App;
