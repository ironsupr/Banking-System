import React, { useState } from "react";
import { FormControl, FormField, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";

import { Control, FieldPath } from "react-hook-form";
import { z } from "zod";
import { authFormSchema } from "@/lib/utils";

const formSchema = authFormSchema("sign-up");

interface CustomInput {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder: string;
}

const CustomInput = ({ control, name, label, placeholder }: CustomInput) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="form-label text-gray-700 font-medium">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <div className="relative">
                <Input
                  placeholder={placeholder}
                  className={`input-class pr-10 transition-all duration-200 ${
                    name === "password" 
                      ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                      : ""
                  }`}
                  type={name === "password" ? (showPassword ? "text" : "password") : "text"}
                  {...field}
                />
                {name === "password" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" />
                    )}
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage className="form-message mt-2 text-red-500" />
          </div>
        </div>
      )}
    />
  );
};

export default CustomInput;
