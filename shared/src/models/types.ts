// CSV Data Types
export type Position = {
  "Company Name": string;
  Title: string;
  Description: string;
  Location: string;
  "Started On": string;
  "Finished On": string;
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

// Configuration Types
export type SkillNameMapping = {
  [skill: string]: string;
};

export type PositionSkillMapping = {
  [company: string]: {
    [position: string]: string[];
  };
};

export type LocationMap = {
  [location: string]: string;
};

export type Config = {
  skillsMap: SkillNameMapping;
  skillCategories: SkillCategories;
  locationMap: LocationMap;
  positions: PositionSkillMapping;
  phone?: string;
  linkedInRef?: string;
};

// Enhanced Types
export type PositionWithSkills = Position & {
  skills: string[];
};

export type SkillCategories = {
  [category: string]: string[];
};

// Raw Data Types
export type RawCSVData = {
  "Profile.csv"?: any[];
  "Positions.csv"?: any[];
  "Projects.csv"?: any[];
  "Education.csv"?: any[];
  "Email Addresses.csv"?: any[];
  "Languages.csv"?: any[];
};

export type RawData = RawCSVData & {
  image?: string;
};

// Transformed Data
export type TransformedCVData = {
  profile: Profile;
  positions: PositionWithSkills[];
  projects: Project[];
  education: Education[];
  email: { "Email Address": string };
  languages: Language[];
  skillCategories: SkillCategories;
  image?: string;
};
