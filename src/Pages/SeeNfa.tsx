import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ApprovalData, useRequests } from "@/Providers/RequestsContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
const BASE_URL = "https://running-corrine-studenttt702-a4e108db.koyeb.app"; // Replace with actual API URL
export default function SeeNfa() {
  const { noteid } = useParams<{ projectId: string }>();

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const [comment, setComment] = useState("");
  const { requests, loading } = useRequests(); // Get data from context
  const nfa = requests.find((request) => request.id === Number(noteid));

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short", // 3-letter month (e.g., Mar, Aug)
    });
  };
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: token },
      });
      console.log("userid from api");
      console.log(response.data.id);
      if (response.data.id) {
        setUserId(response.data.id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

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

      window.open(url, "_blank"); // Opens the PDF in a new tab

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Open PDF error:", error);
      alert("Unable to open PDF");
    }
  };

  const handleAction = async (approved) => {
    setTimeout(async () => {
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
        navigate("Dashboard");
      } catch (err) {
        console.error("Approval error:", err);
        alert("Action failed");
      } finally {
        setPageLoading(false);
      }
    }, 100);
  };

  const handleReinitiate = () => {
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
      alert("Withdrawal failed");
    } finally {
      setPageLoading(false);
    }
  };

  const handleEditRequest = () => {
    navigate(`/editnfa/${noteid}`);
  };

  return (
    <div className="pb-8 mb-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">NFA Detail</h2>
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>Basic OverView</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "NFA No.", value: nfa?.id },
              { label: "Initiator", value: nfa?.initiator_name },
              { label: "Subject", value: nfa?.subject },
              { label: "Description", value: nfa?.description },
              { label: "Area", value: nfa?.area },
              { label: "Project", value: nfa?.project },
              { label: "Tower", value: nfa?.tower },
              { label: "Department", value: nfa?.department },
              { label: "Priority", value: nfa?.priority },
              { label: "References", value: nfa?.references },
              { label: "Status", value: nfa?.status },
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
            {nfa?.approval_hierarchy?.length ? (
              nfa.approval_hierarchy.map((act, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="border border-gray-200 rounded-xl p-3 shadow-sm bg-white flex justify-between items-center"
                >
                  {/* Left Section - Name & Role */}
                  <div>
                    <p className="text-lg font-semibold text-gray-800 capitalize">
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

                  {/* Right Section - Status */}
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
      {nfa?.files && nfa?.files?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            {nfa?.files.map((file, idx) => (
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

      {/* action Button  */}
      <div className="mt-4 flex justify-end gap-4 items-center">
        {nfa?.status.toUpperCase().includes("APPROVED") && (
          <Button onClick={handleOpenPDF}>Download Pdf</Button>
        )}
        {nfa?.status === "REJECTED" && userId === nfa?.initiator_id && (
          <Button onClick={handleReinitiate}>Re-initiate Request</Button>
        )}
        {nfa?.status === "NEW" && userId === nfa?.initiator_id && (
          <div className="flex items-center justify-between gap-2 ">
            <Button onClick={handleEditRequest}>Edit NFA</Button>
            <Button onClick={handleWithdraw}>Withdraw NFA</Button>
          </div>
        )}

        {canAct ? (
          <>
            <div className="flex items-center justify-between gap-2 ">
              <Button onClick={() => handleAction(true)}>
                {userRole === "RECOMMENDOR" ? "Initiate NFA" : "Approve"}
              </Button>
              <Button
                onClick={() => handleAction(false)}
                className="bf-red-500 text-white"
              >
                Reject
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-stone-400 text-sm">
              Already acted ont the request
            </p>
          </>
        )}
      </div>
    </div>
  );
}
