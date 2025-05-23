"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

import CustomInput from "./CustomInput";
import PlaidLink from "./PlaidLink";
import { authFormSchema } from "@/lib/utils";
import { signIn, signUp } from "@/lib/actions/user.actions";

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setEmailError("");

    try {
      if (type === "sign-up") {
        const userData = {
          firstName: data.firstName!,
          lastName: data.lastName!,
          address1: data.address1!,
          city: data.city!,
          state: data.state!,
          postalCode: data.postalCode!,
          dateOfBirth: data.dateOfBirth!,
          ssn: data.ssn!,
          email: data.email,
          password: data.password,
        };

        const newUser = await signUp(userData);
        if (newUser.userId) {
          setUser(newUser); // Proceed to Plaid linking
        } else {
          setEmailError("Email is already registered.");
        }
      }

      if (type === "sign-in") {
        const response = await signIn({ email: data.email, password: data.password });

        if (response?.error) {
          setEmailError(response.error);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setEmailError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-form">
      {/* Header */}
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/logo.png" width={50} height={50} alt="Shauryan logo" />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Shauryan</h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user ? "Link your account to get started" : "Please enter your details"}
          </p>
        </div>
      </header>

      {/* After successful sign-up */}
      {user ? (
        <div className="flex flex-col gap-4 mt-6">
          <PlaidLink user={user} variant="primary" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Sign-Up Specific Fields */}
              {type === "sign-up" && (
                <>
                  <div className="flex gap-4">
                    <CustomInput control={form.control} name="firstName" label="First Name" placeholder="Enter your first name" />
                    <CustomInput control={form.control} name="lastName" label="Last Name" placeholder="Enter your last name" />
                  </div>
                  <CustomInput control={form.control} name="address1" label="Address" placeholder="Enter your address" />
                  <CustomInput control={form.control} name="city" label="City" placeholder="Enter your city" />
                  <div className="flex gap-4">
                    <CustomInput control={form.control} name="state" label="State" placeholder="e.g. NY" />
                    <CustomInput control={form.control} name="postalCode" label="Postal Code" placeholder="e.g. 11101" />
                  </div>
                  <div className="flex gap-4">
                    <CustomInput control={form.control} name="dateOfBirth" label="Date of Birth" placeholder="YYYY-MM-DD" />
                    <CustomInput control={form.control} name="ssn" label="SSN" placeholder="e.g. 1234" />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <CustomInput control={form.control} name="email" label="Email" placeholder="Enter your email" />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}

              <CustomInput control={form.control} name="password" label="Password" placeholder="Enter your password" />

              <Button type="submit" disabled={isLoading} className="form-btn w-full">
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    &nbsp; Loading...
                  </>
                ) : type === "sign-in" ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <footer className="flex justify-center gap-1 mt-4">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in" ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="form-link">
              {type === "sign-in" ? "Sign up" : "Sign in"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
