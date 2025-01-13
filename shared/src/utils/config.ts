import type { Config } from '../models/types';

export const defaultConfig: Config = {
  "skillsMap": {
    ".NET": "Microsoft.NET",
    "Databases": "",
    "Telephony": "",
    "Programming": "",
    "Product Development": "Product Management",
    "SQL Server": "Microsoft SQL Server",
    "AWS": "Amazon Web Services (AWS)",
    "GCP": "Google Cloud Platform (GCP)"
  },
  "skillCategories": {
    "Core Competencies": [
      "Full-Stack Development",
      "Software Development",
      "Web Development",
      "CI/CD",
      "Mobile Applications",
      "Programming",
      "Test Automation",
      "Mechatronics",
      "Interactive Voice Response (IVR)",
      "Natural Language Processing (NLP)",
      "Web Services",
      "Web Applications",
      "Backoffice IT Management"
    ],
    "Programming Languages": [
      "JavaScript",
      "TypeScript",
      "Python",
      "C",
      "C++",
      "C#",
      "Java",
      "PHP",
      "Assembly Language",
      "CSS",
      "SQL",
      "Tailwind CSS",
      "Terraform Script"
    ],
    "Frameworks": [
      "React",
      "React Native",
      "Node.js",
      "Next.js",
      "AngularJS",
      "Microsoft.NET",
      "Mono",
      "Symphony",
      "Firebase",
      "Docker"
    ],
    "Cloud & Infrastructure": [
      "Amazon Web Services (AWS)",
      "Google Cloud Platform (GCP)",
      "AWS Aurora",
      "AWS CloudFormation",
      "Infrastructure as code (IaC)",
      "Terraform Cloud",
      "GitHub Actions",
      "GCP Cloud Build",
      "DevOps",
      "Configuration Management",
      "Puppet",
      "Distributed Systems",
      "RabbitMQ",
      "Serverless"
    ],
    "Artificial Intelligence": [
      "Large Language Models (LLM)",
      "Prompt Engineering",
      "Vector Databases",
      "Fine Tuning"
    ],
    "Databases": [
      "Microsoft SQL Server",
      "GraphQL",
      "Firestore",
      "MongoDB",
      "AWS Aurora",
      "AWS DocumentDB",
      "Firestore",
      "MySQL",
      "Entity Framework"
    ],
    "Tools": [
      "Git",
      "Windows",
      "Linux",
      "MacOS",
      "Expo",
      "App Center",
      "Google Workspace",
      "GitHub Actions",
      "GCP Cloud Build"
    ],
    "Engineering Practices": [
      "Software Architecture",
      "Software Design",
      "Software Engineering",
      "Integration",
      "Open Source",
      "Security",
      "Compliance"
    ],
    "Management": [
      "Team Leadership",
      "Software Project Management",
      "Product Management",
      "Business Strategy",
      "Agile Methodologies",
      "Scrum",
      "Extreme Programming"
    ]
  },
  "locationMap": {
    "Gothenburg, Vastra Gotaland County, Sweden": "Gothenburg, Sweden",
    "Gothenburg, Västra Götaland County, Sweden": "Gothenburg, Sweden",
    "Gothenburg Metropolitan Area": "Gothenburg, Sweden",
    "Göteborg, Sverige": "Gothenburg, Sweden"
  },
  "positions": {
    "Hiber": {
      "Full Stack Developer": [
        "Amazon Web Services (AWS)",
        "AWS Aurora",
        "AWS DocumentDB",
        "C++",
        "CI/CD",
        "DevOps",
        "Docker",
        "Firebase",
        "Firestore",
        "Full-Stack Development",
        "GCP Cloud Build",
        "GitHub Actions",
        "Google Cloud Platform (GCP)",
        "GraphQL",
        "Infrastructure as code (IaC)",
        "Next.js",
        "Programming",
        "Python",
        "React Native",
        "React",
        "Serverless",
        "Terraform Cloud",
        "Terraform Script",
        "TypeScript"
      ],
      "Systems Administrator": [
        "Backoffice IT Management",
        "CI/CD",
        "Google Cloud Platform (GCP)",
        "Google Workspace",
        "Infrastructure as code (IaC)",
        "Security",
        "Terraform Cloud",
        "Terraform Script"
      ],
      "AI Software Developer": [
        "Amazon Web Services (AWS)",
        "CI/CD",
        "DevOps",
        "Docker",
        "Fine Tuning",
        "Firestore",
        "Full-Stack Development",
        "GCP Cloud Build",
        "GitHub Actions",
        "Google Cloud Platform (GCP)",
        "Large Language Models (LLM)",
        "Next.js",
        "Node.js",
        "Prompt Engineering",
        "Python",
        "React",
        "Terraform Cloud",
        "Terraform Script",
        "Vector Databases"
      ],
      "React / TypeScript Developer": [
        "Amazon Web Services (AWS)",
        "App Center",
        "AWS Aurora",
        "CI/CD",
        "CSS",
        "Docker",
        "Expo",
        "Firebase",
        "Firestore",
        "Full-Stack Development",
        "GitHub Actions",
        "Infrastructure as code (IaC)",
        "Next.js",
        "Node.js",
        "React Native",
        "React",
        "Tailwind CSS",
        "Terraform Cloud",
        "Terraform Script",
        "TypeScript"
      ],
      "Information Security | Test Automation Lead": [
        "Test Automation",
        "CI/CD",
        "Software Project Management",
        "Security",
        "Compliance"
      ],
      "Chief Technology Officer": [
        "Agile Methodologies",
        "Amazon Web Services (AWS)",
        "App Center",
        "AWS Aurora",
        "Business Strategy",
        "CI/CD",
        "CSS",
        "Docker",
        "Expo",
        "Firebase",
        "Firestore",
        "Full-Stack Development",
        "Infrastructure as code (IaC)",
        "Next.js",
        "Node.js",
        "React Native",
        "React",
        "React",
        "Software Project Management",
        "Tailwind CSS",
        "Team Leadership",
        "Terraform Cloud",
        "Terraform Script",
        "TypeScript"
      ]
    },
    "Allevi AB": {
      "CISO | Product Owner | Business Analyst | CloudOps Engineer | Systems Developer": [
        "Amazon Web Services (AWS)",
        "AWS CloudFormation",
        "CI/CD",
        "Compliance",
        "DevOps",
        "Full-Stack Development",
        "Infrastructure as code (IaC)",
        "MySQL",
        "PHP",
        "Product Management",
        "Security",
        "Software Project Management",
        "Symphony",
        "Test Automation"
      ]
    },
    "Acorn Technology AB": {
      "Senior Software Developer at Saab": [
        "Full-Stack Development",
        "C#",
        "DevOps",
        "CI/CD",
        "Programming",
        "Microsoft SQL Server",
        "Microsoft.NET"
      ],
      "Senior Technical Consultant": [
        "Full-Stack Development",
        "C#",
        "Programming",
        "Microsoft.NET"
      ],
      "Lead Developer at Aros Electronics AB": [
        "Full-Stack Development",
        "C#",
        "Microsoft.NET",
        "Mechatronics"
      ],
      "Senior Developer Team Lead at KGH Customs Services": [
        "Full-Stack Development",
        "Software Architecture",
        "Microsoft SQL Server",
        "CI/CD",
        "C#",
        "JavaScript",
        "Microsoft.NET",
        "RabbitMQ"
      ]
    },
    "TIBCO Spotfire": {
      "Senior Software Architect | Senior Software Developer | Lead Tech": [
        "Full-Stack Development",
        "AngularJS",
        "Microsoft.NET",
        "Microsoft SQL Server",
        "MySQL",
        "CI/CD",
        "Java",
        "C#",
        "Software Architecture",
        "Product Management"
      ]
    },
    "OpenSim": {
      "Co-founder | Lead Programmer": [
        "Full-Stack Development",
        "Microsoft SQL Server",
        "MySQL",
        "C#",
        "Open Source",
        "Mono"
      ]
    },
    "Tribal Media AB": {
      "CEO": [
        "Software Project Management",
        "Team Leadership",
        "Product Management"
      ],
      "Lead Programmer | Software Architect": [
        "Full-Stack Development",
        "C#",
        "Microsoft.NET",
        "Programming",
        "Software Architecture"
      ]
    },
    "Playahead AB": {
      "Lead Programmer": [
        "Full-Stack Development",
        "C#",
        "DevOps",
        "Microsoft.NET",
        "Microsoft SQL Server"
      ]
    },
    "Voice Workers AB": {
      "CTO": [
        "Full-Stack Development",
        "Java",
        "Interactive Voice Response (IVR)",
        "Natural Language Processing (NLP)",
        "Telephony",
        "Team Leadership"
      ]
    },
    "Ullman Human Design Group AB": {
      "CTO | Senior consultant": ["Assembly Language", "Team Leadership"]
    },
    "Framfab": {
      "Lead Programmer | Software Architect | Key Account Manager": [
        "Full-Stack Development",
        "Programming",
        "Software Architecture"
      ]
    },
    "Viktoria Swedish ICT": {
      "Amanuens": ["Programming", "Web Development"]
    },
    "Dagens TV A/S": {
      "CTO | Senior Systems Developer": [
        "Full-Stack Development",
        "C++",
        "Team Leadership"
      ]
    },
    "Teamwork": {
      "Consultant, Systems Administration": [
        "Systems Administration",
        "Configuration Management"
      ]
    },
    "Pendax AV Tjänst": {
      "Freelance Programmer": [
        "Full-Stack Development",
        "Programming",
        "Assembly Language"
      ]
    }
  }
};

