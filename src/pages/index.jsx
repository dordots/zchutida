import Layout from "./Layout.jsx";

import Home from "./Home";

import MenteeProfile from "./MenteeProfile";

import MentorProfile from "./MentorProfile";

import Payment from "./Payment";

import SelectMentor from "./SelectMentor";

import Dashboard from "./Dashboard";

import Calendar from "./Calendar";

import ReportHours from "./ReportHours";

import MenteeDashboard from "./MenteeDashboard";

import MentorDashboard from "./MentorDashboard";

import BookSession from "./BookSession";

import ApproveSessionsMentor from "./ApproveSessionsMentor";

import AdminDashboard from "./AdminDashboard";

import CombinedDashboard from "./CombinedDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    MenteeProfile: MenteeProfile,
    
    MentorProfile: MentorProfile,
    
    Payment: Payment,
    
    SelectMentor: SelectMentor,
    
    Dashboard: Dashboard,
    
    Calendar: Calendar,
    
    ReportHours: ReportHours,
    
    MenteeDashboard: MenteeDashboard,
    
    MentorDashboard: MentorDashboard,
    
    BookSession: BookSession,
    
    ApproveSessionsMentor: ApproveSessionsMentor,
    
    AdminDashboard: AdminDashboard,
    
    CombinedDashboard: CombinedDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/MenteeProfile" element={<MenteeProfile />} />
                
                <Route path="/MentorProfile" element={<MentorProfile />} />
                
                <Route path="/Payment" element={<Payment />} />
                
                <Route path="/SelectMentor" element={<SelectMentor />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/ReportHours" element={<ReportHours />} />
                
                <Route path="/MenteeDashboard" element={<MenteeDashboard />} />
                
                <Route path="/MentorDashboard" element={<MentorDashboard />} />
                
                <Route path="/BookSession" element={<BookSession />} />
                
                <Route path="/ApproveSessionsMentor" element={<ApproveSessionsMentor />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/CombinedDashboard" element={<CombinedDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}