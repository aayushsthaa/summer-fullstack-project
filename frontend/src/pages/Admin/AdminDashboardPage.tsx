import axios from 'axios';
import { useEffect, useState } from 'react';
import ActionCard from '../../components/Admin/ActionCard';
import StatCard from '../../components/Admin/StatCard';
import DocumentTextIcon from '../../components/icons/DocumentTextIcon';
import PencilAltIcon from '../../components/icons/PencilAltIcon';
import PlusCircleIcon from '../../components/icons/PlusCircleIcon';
import UserGroupIcon from '../../components/icons/UserGroupIcon';

interface IStats {
  userCount: number;
  quizCount: number;
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<IStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const accessToken = localStorage.getItem("token");
      if (!accessToken) {
        setError("Authentication failed.");
        setIsLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        const statsRes = await axios.get("http://localhost:3000/api/admin/dashboard-stats", { headers });
        setStats(statsRes.data.stats);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-12">
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-white text-center">Admin Dashboard</h1>

        {error && <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-center">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard to="/admin/users" title="Total Users" value={stats?.userCount} isLoading={isLoading} icon={<UserGroupIcon />} />
          <StatCard to="/questionset/list" title="Total Assessments" value={stats?.quizCount} isLoading={isLoading} icon={<DocumentTextIcon />} />
          <ActionCard 
            to="/admin/users" 
            title="Manage Users" 
            description="View, search, and manage all user accounts." 
            icon={<PencilAltIcon />}
          />
          <ActionCard 
            to="/admin/questionset/create" 
            title="Create New Assessment" 
            description="Author and publish new assessments for learners." 
            icon={<PlusCircleIcon />}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;