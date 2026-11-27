export const PHOTOS = [
  {
    id: "1",
    title: "Mountain Lake",
    description:
      "A peaceful alpine lake surrounded by mountains and forest.",
    location: "Alpine Valley",
    background: "linear-gradient(135deg, #2563eb, #0f766e)",
  },
  {
    id: "2",
    title: "Golden Sunset",
    description:
      "Warm evening sunlight spreading across the horizon.",
    location: "Coastal Point",
    background: "linear-gradient(135deg, #f97316, #be123c)",
  },
  {
    id: "3",
    title: "Forest Trail",
    description:
      "A quiet walking trail surrounded by dense green trees.",
    location: "Pine Forest",
    background: "linear-gradient(135deg, #166534, #365314)",
  },
];

export function getPhotoById(id) {
  return PHOTOS.find((photo) => photo.id === id);
}