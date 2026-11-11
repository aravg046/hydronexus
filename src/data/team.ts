// Add, remove or reorder people here. The page groups them by `category` automatically.
// Each person can have any number of `designations`. `photo` is optional (put the file in /public/team/ and use "/team/name.jpg").
export type Person = { name: string; initials: string; category: "students" | "mentors" | "leadership"; designations: string[]; photo?: string }

export const team: Person[] = [
  { name: "Arav Gupta", initials: "AG", category: "students", designations: ["Co-Team Lead", "Research Lead", "Strategy Lead"] },
  { name: "Keshav Singh", initials: "KS", category: "students", designations: ["Co-Team Lead", "Chief Technology & Innovation Lead", "Research Lead"] },
  { name: "Mukta Ma\u2019am", initials: "M", category: "mentors", designations: ["Teacher-in-Charge"] },
  { name: "Sunita Ma\u2019am", initials: "S", category: "mentors", designations: ["ISC In-Charge"] },
  { name: "Shivani Ma\u2019am", initials: "S", category: "leadership", designations: ["Principal, City Montessori School, Aliganj"] },
]
