import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Tracker from "@/components/public/Tracker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Tracker />
    </>
  );
}
