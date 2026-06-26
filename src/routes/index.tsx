import { createFileRoute } from "@tanstack/react-router";
import CinematicLoveForHer from "@/components/CinematicLoveForHer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Love For Her — A Novel by Tushar Tandwalia" },
      {
        name: "description",
        content:
          "A dark romantic thriller blending horror, mythology and revenge. Step into the realm of Draveen. Book One of an epic trilogy by Tushar Tandwalia.",
      },
      { property: "og:title", content: "Love For Her — A Novel by Tushar Tandwalia" },
      { property: "og:description", content: "How far will you go for your love?" },
    ],
  }),
  component: Index,
});

function Index() {
  return <CinematicLoveForHer />;
}
