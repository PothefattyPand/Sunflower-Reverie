import { Suspense } from "react";
import { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { LoginForm } from "@/components/author/LoginForm";

export const metadata: Metadata = {
  title: "Author Portal | Sunflower Reverie",
  description: "Private author gateway for the authorized author of Sunflower Reverie.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthorLoginPage() {
  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC] min-h-[80vh] flex items-center">
      <Container className="max-w-md">
        <Suspense
          fallback={
            <div className="text-center p-8 font-patrick text-lg text-[#6B584C]">
              Preparing Author Gateway...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </Container>
    </div>
  );
}

