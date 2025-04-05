import AuthForm from "@/components/AuthForm";
import Image from "next/image";

const SignIn = () => {
  return (
    <section className="flex-center size-full max-sm:px-6 relative bg-white">
      <div className="absolute inset-0 flex items-center justify-center">
        <Image 
          src="/icons/logo.png"
          alt="Background"
          width={500}
          height={500}
          className="opacity-30"
        />
      </div>
      <div className="w-full max-w-[420px] mx-auto z-10">
        <AuthForm type="sign-in" />
      </div>
    </section>
  );
};

export default SignIn;
