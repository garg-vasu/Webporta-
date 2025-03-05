import z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { Check, ChevronsUpDown, CodeSquare, Loader2 } from "lucide-react";

export type UserSchema = {
  name: string;
  role: number[];
  email: string;
  id: number;
  username: string;
};

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
  approvers: z
    .array(z.number())
    .min(1, "At least one approver must be selected"),
  files: z.any(),
});
const BASE_URL = "https://blueinvent.dockerserver.online/";

type FormFields = z.infer<typeof nfaSchema>;

export default function RaiseNFA() {
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
  const [selectedProject, setSelectedProject] = useState(""); // see what project choose
  const [isOtherProject, setIsOtherProject] = useState(false);
  const [isOtherTower, setIsOtherTower] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  /* prettier-ignore */
  const towersMapping: Record<string, string[]> = {
  "Garden Isles": ["Tower A", "Tower B"],
  "Casa Isles": ["Tower A", "Tower B", "Tower C", "Tower D"],
  "Krescent Homes": ["Tower A", "Tower B", "Tower C", "Tower D"],
  "Kosmos": ["Tower A", "Tower B", "Tower C", "Tower D"],
  "Kube": ["Tower A", "Tower B", "Tower C", "Tower D"],
};

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);
      setValue("files", filesArray); // Store files in the form state
    }
  };
  const navigate = useNavigate();
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
  const token: string = localStorage.getItem("token") || "";
  console.log(token);
  console.log(errors);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userId) fetchAllUsers();
  }, [userId]); // Ensuring `fetchAllUsers` runs after `userId` is updated

  // approver content

  const { fields, append, remove } = useFieldArray({
    control,
    name: "approvers",
  });

  const selectedApprovers = watch("approvers");
  // Get available approvers (exclude selected ones)
  const getAvailableApprovers = (index: number) => {
    return approverList.filter(
      (approver) =>
        !selectedApprovers.includes(approver.id) ||
        selectedApprovers[index] === approver.id
    );
  };

  // Handle selection change
  const handleSelectChange = (index: number, value: string) => {
    const approverId = Number(value);
    const updatedApprovers = [...selectedApprovers];
    updatedApprovers[index] = approverId;
    setValue("approvers", updatedApprovers);
    setOpenDropdown(null);
  };

  // finding userId
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: token },
      });
      console.log("userid from api");
      console.log(response.data.id);
      if (response.data.id) {
        setLoading(true);
        setUserId(response.data.id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    console.log("hello users");
    try {
      const res = await axios.get(
        "https://running-corrine-studenttt702-a4e108db.koyeb.app/users/",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      console.log("from api user");
      if (res.data) {
        console.log(res.data);
        const excludeMe = res.data.filter((u: UserSchema) => u.id !== userId);
        setAllUsers(excludeMe);
        const onlyApprovers = excludeMe.filter(
          (u: UserSchema) => u.role && u.role.includes(1)
        );

        setApproverList(onlyApprovers);
      } else {
        setAllUsers([]);
        setApproverList([]);
        console.error("Unexpected response structure:", res.data);
      }

      // Filtering Approvers
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log(approverList);

  //   image upload

  // Handle input change and filter users

  //   other area handler
  const handleAreaChange = (value: string) => {
    if (value === "Other") {
      setIsOtherSelected(true);

      setValue("area", ""); // Clear previous selection
    } else {
      setIsOtherSelected(false);
      setValue("area", value); // Set selected area
    }
  };
  const handleDeptChange = (value: string) => {
    if (value === "Other") {
      setIsOtherDep(true);

      setValue("department", ""); // Clear previous selection
    } else {
      setIsOtherDep(false);
      setValue("department", value); // Set selected area
    }
  };

  //   other project handler
  const handleProjectChange = (value: string) => {
    if (value === "Other") {
      setIsOtherProject(true);
      setSelectedProject("Other");
      setValue("project", ""); // Clear previous selection
    } else {
      setIsOtherProject(false);
      setValue("project", value);
      setSelectedProject(value); // Set selected project
    }
  };

  const handleTowerChange = (value: string) => {
    if (value === "Other") {
      setIsOtherTower(true);

      setValue("area", ""); // Clear previous selection
    } else {
      setIsOtherTower(false);
      setValue("tower", value); // Set selected area
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    console.log(data);
    try {
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

      // Append multiple files
      // Append multiple files properly
      data.files.forEach((file, index) => {
        console.log(
          `Uploading File ${index + 1}:`,
          file.name,
          file.type,
          file.size
        );
        formData.append("files", file);
      });

      // Convert FormData to a readable format
      const formDataObject: Record<string, any> = {};
      formData.forEach((value, key) => {
        if (key === "files") {
          if (!formDataObject[key]) {
            formDataObject[key] = [];
          }

          // ✅ Check if `value` is a `File` before accessing properties
          if (value instanceof File) {
            formDataObject[key].push({
              name: value.name,
              type: value.type,
              size: value.size,
            });
          } else {
            formDataObject[key].push(value); // Handle if it's a string
          }
        } else {
          formDataObject[key] = value;
        }
      });

      console.log(
        "FormData for Postman:",
        JSON.stringify(formDataObject, null, 2)
      );

      const url = `${BASE_URL}/requests/`;

      const response = await axios.post(url, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.id) {
        alert("NFA raised successfully");
      }
      console.log(response.data);
      console.log("Upload success:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // const onSubmit: SubmitHandler<FormFields> = async (data) => {
  //   console.log(data);
  // };

  return (
    <div className="pb-4">
      <h1 className="text-lg font-semibold   text-gray-800">Raise NFA</h1>
      <hr className="border-gray-300 " />
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4 mt-4 pb-4">
        <div className="grid grid-cols-1 mb-6  lg:grid-cols-2 gap-4">
          {/* descciption */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              {...register("description")}
              type="text"
              placeholder="Enter first Name"
              className="mt-1 block w-full px-3 py-1.5 text-sm text-gray-800  border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          {/*reference  */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              References
            </label>
            <input
              {...register("references")}
              type="text"
              placeholder="Enter References"
              className="mt-1 block w-full px-3 py-1.5 text-sm text-gray-800  border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.references && (
              <p className="text-red-500 text-sm mt-1">
                {errors.references.message}
              </p>
            )}
          </div>
          {/*Subject */}
          {/*reference  */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              {...register("subject")}
              type="text"
              placeholder="Enter Subject"
              className="mt-1 block w-full px-3 py-1.5 text-sm text-gray-800  border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>
          {/* area */}
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
                  {[
                    "Wish Town",
                    "Mirzapur",
                    "Aman",
                    "Expressway",
                    "Hafiz Contractor",
                  ].map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.area && (
              <p className="text-red-500 text-sm">{errors.area.message}</p>
            )}
          </div>

          {/* Show input field only if "Other" is selected */}
          {isOtherSelected && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Enter custom Area
              </label>
              <input
                type="text"
                placeholder="Enter custom area"
                {...register("area")}
                className="mt-1 block w-full px-3 py-1.5 text-sm text-gray-800  border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.area && (
                <p className="text-red-500 text-sm">{errors.area.message}</p>
              )}
            </div>
          )}

          {/* tower selection */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Projects
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
            </div>
            {errors.project && (
              <p className="text-red-500 text-sm">{errors.project.message}</p>
            )}
          </div>

          {isOtherProject && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Enter Custom Project
              </label>
              <input
                type="text"
                placeholder="Enter custom Project"
                {...register("project")}
                className="mt-1 block w-full px-3 py-1.5 text-sm text-gray-800  border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.project && (
                <p className="text-red-500 text-sm">{errors.project.message}</p>
              )}
            </div>
          )}

          {/* Tower selection */}
          {!isOtherProject && towersMapping[selectedProject] && (
            <div className="flex  flex-col w-ful gap-1">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700">
                  Towers
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
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {errors.tower && (
                <p className="text-red-500 text-sm">{errors.tower.message}</p>
              )}
            </div>
          )}

          {/* Other Tower */}
          {(isOtherTower || isOtherProject) && (
            <div className="flex flex-col w-full gap-1">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700">
                  Enter Custom Tower
                </label>
                <input
                  type="text"
                  placeholder="Enter custom Tower"
                  {...register("tower")}
                  className="mt-1 block w-full px-3 py-1.5 text-sm text-gray-800  border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.tower && (
                <p className="text-red-500 text-sm">{errors.tower.message}</p>
              )}
            </div>
          )}

          {/* department */}
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
                  {[
                    "Civil",
                    "Finances",
                    "Marketin",
                    "Safety",
                    "HR",
                    "Purchase",
                  ].map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-500 text-sm">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Show input field only if "Other" is selected */}
          {isOtherDep && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700">
                Enter custom Department
              </label>
              <input
                type="text"
                placeholder="Enter custom Department"
                {...register("department")}
                className="mt-2 p-2 border rounded-md w-full"
              />
              {errors.department && (
                <p className="text-red-500 text-sm">
                  {errors.department.message}
                </p>
              )}
            </div>
          )}

          {/* priority */}
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
                  {["High", "Medium", "Low"].map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-red-500 text-sm">{errors.priority.message}</p>
            )}
          </div>

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
                ? AllUsers.find((user) => user.name === values)?.name
                : "Select User..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            {errors.supervisor_id && (
              <p className="text-red-500 text-sm">
                {errors.supervisor_id.message}
              </p>
            )}

            {open && (
              <div className="absolute top-full left-0 w-full z-50 bg-white shadow-lg border rounded-md mt-1">
                <Command>
                  <CommandInput placeholder="Search user..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {AllUsers.map((framework) => (
                        <CommandItem
                          key={framework.name}
                          value={framework.name}
                          onSelect={(currentValue) => {
                            const selectedUser = AllUsers.find(
                              (u) => u.name === currentValue
                            );
                            setValues(selectedUser ? selectedUser.name : "");
                            if (selectedUser)
                              setValue(
                                "supervisor_id",
                                Number(selectedUser.id)
                              );
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

          {/* approvers list section  */}
          {/* {fields.map((field, index) => {
            const selectedApprover = approverList.find(
              (user) => user.id === selectedApprovers[index]
            );
            return (
              <div className="flex flex-col" key={field.id}>
                <label className="block text-sm font-medium text-gray-700">
                  Select Advisior
                </label>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  onClick={() =>
                    setOpenDropdown(openDropdown === index ? null : index)
                  }
                >
                  {selectedApprover ? selectedApprover.name : "Select User..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                {openDropdown === index && (
                  <div className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search framework..." />
                      <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                          {getAvailableApprovers(index).map((framework) => (
                            <CommandItem
                              key={framework.name}
                              value={String(framework.id)}
                              onSelect={() =>
                                handleSelectChange(index, String(framework.id))
                              }
                            >
                              {/* <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                Number(values) === framework.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            /> */}
          {/* {framework.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
                {fields.length > 1 && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const updatedApprovers = [...watch("approvers")];
                      updatedApprovers.splice(index, 1); // Remove only the selected approver at that index
                      setValue("approvers", updatedApprovers); // Ensure React Hook Form gets updated values
                      remove(index); // Now safely remove the field
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            );
          })} */}
          {/* <Button
            type="button"
            onClick={() => {
              const availableApprovers = approverList.filter(
                (a) => !selectedApprovers.includes(a.id)
              );
              if (availableApprovers.length > 0)
                append(availableApprovers[0].id); // Add first available approver
            }}
          >
            Add More Approvers
          </Button>  */}
        </div>
        <div className=" grid grid-cols-2 gap-2 flex-col">
          {fields.map((field, index) => {
            const selectedApprover = approverList.find(
              (user) => user.id === selectedApprovers[index]
            );
            return (
              <div
                className="flex flex-row w-full items-center justify-center gap-2"
                key={field.id}
              >
                <div className="flex w-full flex-col relative">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Advisor
                    </label>
                    <div className="flex items-center justify-center w-full  gap-2">
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDropdown === index}
                        className="w-[94%] justify-between"
                        onClick={() =>
                          setOpenDropdown(openDropdown === index ? null : index)
                        }
                      >
                        {selectedApprover
                          ? selectedApprover.name
                          : "Select User..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                      {fields.length > 1 && (
                        <button
                          onClick={() => {
                            // Get current selected approvers
                            const currentApprovers = watch("approvers");

                            // Ensure we have selectedApprovers[index] before proceeding
                            if (selectedApprovers[index] !== undefined) {
                              const updatedApprovers = currentApprovers.filter(
                                (id) => id !== selectedApprovers[index] // Remove only the selected approver
                              );

                              setValue("approvers", updatedApprovers); // Ensure state updates correctly
                            }

                            remove(index); // Remove only the selected field
                          }}
                          className="sm:ml-2"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </div>

                  {openDropdown === index && (
                    <div className="absolute top-full left-0 w-full z-50 bg-white shadow-lg border rounded-md mt-1">
                      <Command>
                        <CommandInput placeholder="Search advisor..." />
                        <CommandList>
                          <CommandEmpty>No advisor found.</CommandEmpty>
                          <CommandGroup>
                            {getAvailableApprovers(index).map((framework) => (
                              <CommandItem
                                key={framework.name}
                                value={String(framework.id)}
                                onSelect={() =>
                                  handleSelectChange(
                                    index,
                                    String(framework.id)
                                  )
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
        </div>
        <div className="flex justify-end ">
          <Button
            type="button"
            className="mt-4 flex justify-end items-center sm:w-auto"
            onClick={() => {
              const availableApprovers = approverList.filter(
                (a) => !selectedApprovers.includes(a.id)
              );
              if (availableApprovers.length > 0)
                append(availableApprovers[0].id);
            }}
          >
            Add More Approvers
          </Button>
        </div>

        <div className="h-12 mt-4 mb-4 border border-dashed rounded-md p-2 border-stone-700">
          <label>Upload Files (PDFs, Images):</label>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />

          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700 mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </div>
  );
}
