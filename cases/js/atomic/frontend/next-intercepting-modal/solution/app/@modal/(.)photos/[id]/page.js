import { notFound } from "next/navigation";
import PhotoModal from "../../../components/PhotoModal";
import { getPhotoById } from "../../../lib/photos";

export default async function InterceptedPhotoPage({ params }) {
  const { id } = await params;
  const photo = getPhotoById(id);

  if (!photo) {
    notFound();
  }

  return <PhotoModal photo={photo} />;
}
