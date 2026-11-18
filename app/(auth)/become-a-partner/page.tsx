
import AuthForm from "@/components/forms/AuthForm";

export const metadata = {
  title: "Become a Referral Partner",
  description:
    "Join our referral programme and earn rewards from completed property sales and rentals.",
};

export default function Page() {
  return <AuthForm mode="partner" />;
}
