import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
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
import { ChevronsUpDown } from "lucide-react";

export type UserSchema = {
  name: string;
  role: number[];
  email: string;
  id: number;
  username: string;
};

const handleSelectChange = (index: number, value: string) => {
  const approverId = Number(value);
  const updatedApprovers = [...selectedApprovers];
  updatedApprovers[index] = approverId;
  setValue("approvers", updatedApprovers);
  setOpenDropdown(null);
};

const nfaSchema = z.object({
  approvers: z
    .array(z.number())
    .min(1, "At least one approver must be selected"),
});

type FormFields = z.infer<typeof nfaSchema>;

export default function Learn() {
  const sample: UserSchema[] = [
    {
      name: "John Doe",
      role: [1, 2], // Assuming roles are represented by numbers (e.g., 1 = Admin, 2 = User)
      email: "john.doe@example.com",
      id: 1,
      username: "johndoe",
    },
    {
      name: "Jane Smith",
      role: [2], // Jane has only the User role
      email: "jane.smith@example.com",
      id: 2,
      username: "janesmith",
    },
    {
      name: "Alice Johnson",
      role: [1, 3], // Alice has Admin and another role (e.g., 3 = Moderator)
      email: "alice.johnson@example.com",
      id: 3,
      username: "alicej",
    },
    {
      name: "Vasuu",
      role: [1, 3], // Alice has Admin and another role (e.g., 3 = Moderator)
      email: "alice.johnson@example.com",
      id: 4,
      username: "alicej",
    },
  ];

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

  return (
    <>
      <div className="flex w-full flex-col relative">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700">
            Select Advisor
          </label>
          <div className="flex items-center justify-center w-full  gap-2">
            <Button
              variant="outline"
              role="combobox"
              className="w-[94%] justify-between"
              onClick={() =>
                setOpenDropdown(openDropdown === index ? null : index)
              }
            >
              {selectedApprover ? selectedApprover.name : "Select User..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </div>
        </div>

        {openDropdown === index && (
          <div className="absolute top-full left-0 w-full z-50 bg-white shadow-lg border rounded-md mt-1">
            <Command>
              <CommandInput placeholder="Search advisor..." />
              <CommandList>
                <CommandEmpty>No advisor found.</CommandEmpty>
                <CommandGroup>
                  {sample.map((framework) => (
                    <CommandItem
                      key={framework.name}
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
    </>
  );
}
