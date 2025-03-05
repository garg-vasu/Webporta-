import { useParams } from "react-router-dom";

export default function EditNfa() {
  const { id } = useParams<{ id: string }>();

  return <h2>Hello</h2>;
}
