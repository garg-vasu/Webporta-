import { useRequests } from "@/Providers/RequestsContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  PENDING: "border-yellow-500 bg-yellow-50",
  APPROVED: "border-green-500 bg-green-50",
  REJECTED: "border-red-500 bg-red-50",
  NEW: "border-orange-400 bg-orange-50",
};

const STAGE_COLORS = {
  PENDING: "text-yellow-600",
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
  NEW: "text-orange-600",
};
const PIOR_COLORS = {
  HIGH: "text-red-600",
  MEDIUM: "text-yellow-600",
  LOW: "text-green-600",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Invalid Date";
  const [day, month, year, time] = dateStr.split(/[-\s:]/);
  const formattedDate = new Date(`${year}-${month}-${day}T${time}:00`);
  if (isNaN(formattedDate)) return "Invalid Date";
  return formattedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function DashboardContent() {
  const { requests, loading, fetchRequests } = useRequests();
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  const getFilteredRequests = () => {
    if (filter === "ALL") return requests;
    return requests.filter((req) =>
      ["NEW", "IN_PROGRESS", "PENDING"].includes(req.status?.toUpperCase())
        ? filter === "PENDING"
        : req.status?.toUpperCase() === filter
    );
  };

  const handlenavigate = () => {
    navigate("/mynfa");
    fetchRequests();
  };
  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Dashboard</h2>

      <div className="flex justify-between items-center">
        <div className="flex justify-center gap-2 mb-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              className={`px-6 py-1 rounded-lg font-medium shadow-md transition-all duration-300 
              ${
                filter === status
                  ? "bg-blue-400 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <button
          className="flex gap-2 text-blue-400 hover:text-blue-600 cursor-pointer items-center justify-center"
          onClick={handlenavigate}
        >
          <Send className="w-5 h-5" /> See More
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="mt-4 mb-8 pb-12 grid gap-6">
          {getFilteredRequests().map((req) => (
            <motion.div
              key={req.id}
              onClick={() => {
                navigate(`/nfa/${req.id}`);
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-l-4 cursor-pointer py-2 px-4 rounded-lg shadow-lg bg-white ${
                STATUS_COLORS[req.status?.toUpperCase()] || "border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-900 capitalize">
                  {req.subject}
                </h3>
                <p
                  className={`text-md font-semibold animate-bounce ${
                    STAGE_COLORS[req.status?.toUpperCase()] || "text-gray-600"
                  }`}
                >
                  {req.status}
                </p>
              </div>
              <p
                className={`text-md font-semibold mt-1 ${
                  PIOR_COLORS[req.priority?.toUpperCase()] || "text-blue-900"
                }`}
              >
                {req.priority} Priority
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Date: {formatDate(req.created_at)}
              </p>
              {/* <p className="text-sm text-gray-600">
                Department: {req.department}
              </p> */}
              <p className="text-sm capitalize text-gray-700">
                Initiated By: {req.initiator_name}
              </p>
              {req.files.length > 0 && (
                <div className="mt-1">
                  <p className="text-sm font-semibold text-gray-700">
                    Attachments ({req.files.length})
                  </p>
                  {req.files.map((file, index) => (
                    <a
                      key={index}
                      href={file.file_url}
                      target="_blank"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {file.file_display_name}
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
