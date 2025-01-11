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

export type PositionSkillMapping = {
  [company: string]: {
    [position: string]: Set<string>;
  };
};

export type SkillsMap = {
  [skill: string]: string;
};

export type SkillCategories = {
  [category: string]: Set<string>;
};

export type LocationMap = {
  [location: string]: string;
};

export type Config = {
  skillsMap: SkillsMap;
  skillCategories: SkillCategories;
  locationMap: LocationMap;
  positions: PositionSkillMapping;
};
