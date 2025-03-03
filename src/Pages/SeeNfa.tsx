import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRequests } from "@/Providers/RequestsContext"; // or your context location

const BASE_URL = "https://running-corrine-studenttt702-a4e108db.koyeb.app"; 

export default function SeeNfa() {
  const { noteid } = useParams<{ noteid: string }>(); 
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const [userId, setUserId] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [comment, setComment] = useState("");

  // From your context (or fetch individually if you prefer)
  const { requests, loading } = useRequests(); 
  const nfa = requests.find((r) => r.id === Number(noteid));

  // Fetch the current user’s ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/users/me`, {
          headers: { Authorization: token },
        });
        if (response.data?.id) {
          setUserId(response.data.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserDetails();
  }, [token]);

  // Example method to format date
  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  let userRole = "";
  if (nfa?.supervisor_id === userId) {
    userRole = "RECOMMENDOR";
  } else if (nfa?.approvers.includes(userId)) {
    userRole = "APPROVER";
  }

  let canAct = false;
  if (userRole === "RECOMMENDOR" && nfa?.status === "NEW") {
    canAct = true;
  } else if (userRole === "APPROVER" && nfa?.status === "IN_PROGRESS") {
    if (nfa?.current_approver_index < nfa?.approvers.length) {
      const pendingApproverId = nfa.approvers[nfa.current_approver_index];
      canAct = pendingApproverId === userId;
    }
  }

  const handleOpenPDF = async () => {
    if (!nfa?.status?.toUpperCase().includes("APPROVED")) {
      alert("Request not approved yet");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/requests/${noteid}/pdf`, {
        headers: { Authorization: token },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Open PDF error:", error);
      alert("Unable to open PDF");
    }
  };

  const handleAction = async (approved: boolean) => {
    setPageLoading(true);
    try {
      const payload = {
        request_id: noteid,
        approved,
        comment,
      };
      if (userRole === "RECOMMENDOR") {
        await axios.post(`${BASE_URL}/requests/supervisor-review`, payload, {
          headers: { Authorization: token },
        });
      } else {
        await axios.post(`${BASE_URL}/requests/approve`, payload, {
          headers: { Authorization: token },
        });
      }
      alert("Action completed");
      setComment("");
      navigate("/dashboard");
    } catch (err) {
      console.error("Approval error:", err);
      alert("Action failed");
    } finally {
      setPageLoading(false);
    }
  };

  // Click “Edit NFA”
  const handleEditRequest = () => {
    // Navigate to edit mode
    navigate(`/editnfa/${noteid}`);
  };

  const handleReinitiate = () => {
    // e.g., same approach:
    navigate(`/editnfa/${noteid}`);
  };

  const handleWithdraw = async () => {
    try {
      setPageLoading(true);
      await axios.delete(`${BASE_URL}/requests/${noteid}/withdraw`, {
        headers: { Authorization: token },
      });
      alert("NFA withdrawn successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Withdrawal failed");
    } finally {
      setPageLoading(false);
    }
  };

  if (!nfa) {
    return <div className="text-red-500">NFA not found.</div>;
  }

  return (
    <div className="pb-8 mb-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">NFA Detail</h2>
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>Basic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "NFA No.", value: nfa.id },
              { label: "Initiator", value: nfa.initiator_name },
              { label: "Subject", value: nfa.subject },
              { label: "Description", value: nfa.description },
              { label: "Area", value: nfa.area },
              { label: "Project", value: nfa.project },
              { label: "Tower", value: nfa.tower },
              { label: "Department", value: nfa.department },
              { label: "Priority", value: nfa.priority },
              { label: "References", value: nfa.references },
              { label: "Status", value: nfa.status },
            ].map(({ label, value }, idx) => (
              <div key={idx} className="flex justify-between border-b pb-2">
                <span className="font-medium">{label}:</span>
                <span>{value || "N/A"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Hierarchy */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Approval Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {nfa.approval_hierarchy?.length ? (
              nfa.approval_hierarchy.map((act: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="border border-gray-200 rounded-xl p-3 shadow-sm bg-white flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-semibold capitalize">
                      {act.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {act.role === "Supervisor" ? "Recommender" : act.role}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Received: {formatDate(act.received_at)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Action: {formatDate(act.action_time)}
                    </p>
                    {act.comment && (
                      <p className="text-sm text-gray-600 mt-1">
                        "{act.comment}"
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status:</p>
                    <p
                      className={`text-md font-medium ${
                        act.approved === "Approved"
                          ? "text-green-600"
                          : act.approved === "Rejected"
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {act.approved || "N/A"}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No approval data available.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      {nfa.files && nfa.files.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            {nfa.files.map((file: any, idx: number) => (
              <a
                key={idx}
                href={
                  file.file_url.startsWith("http")
                    ? file.file_url
                    : `${BASE_URL}${file.file_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block"
              >
                View: {file.file_display_name || file.file_url}
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-4 items-center justify-end">
        {nfa.status?.toUpperCase().includes("APPROVED") && (
          <Button onClick={handleOpenPDF}>Download PDF</Button>
        )}

        {/* If REJECTED, user can "Re-initiate" - goes to edit screen */}
        {nfa.status === "REJECTED" && userId === nfa.initiator_id && (
          <Button onClick={handleReinitiate}>Re-initiate Request</Button>
        )}

        {/* If it's still NEW, the initiator can Edit or Withdraw */}
        {nfa.status === "NEW" && userId === nfa.initiator_id && (
          <>
            <Button onClick={handleEditRequest}>Edit NFA</Button>
            <Button variant="destructive" onClick={handleWithdraw}>
              Withdraw NFA
            </Button>
          </>
        )}

        {/* If you can act (recommend or approve), show approve/reject with a comment box */}
        {canAct && (
          <div className="flex flex-col items-end gap-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment"
              className="border border-gray-300 rounded p-1 text-sm w-60"
            />
            <div className="flex gap-2">
              <Button onClick={() => handleAction(true)}>Approve</Button>
              <Button variant="destructive" onClick={() => handleAction(false)}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
