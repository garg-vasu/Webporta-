import { useRequests } from "@/Providers/RequestsContext";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LucideIcon,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  Plus,
  Filter,
  CodeSquare,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
const BASE_URL = "https://nfaapp.dockerserver.online";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { request } from "http";

export default function SeachNfa() {
  const [startLoading, setStartLoading] = useState(false);
  const [userId, setUserId] = useState();
  const { requests, loading, fetchRequests } = useRequests();
  const [sortOption, setSortOption] = useState("Date Created");
  const [showAdvancedSearchModal, setShowAdvancedSearchModal] = useState(false);
  // High-level filters
  const [selectedFilters, setSelectedFilters] = useState({
    project: false,
    department: false,
    priority: false,
    hasAttachment: false,
  });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedTowers, setSelectedTowers] = useState([]);

  // Department & Priority
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  // Example lists
  const PROJECTS = [
    "Garden Isles",
    "Casa Isles",
    "Krescent Homes",
    "Kosmos",
    "Kube",
  ];
  /* prettier-ignore */
  const TOWERS_MAPPING: Record<string, string[]> = {
    "Garden Isles": ["Tower A", "Tower B"],
    "Casa Isles": ["Tower A", "Tower B", "Tower C", "Tower D"],
    "Krescent Homes": ["Tower A", "Tower B", "Tower C", "Tower D"],
    "Kosmos": ["Tower A", "Tower B", "Tower C", "Tower D"],
    "Kube": ["Tower A", "Tower B", "Tower C", "Tower D"],
  };

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const DEPARTMENTS = [
    "Civil",
    "Finance",
    "Marketing",
    "CRM",
    "Purchase",
    "HR",
    "Safety",
    "Quality",
    "Contracts",
    "Billing",
    "Legal",
  ];
  const PRIORITIES = ["High", "Medium", "Low"];

  const fetchUserDetails = async () => {
    setStartLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: token },
      });
      if (response.data?.id) {
        setUserId(response.data.id);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setStartLoading(false);
    }
  };
  //   filtering
  const applyAdvancedSearchFilters = (list) => {
    let filtered = [...list];
    // project and tower
    if (selectedFilters.project) {
      if (selectedProjects.length > 0) {
        filtered = filtered.filter((r) => selectedProjects.includes(r.project));
      }
      if (selectedTowers.length > 0) {
        filtered = filtered.filter((r) => selectedTowers.includes(r.tower));
      }
    }

    // Department
    if (selectedFilters.department && selectedDepartments.length > 0) {
      filtered = filtered.filter((r) =>
        selectedDepartments.includes(r.department)
      );
    }

    // Priority
    if (selectedFilters.priority && selectedPriorities.length > 0) {
      filtered = filtered.filter((r) =>
        selectedPriorities.includes(r.priority)
      );
    }

    // Has Attachment
    if (selectedFilters.hasAttachment) {
      filtered = filtered.filter((r) => r.files && r.files.length > 0);
    }

    return filtered;
  };

  useEffect(() => {
    fetchUserDetails();
    fetchRequests();
  }, []);

  //   sorting
  const sortRequests = (list) => {
    const sorted = [...list];
    if (sortOption === "Last Updated") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA;
      });
    } else if (sortOption === "Initiator") {
      sorted.sort((a, b) =>
        (a.initiator_name || "").localeCompare(b.initiator_name || "")
      );
    } else {
      // Default: Date Created
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });
    }
    return sorted;
  };

  // Final list
  console.log("all request");
  console.log(userId);
  console.log(requests);
  const filteredRequests = requests.filter(
    (request) => request.initiator_id === userId
  );
  console.log("after filter");
  console.log(filteredRequests);

  const finalRequests = sortRequests(applyAdvancedSearchFilters(requests));
  // const finalRequests = sortRequests(
  //   applyAdvancedSearchFilters(requests)
  // ).filter((request) => request.initiator_id === userId);

  // list render segment
  const getStatusIcon = (status) => {
    const s = status.toUpperCase();
    if (s.includes("APPROVED")) return { Icon: CheckCircle, color: "green" };
    if (s === "REJECTED") return { Icon: XCircle, color: "red" };
    if (["IN_PROGRESS", "NEW", "PENDING"].includes(s))
      return { Icon: Clock, color: "#FBC02D" };
    return { Icon: HelpCircle, color: "gray" };
  };

  const renderRequestItem = (item) => {
    const { Icon: IconName, color: iconColor } = getStatusIcon(item.status);
    const shortSubject =
      item.subject && item.subject.length > 35
        ? item.subject.substring(0, 35) + "..."
        : item.subject || "NA";

    const STATUS_COLORS = {
      PENDING: "border-yellow-500 bg-yellow-50",
      APPROVED: "border-green-500 bg-green-50",
      REJECTED: "border-red-500 bg-red-50",
      NEW: "border-orange-400 bg-orange-50",
    };

    const PIOR_COLORS = {
      HIGH: "bg-red-600",
      MEDIUM: "bg-yellow-600",
      LOW: "bg-green-600",
    };

    return (
      <button
        key={item.id}
        className={`w-full border-l-4 px-4 py-2 mb-4 bg-white shadow-md rounded-lg hover:bg-gray-100 transition 
          ${STATUS_COLORS[item.status?.toUpperCase()] || "border-gray-300"} `}
        onClick={(e) => {
          e.preventDefault();
          navigate(`/nfa/${item.id}`);
        }}
      >
        <div className="flex flex-col  ">
          <div className="flex justify-between items-center mb-1">
            <div className="flex flex-col items-start">
              <div className="flex gap-2 items-center justify-center  ">
                <h2 className="text-lg text-blue-800 truncate capitalize">
                  {shortSubject}
                </h2>
                <div
                  className={` ${
                    PIOR_COLORS[item.priority?.toUpperCase()] || "text-blue-900"
                  } px-3 py-0.5 rounded-full text-white capitalize text-sm `}
                >
                  {item.priority}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {item.status.toUpperCase()}
              </span>
              <IconName size={22} color={iconColor} />
            </div>
          </div>

          <div className="flex gap-2">
            <p className="text-sm text-gray-600 text-start">
              <strong>Initiator:</strong> {item.initiator_name}
            </p>
            <p className="text-sm text-gray-600 text-start">
              <strong>Initation Date:</strong> {item.created_at}
            </p>
          </div>
          <div className="flex ">
            <p className="text-sm text-gray-600 text-start">
              <p className="font-bold">
                Approvers:
                {/* ({item.approval_hierarchy.length}) */}
              </p>
              {item.approval_hierarchy
                ?.map((ap) => ap.name)
                .filter(Boolean)
                .join(", ") || "NA"}
            </p>
          </div>
        </div>
      </button>
    );
  };

  //   check box component from shadcn

  // toggle filter
  const toggleFilter = (key) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayValue = (value, array, setArray) => {
    if (array.includes(value)) {
      setArray(array.filter((v) => v !== value));
    } else {
      setArray([...array, value]);
    }
  };

  //   section for advanced search model
  const renderAdvancedSearchModel = () => (
    <div className="w-full h-full flex-col flex ">
      {/* project and tower */}
      <div className="flex gap-1  items-center justify-start">
        <Checkbox
          checked={selectedFilters.project}
          className="w-4  h-4"
          onCheckedChange={() => {
            toggleFilter("project");
            if (selectedFilters.project) {
              setSelectedProjects([]);
              setSelectedTowers([]);
            }
          }}
        />
        <label className="text-stone-600  text-lg">
          Filter by Project and Tower
        </label>
      </div>
      <div className="flex w-full h-full mt-1">
        {selectedFilters.project && (
          <div className="flex w-full justify-between gap-4">
            {/* Project Selection */}
            <div className="flex-1">
              <p className="text-blue-500 font-semibold text-md">
                Select Project
              </p>
              {PROJECTS.map((proj) => (
                <div key={proj} className="flex items-center gap-1 ml-2">
                  <Checkbox
                    className="w-4 h-4"
                    checked={selectedProjects.includes(proj)}
                    onCheckedChange={() => {
                      toggleArrayValue(
                        proj,
                        selectedProjects,
                        setSelectedProjects
                      );
                    }}
                  />
                  <label>{proj}</label>
                </div>
              ))}
            </div>

            {/* Tower Selection (Justified to the right) */}
            {selectedProjects.length > 0 && (
              <div className="flex-1">
                <p className="text-blue-500 font-semibold text-md">
                  Select Tower
                </p>
                {selectedProjects.map((proj) => {
                  const towersForProj = TOWERS_MAPPING[proj] || [];
                  return (
                    <div key={proj + "_towers"}>
                      <p className="font-semibold">{proj} Towers:</p>
                      <div className="flex flex-col gap-1">
                        {towersForProj.map((tw) => (
                          <div
                            key={tw}
                            className="flex items-center gap-1 ml-2"
                          >
                            <Checkbox
                              checked={selectedTowers.includes(tw)}
                              onCheckedChange={() =>
                                toggleArrayValue(
                                  tw,
                                  selectedTowers,
                                  setSelectedTowers
                                )
                              }
                            />
                            <label>{tw}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* department */}
      <div className="flex gap-1 mt-1  items-center justify-start">
        <Checkbox
          checked={selectedFilters.department}
          className="w-4  h-4"
          onCheckedChange={() => {
            toggleFilter("department");
            if (selectedFilters.department) {
              setSelectedDepartments([]);
            }
          }}
        />
        <label className="text-stone-600 text-lg">Filter by Department</label>
      </div>
      {selectedFilters.department && (
        <div className="mt-2">
          <p className="text-blue-500 font-semibold text-md">
            Select Department
          </p>
          <div className="grid grid-cols-2 gap-2 ml-2">
            {DEPARTMENTS.map((dept) => (
              <div key={dept} className="flex items-center gap-1">
                <Checkbox
                  checked={selectedDepartments.includes(dept)}
                  onCheckedChange={() => {
                    toggleArrayValue(
                      dept,
                      selectedDepartments,
                      setSelectedDepartments
                    );
                  }}
                />
                <label>{dept}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* priority  */}
      <div className="flex gap-1 mt-1  items-center justify-start">
        <Checkbox
          checked={selectedFilters.priority}
          className="w-4  h-4"
          onCheckedChange={() => {
            toggleFilter("priority");
            if (selectedFilters.priority) {
              setSelectedPriorities([]);
            }
          }}
        />
        <label className="text-stone-600 text-lg">Filter by Priority</label>
      </div>
      {selectedFilters.priority && (
        <div className="mt-2">
          <p className="text-blue-500 font-semibold text-md">Select Priority</p>
          {PRIORITIES.map((p) => (
            <div className="flex items-center gap-1 ml-2">
              <Checkbox
                key={p}
                checked={selectedPriorities.includes(p)}
                onCheckedChange={() => {
                  toggleArrayValue(
                    p,
                    selectedPriorities,
                    setSelectedPriorities
                  );
                }}
              />
              <label>{p}</label>
            </div>
          ))}
        </div>
      )}

      {/* Attachment */}
      <div className="flex gap-1 mt-1  items-center justify-start">
        <Checkbox
          checked={selectedFilters.hasAttachment}
          className="w-4  h-4"
          onCheckedChange={() => {
            toggleFilter("hasAttachment");
          }}
        />
        <label className="text-stone-600 text-lg">Has Attachment</label>
      </div>

      {/* action Button  */}
    </div>
  );

  const [isOpen, setIsOpen] = useState(false);

  //   main ui
  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">My NFA</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              className="flex gap-2 px-2 py-1"
              onClick={() => setIsOpen(true)}
            >
              <Filter />
              Filters
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Filter NFA</DialogTitle>
              <DialogDescription>
                Filter on Different Parameters
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Section */}
            <div className="w-full max-h-[50vh] overflow-y-auto p-2">
              {renderAdvancedSearchModel()}
            </div>

            {/* Footer */}
            <DialogFooter>
              <div className="flex justify-end gap-4 items-center">
                <Button type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setIsOpen(false)}>
                  Apply
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {finalRequests.length === 0 ? (
          <p>No NFAs found with the current filters.</p>
        ) : (
          finalRequests.map((r) => renderRequestItem(r))
        )}
      </div>
    </div>
  );
}
