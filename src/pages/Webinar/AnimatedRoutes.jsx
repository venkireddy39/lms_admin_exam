import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import FirstPage from './FirstPage';
import Webinars from './Webinars';
import WebinarDetail from './WebinarDetail';
import PageTransition from './PageTransition';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route index element={<PageTransition><FirstPage /></PageTransition>} />
                <Route path="webinars" element={<PageTransition><Webinars /></PageTransition>} />
                <Route path=":id" element={<PageTransition><WebinarDetail /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
