import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from './routes';

import HomeScreen from '../screens/HomeScreen';
import PlanLayout from '../screens/plans/PlanLayout';
import PlanItinerariesScreen from '../screens/plans/PlanItinerariesScreen';
import StepCreateScreen from '../screens/step/StepCreateScreen';
import StepDetailsScreen from '../screens/step/StepDetailsScreen';
import StepEditScreen from '../screens/step/StepEditScreen';
import TimeScreen from '../screens/time/TimeScreen';
import RouteScreen from '../screens/route/RouteScreen';
import RouteDetailsScreen from '../screens/route/RouteDetailsScreen';
import GroupScreen from '../screens/group/GroupScreen';
import ParticipantScreen from '../screens/participant/ParticipantScreen';
import LocationScreen from '../screens/location/LocationScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const AppRouter = () => {
    return (
        <Routes>
            <Route path={ROUTES.HOME} element={<HomeScreen />} />
            <Route path={ROUTES.PLAN} element={<PlanLayout />}>
                <Route index element={<Navigate to="itineraries" replace />} />
                <Route path="itineraries" element={<PlanItinerariesScreen />} />
                <Route path="itineraries/:itineraryId/steps/create" element={<StepCreateScreen />} />
                <Route path="itineraries/:itineraryId/steps/:stepId" element={<StepDetailsScreen />} />
                <Route path="itineraries/:itineraryId/steps/:stepId/edit" element={<StepEditScreen />} />
                <Route path="times" element={<TimeScreen />} />
                <Route path="routes" element={<RouteScreen />} />
                <Route path="routes/:routeId" element={<RouteDetailsScreen />} />
                <Route path="groups" element={<GroupScreen />} />
                <Route path="participants" element={<ParticipantScreen />} />
                <Route path="locations" element={<LocationScreen />} />
            </Route>
            <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
            <Route path={ROUTES.REGISTER} element={<RegisterScreen />} />
            <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
    );
};

export default AppRouter;
