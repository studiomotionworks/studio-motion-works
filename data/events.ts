export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "Exhibition" | "Talk" | "Workshop" | "Opening" | "Residency";
  status: "upcoming" | "past";
  date: string; // ISO for upcoming, display-ready for past
  endDate?: string;
  time?: string;
  venue: string;
  city: string;
  country: string;
  description: string;
  longDescription?: string;
  accent: string;
  image?: string;
  rsvpUrl?: string;
  capacity?: string;
  artists?: string[];
  tags?: string[];
}

export const events: Event[] = [
  // ─── UPCOMING ───
  {
    id: "space-kinematics-01",
    slug: "space-kinematics-lecture",
    title: "Space Kinematics: A Public Lecture",
    subtitle: "Anuj Anjaria on movement as a property of space",
    category: "Talk",
    status: "upcoming",
    date: "2026-11-14T18:30:00+05:30",
    time: "6:30 PM IST",
    venue: "CEPT University — Kasturbhai Lalbhai Campus",
    city: "Ahmedabad",
    country: "India",
    description:
      "A public lecture introducing Space Kinematics as a formal field of study — how movement becomes a fundamental property of architecture, not an effect applied to it.",
    longDescription:
      "Anuj Anjaria opens the semester with a public lecture on Space Kinematics — the discipline he introduced and teaches at CEPT. The evening will trace the field's origins through Studio Motionworks' own commissions, from the White Peacock at Mumbai T2 to the Tidal Wall, and argue for a new way of thinking about how spaces move.",
    accent: "#C5A065",
    rsvpUrl: "#rsvp",
    capacity: "240 seats",
    artists: ["Anuj Anjaria"],
    tags: ["Lecture", "Public", "Free"],
  },
  {
    id: "kinetic-workshop-mumbai",
    slug: "kinetic-workshop-mumbai",
    title: "Kinetic Objects Workshop",
    subtitle: "Three-day intensive on motion and fabrication",
    category: "Workshop",
    status: "upcoming",
    date: "2026-12-05T10:00:00+05:30",
    endDate: "2026-12-07T18:00:00+05:30",
    time: "10:00 AM – 6:00 PM IST",
    venue: "Motionworks Studio",
    city: "Mumbai",
    country: "India",
    description:
      "A hands-on three-day workshop where participants design, prototype, and fabricate a small kinetic object — from initial sketch to functioning mechanism.",
    longDescription:
      "Limited to sixteen participants. Over three days, we walk through the full arc of a kinetic commission: sketch, mechanism selection, material sourcing, fabrication, and finishing. Each participant leaves with a working kinetic object and a working understanding of how motion is designed.",
    accent: "#B87333",
    rsvpUrl: "#rsvp",
    capacity: "16 participants",
    artists: ["Anuj Anjaria", "Studio Motionworks Team"],
    tags: ["Workshop", "Registration", "Hands-on"],
  },
  {
    id: "biennale-motion-2027",
    slug: "biennale-motion-2027",
    title: "Motion Biennale 2027",
    subtitle: "New kinetic commission — world premiere",
    category: "Exhibition",
    status: "upcoming",
    date: "2027-02-20T19:00:00+05:30",
    time: "7:00 PM IST",
    venue: "National Gallery of Modern Art",
    city: "New Delhi",
    country: "India",
    description:
      "The world premiere of a new large-scale kinetic commission for the 2027 Motion Biennale — a 12-meter suspended work in bronze and light.",
    longDescription:
      "Two years in development, this new commission marks Studio Motionworks' largest work to date. Twelve meters of suspended bronze and reflected light, responding to the architecture of the NGMA atrium and to the movement of visitors below. The premiere will be followed by a conversation with the artist.",
    accent: "#C0C0C0",
    rsvpUrl: "#rsvp",
    capacity: "Invitation + public",
    artists: ["Anuj Anjaria"],
    tags: ["Premiere", "Commission", "Exhibition"],
  },

  // ─── PAST ───
  {
    id: "white-peacock-unveil",
    slug: "white-peacock-unveil",
    title: "White Peacock — Unveiled",
    subtitle: "Mumbai T2 International Airport",
    category: "Opening",
    status: "past",
    date: "2024-03-18",
    venue: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India",
    description:
      "The unveiling of the White Peacock — a suspended kinetic sculpture now seen by over 40 million travelers a year.",
    accent: "#C5A065",
    tags: ["Permanent", "Airport", "Public Art"],
  },
  {
    id: "intersecting-thoughts-open",
    slug: "intersecting-thoughts-open",
    title: "Intersecting Thoughts",
    subtitle: "JP Narayan Museum opening",
    category: "Opening",
    status: "past",
    date: "2023-11-04",
    venue: "JP Narayan Museum",
    city: "Lucknow",
    country: "India",
    description:
      "A kinetic meditation on civic dialogue, unveiled at the museum's permanent collection.",
    accent: "#C0C0C0",
    tags: ["Museum", "Permanent"],
  },
  {
    id: "kinetic-talk-bangalore",
    slug: "kinetic-talk-bangalore",
    title: "The Art of Movement",
    subtitle: "Public talk on kinetic practice",
    category: "Talk",
    status: "past",
    date: "2023-08-22",
    venue: "Bangalore International Centre",
    city: "Bangalore",
    country: "India",
    description:
      "A conversation on the state of kinetic art in India — and where it's going.",
    accent: "#B87333",
    tags: ["Talk", "Public"],
  },
  {
    id: "workshop-cept-2023",
    slug: "workshop-cept-2023",
    title: "Space Kinematics Studio",
    subtitle: "First cohort at CEPT University",
    category: "Workshop",
    status: "past",
    date: "2023-02-10",
    venue: "CEPT University",
    city: "Ahmedabad",
    country: "India",
    description:
      "The inaugural Space Kinematics studio — fourteen students, one semester, twelve kinetic prototypes.",
    accent: "#C5A065",
    tags: ["Academic", "CEPT"],
  },
  {
    id: "effulgence-unveil",
    slug: "effulgence-unveil",
    title: "Effulgence",
    subtitle: "Shree Shakti Greens commission",
    category: "Opening",
    status: "past",
    date: "2022-10-15",
    venue: "Shree Shakti Greens",
    city: "Ahmedabad",
    country: "India",
    description:
      "A radiant kinetic landmark for the studio's home city — bronze, light, and motion.",
    accent: "#C5A065",
    tags: ["Public Art", "Commission"],
  },
];

export const upcomingEvents = events.filter((e) => e.status === "upcoming");
export const pastEvents = events.filter((e) => e.status === "past");