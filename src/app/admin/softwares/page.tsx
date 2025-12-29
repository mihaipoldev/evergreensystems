import { getAllSoftwares } from "@/features/page-builder/softwares/data";
import { SoftwaresList } from "@/features/page-builder/softwares/components/SoftwaresList";

export default async function SoftwaresPage() {
  const softwares = await getAllSoftwares();

  return <SoftwaresList initialSoftwares={softwares} />;
}
