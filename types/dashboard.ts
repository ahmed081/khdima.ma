// -------------------------
// JOB TYPES
// -------------------------
export interface EmployerJob {
    id: number;
    title: string;
    status: "ACTIVE" | "PENDING_REVIEW" | "DELETED";
    applicants: number;
    views: number;
    postedAt: string; // already formatted string
}

// -------------------------
// APPLICANT TYPES
// -------------------------
export interface Applicant {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string;
    position?: string;
    appliedAt: string;
    status: "new" | "reviewed";
}

// -------------------------
// DASHBOARD STATS
// -------------------------
export interface EmployerDashboardStats {
    activeOffers: number;
    deletedOffers: number;
    pendingOffers: number;
    totalApplications: number;
    totalViews: number;
}

// -------------------------
// API RESPONSE
// -------------------------
export interface EmployerDashboardResponse {
    stats: EmployerDashboardStats;
    offers: EmployerJob[];
    applicants: Applicant[];
}
