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
