import { useRequests } from "@/Providers/RequestsContext";
import axios from "axios";
import { CheckCircle, XCircle, Clock, HelpCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://running-corrine-studenttt702-a4e108db.koyeb.app";

export default function ApprovalScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const { requests, loading, fetchRequests } = useRequests();
  const [approvalTab, setApprovalTab] = useState("All");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/users/me`, {
          headers: { Authorization: token },
        });
        setUserId(response.data.id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [token]);

  const myApprovalRequests = requests.filter(
    (r) =>
      r.supervisor_id === Number(userId) ||
      r.approvers?.includes(Number(userId))
  );

  const sortRequestsDesc = (arr) =>
    [...arr].sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at) -
        new Date(a.updated_at || a.created_at)
    );

  const filteredByTab = (list) => {
    switch (approvalTab.toUpperCase()) {
      case "PENDING":
        return list.filter(
          (r) =>
            (r.status.toUpperCase() === "NEW" &&
              r.supervisor_id === Number(userId)) ||
            (r.status.toUpperCase() === "IN_PROGRESS" &&
              r.approvers?.[r.current_approver_index] === Number(userId))
        );
      case "APPROVED":
        return list.filter(
          (r) =>
            (r.supervisor_id === Number(userId) && r.supervisor_approved) ||
            r.approver_actions?.some(
              (a) =>
                a.approver_id === Number(userId) &&
                a.approved?.toUpperCase() === "APPROVED"
            )
        );
      case "REJECTED":
        return list.filter((r) => r.status.toUpperCase() === "REJECTED");
      default:
        return list;
    }
  };

  const finalRequests = sortRequestsDesc(filteredByTab(myApprovalRequests));

  const canUserAct = (r) =>
    (r.status.toUpperCase() === "NEW" && r.supervisor_id === Number(userId)) ||
    (r.status.toUpperCase() === "IN_PROGRESS" &&
      r.approvers?.[r.current_approver_index] === Number(userId));

  const getStatusIcon = (status) => {
    const icons = {
      APPROVED: { Icon: CheckCircle, color: "green" },
      REJECTED: { Icon: XCircle, color: "red" },
      IN_PROGRESS: { Icon: Clock, color: "#FBC02D" },
      NEW: { Icon: Clock, color: "#FBC02D" },
      PENDING: { Icon: Clock, color: "#FBC02D" },
    };
    return icons[status.toUpperCase()] || { Icon: HelpCircle, color: "gray" };
  };

  const handleApprovalAction = async (item, approved) => {
    setIsLoading(true);
    try {
      const payload = { request_id: item.id, approved, comment: "" };
      const endpoint =
        item.supervisor_id === Number(userId)
          ? "/requests/supervisor-review"
          : "/requests/approve";
      await axios.post(`${BASE_URL}${endpoint}`, payload, {
        headers: { Authorization: token },
      });
      alert("Action completed");
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setIsLoading(false);
      fetchRequests();
    }
  };

  if (isLoading && loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="animate-spin" size={50} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Approvals</h2>
      <div className="flex gap-4 mb-4">
        {["All", "Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              approvalTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setApprovalTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>
        {finalRequests.length === 0 ? (
          <p>No {approvalTab} approvals found.</p>
        ) : (
          finalRequests.map((r) => {
            const { Icon, color } = getStatusIcon(r.status);
            return (
              <div
                key={r.id}
                className="border p-4 mb-2 rounded cursor-pointer"
                onClick={() => navigate(`/nfa/${r.id}`)}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {r.status.toUpperCase()}
                  </h2>
                  <Icon size={22} color={color} />
                </div>
                <p className="text-sm">
                  {r.subject?.length > 35
                    ? r.subject.substring(0, 35) + "..."
                    : r.subject || "NA"}
                </p>
                <p className="text-sm text-gray-500">
                  Initiator: {r.initiator_name}
                </p>
                <p className="text-sm text-gray-500">
                  Supervisor: {r.supervisor_name}
                </p>
                {approvalTab === "Pending" && canUserAct(r) && (
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents parent onClick from triggering
                        handleApprovalAction(r, false);
                      }}
                    >
                      {r.supervisor_id === Number(userId)
                        ? "Initiate"
                        : "Approve"}
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents parent onClick from triggering
                        handleApprovalAction(r, false);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
