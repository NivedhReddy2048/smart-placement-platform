"use client";

import ProtectedRoute from "./auth/ProtectedRoute";

/**
 * Root ProtectedRoute that delegates to the specialized auth version.
 * This version includes path-aware logic to skip redirects on public routes.
 */
export default ProtectedRoute;
