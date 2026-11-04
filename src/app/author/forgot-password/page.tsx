import { Suspense } from "react";
import { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { ForgotPasswordForm } from "@/components/author/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recover Password | Author Portal | Sunflower Reverie",
  description: "Private password recovery for the authorized author of Sunflower Reverie.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC] min-h-[80vh] flex items-center">
      <Container className="max-w-md">
        <Suspense
          fallback={
            <div className="text-center p-8 font-patrick text-lg text-[#6B584C]">
              Preparing Password Recovery...
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </Container>
    </div>
  );
}

