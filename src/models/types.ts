export type Position = {
  "Company Name": string;
  Title: string;
  Description: string;
  Location: string;
  "Started On": string;
  "Finished On": string;
  skills?: string[]; // Added skills array to Position
};

export type Profile = {
  "First Name": string;
  "Last Name": string;
  Headline: string;
  Summary: string;
  Industry: string;
  "Geo Location": string;
  Websites: string;
};

export type Project = {
  Title: string;
  Description: string;
  Url: string;
  "Started On": string;
  "Finished On": string;
};

export type Skill = {
  Name: string;
};

export type Education = {
  "School Name": string;
  "Degree Name": string;
  Notes: string;
  "Start Date": string;
  "End Date": string;
  Activities: string;
};

export type Email = {
  "Email Address": string;
  Confirmed: string;
  Primary: string;
  "Updated On": string;
};

export type Language = {
  Name: string;
  Proficiency: string;
};

export type PositionSkillMapping = {
  [company: string]: {
    [position: string]: string[];
  };
};

export type CVData = {
  profile: Profile;
  positions: Position[];
  projects: Project[];
  education: Education[];
  email: { "Email Address": string };
  languages: Language[];
};

// Types for the data transformation layer
export type SkillCategory = {
  name: string;
  skills: string[];
};

export type TransformedCVData = Omit<CVData, "positions"> & {
  positions: (Position & { skills: string[] })[];
  skillCategories: SkillCategory[];
};
