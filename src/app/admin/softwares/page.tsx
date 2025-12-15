import { getAllSoftwares } from "@/features/softwares/data";
import { SoftwaresList } from "@/features/softwares/components/SoftwaresList";

export default async function SoftwaresPage() {
  const softwares = await getAllSoftwares();

  return <SoftwaresList initialSoftwares={softwares} />;
}
