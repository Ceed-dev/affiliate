import { NavBar } from "../../../components/dashboard";

export default function Settings({ params }: { params: { projectId: string } }) {
  return (
    <>
      <NavBar projectId={params.projectId} />
      <p className="min-h-screen bg-[#F8FAFC] text-center">Settings Page</p>
    </>
  );
}