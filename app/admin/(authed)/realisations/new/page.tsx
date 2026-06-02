import RealisationForm from "../RealisationForm";

export default function NewRealisation() {
  return (
    <RealisationForm
      initial={{
        titre: "",
        slug: "",
        description: "",
        univers: "",
        exps: [],
        cover_url: null,
        media: [],
        published: true,
        position: 0,
      }}
    />
  );
}
