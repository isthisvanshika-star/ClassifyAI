"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tektur } from "next/font/google";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
interface Activity {
  id: string;
  user: {
    name: string;
    role: string;
  };
  action: string;
  timestamp: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const campusId = localStorage.getItem("CampusID");
        const res = await fetch(`/api/assistant/recent-activity?campusId=${campusId}`);
        const data = await res.json();
        if (data.success) {
          setActivities(data.activities);
        } else {
          setError(data.error || "Failed to fetch recent activities.");
        }
      } catch (err) {
        setError("Error fetching recent activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading recent activities…</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (activities.length === 0) {
    return <p className="text-gray-400">No recent activities found.</p>;
  }

  return (
    <div className="scrollbar-hide">
      <h3 className={`text-lg font-semibold text-orange-700 mb-4 ${tektur.className}`}>Recent Activity</h3>
      <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
        {activities.map((activity, idx) => (
          <motion.li
            key={activity.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-200"
          >
            <span className="font-medium text-orange-600">
              {activity.user.name} ({activity.user.role}):
            </span>{" "}
            {activity.action}
            <div className="text-xs text-gray-400">
              {new Date(activity.timestamp).toLocaleString()}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
