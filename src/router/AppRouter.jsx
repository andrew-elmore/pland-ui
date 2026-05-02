import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from './routes';

import HomeScreen from '../screens/HomeScreen';
import PlanLayout from '../screens/plans/PlanLayout';
import PlanItinerariesScreen from '../screens/plans/PlanItinerariesScreen';
import PlanParticipantsScreen from '../screens/plans/PlanParticipantsScreen';
import PlanLocationsScreen from '../screens/plans/PlanLocationsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const AppRouter = () => {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<HomeScreen />} />
            <Route path={ROUTES.PLAN} element={<PlanLayout />}>
                <Route index element={<Navigate to="itineraries" replace />} />
                <Route path="itineraries" element={<PlanItinerariesScreen />} />
                <Route path="participants" element={<PlanParticipantsScreen />} />
                <Route path="locations" element={<PlanLocationsScreen />} />
            </Route>
            <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
            <Route path={ROUTES.REGISTER} element={<RegisterScreen />} />
            <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
    );
};

export default AppRouter;
