import z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

export type UserSchema = {
  name: string;
  role: number[];
  email: string;
  id: number;
  username: string;
};

// Zod schema for form validation
const nfaSchema = z.object({
  description: z.string().min(2, "Description must be at least 1 character"),
  tower: z.string().min(1, "Tower must be at least 1 character"),
  department: z.string().min(1, "Department must be at least 1 character"),
  references: z.string().min(1, "References must be at least 1 character"),
  area: z.string().min(1, "Area must be at least 1 character"),
  subject: z.string().min(2, "Subject must be at least 1 character"),
  priority: z.string().min(1, "Priority must be at least 1 character"),
  supervisor_id: z.number().min(1, "Supervisor must be selected"),
  project: z.string().min(1, "Project must be at least 1 character"),
  approvers: z.array(z.number()).min(1, "At least one approver must be selected"),
  files: z.any(),
});

// Your base URL
const BASE_URL = "https://running-corrine-studenttt702-a4e108db.koyeb.app";

// Type for form fields after Zod validation
type FormFields = z.infer<typeof nfaSchema>;

export default function RaiseNFA() {
  // Check if we are in "edit" mode vs. "create" mode
  const { id } = useParams(); 
  const isEditMode = Boolean(id);

  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [values, setValues] = useState("");
  const [open, setOpen] = useState(false);
  const [isOtherDep, setIsOtherDep] = useState(false);
  const [userId, setUserId] = useState(0);
  const [AllUsers, setAllUsers] = useState<UserSchema[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [approverList, setApproverList] = useState<UserSchema[]>([]);
  const [selectedProject, setSelectedProject] = useState(""); 
  const [isOtherProject, setIsOtherProject] = useState(false);
  const [isOtherTower, setIsOtherTower] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Mappings for towers inside known projects
  const towersMapping: Record<string, string[]> = {
    "Garden Isles": ["Tower A", "Tower B"],
    "Casa Isles": ["Tower A", "Tower B", "Tower C", "Tower D"],
    "Krescent Homes": ["Tower A", "Tower B", "Tower C", "Tower D"],
    "Kosmos": ["Tower A", "Tower B", "Tower C", "Tower D"],
    "Kube": ["Tower A", "Tower B", "Tower C", "Tower D"],
  };

  const navigate = useNavigate();
  const token: string = localStorage.getItem("token") || "";

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(nfaSchema),
  });

  // For dynamic addition/removal of approvers
  const { fields, append, remove } = useFieldArray({
    control,
    name: "approvers",
  });
  const selectedApprovers = watch("approvers");

  // Retrieve the available set of potential approvers (role = 1, i.e. Admin) from AllUsers
  const getAvailableApprovers = (index: number) => {
    return approverList.filter(
      (approver) =>
        !selectedApprovers.includes(approver.id) ||
        selectedApprovers[index] === approver.id
    );
  };

  // File input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);
      setValue("files", filesArray); // store in form state
    }
  };

  // Fetch the current logged-in user details to get userId
  const fetchUserDetails = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Fetch all users, so we can choose supervisor and approvers
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/users/`, {
        headers: {
          Authorization: token,
        },
      });
      if (res.data) {
        // Exclude the current user (can't supervise or approve your own request)
        const excludeMe = res.data.filter((u: UserSchema) => u.id !== userId);
        setAllUsers(excludeMe);

        // Filter those with role=1 as possible approvers
        const onlyApprovers = excludeMe.filter(
          (u: UserSchema) => u.role && u.role.includes(1)
        );
        setApproverList(onlyApprovers);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // If "edit" mode, fetch existing NFA data to pre-populate the form
  const fetchExistingNfa = async (requestId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/requests/${requestId}`, {
        headers: { Authorization: token },
      });
      // 'existingData' is the server representation of the NFA
      const existingData = response.data;
      // Populate each field with default fallback values
      setValue("description", existingData.description || "");
      setValue("tower", existingData.tower || "");
      setValue("department", existingData.department || "");
      setValue("references", existingData.references || "");
      setValue("area", existingData.area || "");
      setValue("subject", existingData.subject || "");
      setValue("priority", existingData.priority || "");
      setValue("project", existingData.project || "");
      setValue("supervisor_id", existingData.supervisor_id || 0);
      // Approvers come as an array of user IDs
      setValue("approvers", existingData.approvers || []);
      // We'll set the files array to empty by default, since we normally do not re-upload existing files
      setValue("files", []);
  
      // For display in the supervisor combobox
      const chosenSupervisor = AllUsers.find(
        (u) => u.id === existingData.supervisor_id
      );
      if (chosenSupervisor) {
        setValues(chosenSupervisor.name);
      }
  
      // Handle “other” fields for area, department, etc.
      if (
        existingData.area &&
        !["Wish Town", "Mirzapur", "Aman", "Expressway", "Hafiz Contractor"].includes(
          existingData.area
        )
      ) {
        setIsOtherSelected(true);
      }
      if (
        existingData.department &&
        !["Civil", "Finances", "Marketin", "Safety", "HR", "Purchase"].includes(
          existingData.department
        )
      ) {
        setIsOtherDep(true);
      }
      if (
        existingData.project &&
        !Object.keys(towersMapping).includes(existingData.project)
      ) {
        setIsOtherProject(true);
      } else {
        setSelectedProject(existingData.project || "");
      }
      if (existingData.tower) {
        const knownTowers = towersMapping[existingData.project] || [];
        if (!knownTowers.includes(existingData.tower)) {
          setIsOtherTower(true);
        }
      }
    } catch (err) {
      console.error("Error fetching existing NFA:", err);
    } finally {
      setLoading(false);
    }
  };
  

  // Runs once on component mount to get user details
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Once userId is known, fetch all user data
  useEffect(() => {
    if (userId) {
      fetchAllUsers();
    }
  }, [userId]);

  // If editing, fetch existing NFA after we’ve fetched AllUsers (so we can set the supervisor name)
  useEffect(() => {
    if (isEditMode && userId && AllUsers.length > 0) {
      fetchExistingNfa(id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id, AllUsers]);

  // Utility to handle selection of an approver in the approach field array
  const handleSelectChange = (index: number, value: string) => {
    const approverId = Number(value);
    const updatedApprovers = [...selectedApprovers];
    updatedApprovers[index] = approverId;
    setValue("approvers", updatedApprovers);
    setOpenDropdown(null);
  };

  // Handle “area” dropdown vs. “Other”
  const handleAreaChange = (value: string) => {
    if (value === "Other") {
      setIsOtherSelected(true);
      setValue("area", ""); 
    } else {
      setIsOtherSelected(false);
      setValue("area", value);
    }
  };

  // Handle “department” dropdown vs. “Other”
  const handleDeptChange = (value: string) => {
    if (value === "Other") {
      setIsOtherDep(true);
      setValue("department", "");
    } else {
      setIsOtherDep(false);
      setValue("department", value);
    }
  };

  // Handle “project” selection vs. “Other”
  const handleProjectChange = (value: string) => {
    if (value === "Other") {
      setIsOtherProject(true);
      setValue("project", "");
      setSelectedProject("Other");
    } else {
      setIsOtherProject(false);
      setValue("project", value);
      setSelectedProject(value);
    }
  };

  // Tower logic
  const handleTowerChange = (value: string) => {
    if (value === "Other") {
      setIsOtherTower(true);
      setValue("tower", "");
    } else {
      setIsOtherTower(false);
      setValue("tower", value);
    }
  };

  // When user submits the form
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      // Build a FormData for file upload
      const formData = new FormData();
      formData.append("initiator_id", userId.toString());
      formData.append("supervisor_id", data.supervisor_id.toString());
      formData.append("subject", data.subject.trim());
      formData.append("description", data.description.trim());
      formData.append("area", data.area);
      formData.append("project", data.project);
      formData.append("tower", data.tower);
      formData.append("department", data.department);
      formData.append("references", data.references);
      formData.append("priority", data.priority);
      formData.append("approvers", JSON.stringify(data.approvers));

      // Append each file
      data.files.forEach((file: File) => {
        formData.append("files", file);
      });

      if (isEditMode) {
        // If editing, call the PUT or PATCH endpoint
        await axios.put(`${BASE_URL}/requests/${id}`, formData, {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("NFA updated successfully");
      } else {
        // If creating a new NFA
        await axios.post(`${BASE_URL}/requests/`, formData, {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("NFA raised successfully");
      }

      // Navigate away upon success (e.g., to /dashboard or /mynfa)
      navigate("/dashboard");
    } catch (error) {
      console.error("NFA submission failed:", error);
      alert("Failed to submit NFA");
    }
  };

  return (
    <div className="pb-4">
      <h1 className="text-lg font-semibold text-gray-800 mb-4">
        {isEditMode ? "Edit NFA" : "Raise NFA"}
      </h1>
      <hr className="border-gray-300 mb-4" />

      {/* If loading is needed */}
      {loading && (
        <div className="flex items-center mb-4">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mb-4 mt-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Description */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              {...register("description")}
              type="text"
              placeholder="Enter description"
              className="mt-1 block w-full px-3 py-1.5 text-sm text-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* References */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              References
            </label>
            <input
              {...register("references")}
              type="text"
              placeholder="Enter references"
              className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md"
            />
            {errors.references && (
              <p className="text-red-500 text-sm mt-1">
                {errors.references.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              {...register("subject")}
              type="text"
              placeholder="Enter subject"
              className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Area */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Area
            </label>
            <Select onValueChange={handleAreaChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Areas</SelectLabel>
                  {["Wish Town", "Mirzapur", "Aman", "Expressway", "Hafiz Contractor"].map(
                    (area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    )
                  )}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.area && (
              <p className="text-red-500 text-sm">{errors.area.message}</p>
            )}
          </div>

          {/* If user chose 'Other' area, show text field */}
          {isOtherSelected && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Enter custom Area
              </label>
              <input
                type="text"
                placeholder="Enter custom area"
                {...register("area")}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md"
              />
              {errors.area && (
                <p className="text-red-500 text-sm">{errors.area.message}</p>
              )}
            </div>
          )}

          {/* Project dropdown */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Project
            </label>
            <Select onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Projects</SelectLabel>
                  {[
                    "Garden Isles",
                    "Casa Isles",
                    "Kosmos",
                    "Kubes",
                    "Krescent Homes",
                    "Hafiz Contractor",
                  ].map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.project && (
              <p className="text-red-500 text-sm">{errors.project.message}</p>
            )}
          </div>

          {/* If user chose 'Other' project, show text field */}
          {isOtherProject && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Enter Custom Project
              </label>
              <input
                type="text"
                placeholder="Enter custom Project"
                {...register("project")}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md"
              />
              {errors.project && (
                <p className="text-red-500 text-sm">{errors.project.message}</p>
              )}
            </div>
          )}

          {/* Tower selection if known project */}
          {!isOtherProject && towersMapping[selectedProject] && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Tower
              </label>
              <Select onValueChange={handleTowerChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Tower" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Towers</SelectLabel>
                    {towersMapping[selectedProject].map((tower) => (
                      <SelectItem key={tower} value={tower}>
                        {tower}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.tower && (
                <p className="text-red-500 text-sm">{errors.tower.message}</p>
              )}
            </div>
          )}

          {/* If user chose 'Other' tower or if user is in 'Other' project */}
          {(isOtherTower || isOtherProject) && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Enter Custom Tower
              </label>
              <input
                type="text"
                placeholder="Enter custom tower"
                {...register("tower")}
                className="mt-1 block w-full px-3 py-1.5 text-sm border rounded-md"
              />
              {errors.tower && (
                <p className="text-red-500 text-sm">{errors.tower.message}</p>
              )}
            </div>
          )}

          {/* Department */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <Select onValueChange={handleDeptChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Departments</SelectLabel>
                  {["Civil", "Finances", "Marketin", "Safety", "HR", "Purchase"].map(
                    (dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    )
                  )}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-500 text-sm">{errors.department.message}</p>
            )}
          </div>

          {/* If user chose 'Other' department */}
          {isOtherDep && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Enter Custom Department
              </label>
              <input
                type="text"
                placeholder="Enter custom Department"
                {...register("department")}
                className="mt-2 px-3 py-1.5 border rounded-md w-full"
              />
              {errors.department && (
                <p className="text-red-500 text-sm">{errors.department.message}</p>
              )}
            </div>
          )}

          {/* Priority */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <Select onValueChange={(value) => setValue("priority", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Priority</SelectLabel>
                  {["High", "Medium", "Low"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-red-500 text-sm">{errors.priority.message}</p>
            )}
          </div>

          {/* Supervisor dropdown */}
          <div className="flex flex-col relative">
            <label className="block text-sm font-medium text-gray-700">
              Select Supervisor
            </label>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              onClick={() => setOpen((prev) => !prev)}
            >
              {values
                ? values
                : "Select User..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            {errors.supervisor_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.supervisor_id.message}
              </p>
            )}
            {open && (
              <div className="absolute top-full left-0 w-full z-50 bg-white shadow-lg border rounded-md mt-1">
                <Command>
                  <CommandInput placeholder="Search supervisor..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {AllUsers.map((framework) => (
                        <CommandItem
                          key={framework.id}
                          value={framework.name}
                          onSelect={(currentValue) => {
                            const selectedUser = AllUsers.find(
                              (u) => u.name === currentValue
                            );
                            setValues(selectedUser ? selectedUser.name : "");
                            if (selectedUser) {
                              setValue("supervisor_id", Number(selectedUser.id));
                            }
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              values === framework.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {framework.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </div>

        {/* Approvers dynamic list */}
        <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => {
            const selectedApprover = approverList.find(
              (user) => user.id === selectedApprovers[index]
            );
            return (
              <div
                className="flex flex-row items-center gap-2"
                key={field.id}
              >
                <div className="flex w-full flex-col relative">
                  <div className="flex items-center justify-between w-full gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Advisor {index + 1}
                    </label>
                    {/* Button to remove an approver entry (only show if more than one) */}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="text-red-600 text-sm underline"
                        onClick={() => {
                          // Remove the field from react-hook-form
                          remove(index);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDropdown === index}
                    className="w-full justify-between mt-1"
                    onClick={() =>
                      setOpenDropdown(openDropdown === index ? null : index)
                    }
                  >
                    {selectedApprover
                      ? selectedApprover.name
                      : "Select User..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>

                  {openDropdown === index && (
                    <div className="absolute top-full left-0 w-full z-50 bg-white shadow-lg border rounded-md mt-1">
                      <Command>
                        <CommandInput placeholder="Search advisor..." />
                        <CommandList>
                          <CommandEmpty>No advisor found.</CommandEmpty>
                          <CommandGroup>
                            {getAvailableApprovers(index).map((framework) => (
                              <CommandItem
                                key={framework.id}
                                value={String(framework.id)}
                                onSelect={() =>
                                  handleSelectChange(index, String(framework.id))
                                }
                              >
                                {framework.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div>
            <Button
              type="button"
              onClick={() => {
                // Append an available approver if possible
                const availableApprovers = approverList.filter(
                  (a) => !selectedApprovers.includes(a.id)
                );
                if (availableApprovers.length > 0) {
                  append(availableApprovers[0].id);
                } else {
                  // If all possible approvers are used up, just add a placeholder
                  append(0);
                }
              }}
            >
              Add More Approvers
            </Button>
            {errors.approvers && (
              <p className="text-red-500 text-sm mt-1">
                {errors.approvers.message}
              </p>
            )}
          </div>
        </div>

        {/* File Attachments */}
        <div className="mt-4 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (optional)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="border border-gray-300 rounded-md p-1"
          />
        </div>

        {/* Submit */}
        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : isEditMode ? (
              "Update NFA"
            ) : (
              "Raise NFA"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
