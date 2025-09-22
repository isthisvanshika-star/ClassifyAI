"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PremiumUser } from "@/lib/types";
import PremiumCancelModal from "../ui/PremiumCancelModal";
import { showSuccessMessage } from "@/lib/helper";

import { motion, AnimatePresence } from "framer-motion";

const PremiumUsersTable = ({
  users,
  onRefresh,
}: {
  users: PremiumUser[];
  onRefresh: () => void;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PremiumUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [action, setAction] = useState<"cancel" | "downgrade" | null>(null);

  const handleConfirm = async (reason: string) => {
    if (!selectedUser || !action) return;
    setLoading(true);
    try {
      const endpoint =
        action === "cancel"
          ? `/api/admin/remove-premium`
          : `/api/admin/downgrade-premium`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showSuccessMessage(
          action === "cancel" ? "Premium removed" : "Premium downgraded"
        );
        onRefresh();
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
      setSelectedUser(null);
      setAction(null);
      setLoading(false);
    }
  };

  return (
    <div className="px-6">
      <div className="rounded-xl shadow overflow-hidden">
        <div className="relative">
          <table className="min-w-full bg-orange-50/5 text-sm text-orange-50">
            <thead className="bg-orange-800/50 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 w-[120px]">Name</th>
                <th className="px-4 py-2 w-[180px]">Email</th>
                <th className="px-4 py-2 w-[100px]">Plan</th>
                <th className="px-4 py-2 w-[120px]">Start Date</th>
                <th className="px-4 py-2 w-[120px]">End Date</th>
                <th className="px-4 py-2 w-[100px]">Status</th>
                <th className="px-4 py-2 w-[180px]">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="h-[250px] overflow-y-auto scrollbar-hide scroll-smooth">
            <table className="min-w-full bg-orange-50/5 text-sm text-orange-50">
              <tbody>
                <AnimatePresence>
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-orange-700/50 hover:bg-orange-900/20"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-center truncate w-[120px]">
                        {user.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center truncate w-[180px]">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 text-center w-[100px]">
                        <Badge
                          variant={
                            user.plan === "ULTIMATE" ? "destructive" : "default"
                          }
                        >
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center w-[120px]">
                        {new Date(user.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-center w-[120px]">
                        {new Date(user.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-center w-[100px]">
                        <Badge
                          variant={
                            user.status === "ACTIVE" ? "default" : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center space-x-2 w-[180px]">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedUser(user);
                            setAction("downgrade");
                            setShowModal(true);
                          }}
                        >
                          Downgrade
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setAction("cancel");
                            setShowModal(true);
                          }}
                        >
                          Cancel
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <PremiumCancelModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setAction(null);
              setSelectedUser(null);
            }}
            loading={loading}
            onConfirm={handleConfirm}
            message={`Are you sure you want to ${
              action === "cancel" ? "cancel" : "downgrade"
            } premium for ${selectedUser?.name}?`}
          />

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-900 to-transparent z-20"></div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUsersTable;
