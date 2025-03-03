import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://running-corrine-studenttt702-a4e108db.koyeb.app"; // Replace with actual API URL

export type ApprovalHierarchy = {
  role: string;
  user_id: number;
  name: string;
  approved: string;
  received_at: string;
  action_time: string;
  comment: string;
};

export type ApproverAction = {
  approver_id: number;
  approved: string;
  action_time: string;
  received_at: string;
  comment: string;
};

export type FileDetails = {
  file_url: string;
  file_display_name: string;
};

export type ApprovalData = {
  id: number;
  initiator_id: number;
  supervisor_id: number;
  subject: string;
  description: string;
  area: string;
  project: string;
  tower: string;
  department: string;
  references: string;
  priority: string;
  approvers: number[];
  current_approver_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  last_action: string;
  supervisor_approved_at: string;
  initiator_name: string;
  supervisor_name: string;
  pending_at: string;
  approver_actions: ApproverAction[];
  approval_hierarchy: ApprovalHierarchy[];
  files: FileDetails[];
  file_url: string | null;
  file_display_name: string | null;
};

interface RequestsContextType {
  requests: ApprovalData[];
  loading: boolean;
  fetchRequests: () => Promise<void>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(
  undefined
);

export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState<ApprovalData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/requests/`, {
        headers: { Authorization: token },
      });
      const all: ApprovalData[] = response.data || [];

      const parseDate = (dateStr: string) => {
        const [day, month, yearAndTime] = dateStr.split("-");
        const [year, time] = yearAndTime.split(" ");
        return new Date(`${year}-${month}-${day}T${time}:00`);
      };

      const sorted = [...all].sort(
        (a, b) =>
          parseDate(b.created_at).getTime() - parseDate(a.created_at).getTime()
      );
      setRequests(sorted || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <RequestsContext.Provider value={{ requests, loading, fetchRequests }}>
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestsContext);
  if (!context) {
    throw new Error("useRequests must be used within a RequestsProvider");
  }
  return context;
};
