import type { DB } from "./types";

const AY = "2025-26";

export function seedDB(): DB {
  const today = new Date();
  const d = (offset: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + offset);
    return x.toISOString().slice(0, 10);
  };
  const t = (offset: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + offset);
    return x.toISOString();
  };

  return {
    institution: {
      name: "Sri Venkateswara Institute of Technology",
      address: "Knowledge Park, Bengaluru — 560064, Karnataka, India",
      logoText: "SVIT",
    },
    departments: [
      { id: "dep-cse", name: "Computer Science & Engineering", code: "CSE" },
      { id: "dep-ece", name: "Electronics & Communication", code: "ECE" },
      { id: "dep-mba", name: "Management Studies", code: "MBA" },
      { id: "dep-mec", name: "Mechanical Engineering", code: "MECH" },
    ],
    programs: [
      { id: "prg-btcse", departmentId: "dep-cse", name: "B.Tech CSE" },
      { id: "prg-mtcse", departmentId: "dep-cse", name: "M.Tech CSE (AI)" },
      { id: "prg-btece", departmentId: "dep-ece", name: "B.Tech ECE" },
      { id: "prg-mba", departmentId: "dep-mba", name: "MBA" },
      { id: "prg-btmec", departmentId: "dep-mec", name: "B.Tech Mechanical" },
    ],
    users: [
      {
        id: "usr-org",
        name: "Dr. Ananya Rao",
        role: "organizer",
        departmentId: "dep-cse",
        designation: "Associate Professor, CSE",
      },
      {
        id: "usr-dean",
        name: "Prof. Rajeev Menon",
        role: "dean",
        departmentId: "dep-cse",
        designation: "Dean of Academics",
      },
      {
        id: "usr-off",
        name: "Ms. Kavitha Iyer",
        role: "officer",
        departmentId: "dep-cse",
        designation: "Accreditation Officer (NAAC / NBA)",
      },
    ],
    events: [
      {
        id: "ev-1",
        title: "AI & Machine Learning Workshop",
        description:
          "A two-day hands-on workshop covering supervised learning, neural networks and model deployment for final year students.",
        type: "Workshop",
        date: d(24),
        venue: "CSE Seminar Hall, Block A",
        departmentId: "dep-cse",
        programId: "prg-btcse",
        academicYear: AY,
        semester: "Semester 5",
        expectedParticipants: 120,
        coordinator: "Dr. Ananya Rao",
        plannedBudget: 50000,
        status: "draft",
        organizerId: "usr-org",
        createdAt: t(-3),
      },
      {
        id: "ev-2",
        title: "National Hackathon 2026",
        description:
          "A 36-hour national level hackathon with industry problem statements on sustainability and civic technology.",
        type: "Hackathon",
        date: d(41),
        venue: "Central Innovation Centre",
        departmentId: "dep-cse",
        programId: "prg-mtcse",
        academicYear: AY,
        semester: "Semester 6",
        expectedParticipants: 400,
        coordinator: "Dr. Ananya Rao",
        plannedBudget: 285000,
        status: "pending",
        organizerId: "usr-org",
        createdAt: t(-12),
        submittedAt: t(-5),
      },
      {
        id: "ev-3",
        title: "Faculty Development Program on Outcome Based Education",
        description:
          "A five-day FDP for faculty on OBE, course outcomes, attainment calculation and NBA documentation.",
        type: "FDP",
        date: d(12),
        venue: "Academic Staff College",
        departmentId: "dep-ece",
        programId: "prg-btece",
        academicYear: AY,
        semester: "Semester 5",
        expectedParticipants: 60,
        coordinator: "Dr. S. Balakrishnan",
        plannedBudget: 90000,
        status: "approved",
        organizerId: "usr-org",
        createdAt: t(-30),
        submittedAt: t(-24),
      },
      {
        id: "ev-4",
        title: "Cyber Security Awareness Seminar",
        description:
          "An awareness seminar on digital hygiene, phishing, safe banking and responsible social media usage.",
        type: "Seminar",
        date: d(-21),
        venue: "Main Auditorium",
        departmentId: "dep-ece",
        programId: "prg-btece",
        academicYear: AY,
        semester: "Semester 4",
        expectedParticipants: 250,
        coordinator: "Prof. Neha Kulkarni",
        plannedBudget: 65000,
        status: "completed",
        organizerId: "usr-org",
        createdAt: t(-60),
        submittedAt: t(-52),
        conductedAt: t(-21),
      },
      {
        id: "ev-5",
        title: "Annual Cultural Fest — Spandana 2026",
        description:
          "The flagship three-day inter-collegiate cultural festival featuring music, dance, drama and literary events.",
        type: "Cultural Event",
        date: d(-48),
        venue: "Open Air Theatre & Main Grounds",
        departmentId: "dep-mba",
        programId: "prg-mba",
        academicYear: AY,
        semester: "Semester 3",
        expectedParticipants: 1800,
        coordinator: "Dr. Ananya Rao",
        plannedBudget: 450000,
        status: "completed",
        organizerId: "usr-org",
        createdAt: t(-95),
        submittedAt: t(-88),
        conductedAt: t(-48),
        dossierGeneratedAt: t(-30),
        verified: true,
      },
    ],
    budgetItems: [
      b("ev-2", "Venue", "Innovation centre setup & power backup", 45000),
      b("ev-2", "Food", "Meals & refreshments for 400 participants", 120000),
      b("ev-2", "Guest / Speaker", "Industry mentors and judges honorarium", 60000),
      b("ev-2", "Printing", "Banners, certificates, ID cards", 25000),
      b("ev-2", "Marketing", "Digital campaign and outreach", 35000),
      b("ev-3", "Guest / Speaker", "Resource persons for 5 days", 45000),
      b("ev-3", "Food", "Working lunch and refreshments", 25000),
      b("ev-3", "Printing", "Course kits and certificates", 20000),
      b("ev-4", "Venue", "Auditorium AV & seating", 15000),
      b("ev-4", "Guest / Speaker", "Cyber crime cell speaker honorarium", 20000),
      b("ev-4", "Printing", "Posters and handouts", 10000),
      b("ev-4", "Food", "Refreshments", 20000),
      b("ev-5", "Venue", "Stage, lighting and sound", 180000),
      b("ev-5", "Guest / Speaker", "Celebrity guest & judges", 90000),
      b("ev-5", "Decoration", "Theme decor and installations", 70000),
      b("ev-5", "Marketing", "Publicity across colleges", 50000),
      b("ev-5", "Printing", "Passes, banners, certificates", 30000),
      b("ev-5", "Food", "Hospitality for guests and volunteers", 30000),
    ],
    expenses: [
      e("ev-4", "Venue", "Auditorium AV & seating", 15000, 14200, d(-21)),
      e("ev-4", "Guest / Speaker", "Speaker honorarium", 20000, 20000, d(-21)),
      e("ev-4", "Printing", "Posters and handouts", 10000, 8300, d(-23)),
      e("ev-4", "Food", "Refreshments", 20000, 15000, d(-21)),
      e("ev-5", "Venue", "Stage, lighting and sound", 180000, 192000, d(-48)),
      e("ev-5", "Guest / Speaker", "Celebrity guest & judges", 90000, 88000, d(-49)),
      e("ev-5", "Decoration", "Theme decor and installations", 70000, 74500, d(-50)),
      e("ev-5", "Marketing", "Publicity across colleges", 50000, 41000, d(-55)),
      e("ev-5", "Printing", "Passes, banners, certificates", 30000, 28800, d(-52)),
      e("ev-5", "Food", "Hospitality", 30000, 27000, d(-48)),
    ],
    approvals: [
      {
        id: "ap-3",
        eventId: "ev-3",
        decision: "approved",
        approverName: "Prof. Rajeev Menon",
        approverRole: "Dean of Academics",
        comment:
          "Well structured FDP aligned with NBA requirements. Approved with the requested budget.",
        timestamp: t(-22),
      },
      {
        id: "ap-4",
        eventId: "ev-4",
        decision: "approved",
        approverName: "Prof. Rajeev Menon",
        approverRole: "Dean of Academics",
        comment: "Important awareness initiative. Approved.",
        timestamp: t(-50),
      },
      {
        id: "ap-5",
        eventId: "ev-5",
        decision: "approved",
        approverName: "Prof. Rajeev Menon",
        approverRole: "Dean of Academics",
        comment:
          "Approved. Please ensure vendor quotations are documented for audit purposes.",
        timestamp: t(-86),
      },
    ],
    reports: [
      {
        eventId: "ev-4",
        description:
          "The Cyber Security Awareness Seminar was conducted for second year students with a resource person from the State Cyber Crime Cell.",
        outcomes:
          "Students demonstrated improved awareness of phishing, password hygiene and safe online banking practices.",
        participants: 236,
        highlights:
          "Live demonstration of a phishing attack; interactive quiz with 180+ participants.",
        achievements: "Two students selected for the district cyber volunteer program.",
        challenges: "Limited seating led to an overflow arrangement in the adjacent hall.",
        conclusion:
          "The seminar achieved its objective of building baseline cyber hygiene awareness across the batch.",
        updatedAt: t(-19),
      },
      {
        eventId: "ev-5",
        description:
          "Spandana 2026 was conducted over three days with participation from 24 colleges across the state.",
        outcomes:
          "Strengthened inter-collegiate engagement and provided a platform for 1800+ students across 32 competitions.",
        participants: 1842,
        highlights:
          "Grand finale concert, 32 competitive events, and a record 24 participating institutions.",
        achievements:
          "Our institution retained the overall championship trophy; media coverage in two state dailies.",
        challenges: "Peak-hour crowd management at the open air theatre required extra volunteers.",
        conclusion:
          "Spandana 2026 was executed successfully within a 3% budget variance and set a new participation record.",
        updatedAt: t(-40),
      },
    ],
    photos: [
      p("ev-5", "Inauguration by the Chief Guest", false),
      p("ev-5", "Classical dance competition finals", false),
      p("ev-5", "Grand finale concert at the Open Air Theatre", true, 13.0827, 77.5877),
      p("ev-5", "Prize distribution ceremony", true, 13.0829, 77.5879),
      p("ev-4", "Resource person addressing the audience", false),
      p("ev-4", "Interactive quiz session", true, 12.9716, 77.5946),
    ],
    feedback: [
      {
        eventId: "ev-4",
        responses: 198,
        averageRating: 4.4,
        satisfaction: 89,
        content: 4.5,
        organization: 4.3,
        venue: 4.1,
        experience: 4.6,
        summary:
          "Participants found the live demonstrations highly engaging and requested a follow-up hands-on lab.",
      },
      {
        eventId: "ev-5",
        responses: 742,
        averageRating: 4.6,
        satisfaction: 93,
        content: 4.7,
        organization: 4.5,
        venue: 4.4,
        experience: 4.8,
        summary:
          "Overwhelmingly positive response on event scale and production quality; suggestions to improve queue management.",
      },
    ],
    press: [
      {
        id: "pr-1",
        eventId: "ev-5",
        title: "Spandana 2026 draws 24 colleges to SVIT campus",
        source: "The Bengaluru Chronicle",
        publicationDate: d(-46),
        kind: "Newspaper Clipping",
        link: "https://example.com/spandana-2026",
      },
      {
        id: "pr-2",
        eventId: "ev-5",
        title: "Culture, code and community: inside a college fest",
        source: "Campus Today Magazine",
        publicationDate: d(-42),
        kind: "Magazine Clipping",
        link: "https://example.com/campus-today-spandana",
      },
      {
        id: "pr-3",
        eventId: "ev-4",
        title: "Cyber cell officials sensitise students on online fraud",
        source: "State Herald",
        publicationDate: d(-20),
        kind: "News Article",
        link: "https://example.com/cyber-awareness",
      },
    ],
    dossiers: [
      {
        id: "ds-5",
        eventId: "ev-5",
        generatedAt: t(-30),
        generatedBy: "Dr. Ananya Rao",
      },
    ],
  };

  function b(
    eventId: string,
    category: string,
    description: string,
    plannedAmount: number,
  ) {
    return {
      id: "bi-" + Math.random().toString(36).slice(2, 9),
      eventId,
      category,
      description,
      plannedAmount,
    };
  }
  function e(
    eventId: string,
    category: string,
    description: string,
    plannedAmount: number,
    actualAmount: number,
    date: string,
  ) {
    return {
      id: "ex-" + Math.random().toString(36).slice(2, 9),
      eventId,
      category,
      description,
      plannedAmount,
      actualAmount,
      date,
    };
  }
  function p(
    eventId: string,
    caption: string,
    geoTagged: boolean,
    latitude?: number,
    longitude?: number,
  ) {
    const seed = encodeURIComponent(caption.slice(0, 12));
    return {
      id: "ph-" + Math.random().toString(36).slice(2, 9),
      eventId,
      url: `https://picsum.photos/seed/${seed}/800/600`,
      caption,
      geoTagged,
      latitude,
      longitude,
      uploadedAt: new Date().toISOString(),
    };
  }
}
