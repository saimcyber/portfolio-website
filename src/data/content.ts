// Single source of truth for all personal content on the site.
// Edit here instead of hunting through components.

export const personal = {
  firstName: "SAIM",
  lastName: "ZAIB",
  fullName: "Saim Zaib",
  initials: "SZ",
  email: "saimzaib.official@gmail.com",
  phone: "+92 300 0264566",
  phoneHref: "+923000264566",
  location: "Islamabad, Pakistan",
  github: "https://github.com/saimcyber",
  linkedin: "https://linkedin.com/in/saimzaib",
  resume: "/Saim_Zaib_DevOps_Resume.pdf",
};

/** About-section copy. Kept short on purpose: below 1025px the type is large
 *  and fixed, so a long paragraph runs off the bottom of the viewport. */
export const aboutText =
  "I build and secure the infrastructure that ships software — Kubernetes, Terraform, and CI/CD pipelines that scan before they deploy. Cyber Security undergrad and AWS community lead in Islamabad.";

export interface CareerEntry {
  role: string;
  organization: string;
  period: string;
  description: string;
}

export const careerData: CareerEntry[] = [
  {
    role: "BS Cyber Security",
    organization: "FAST NUCES, Islamabad",
    period: "2024",
    description:
      "Undergraduate degree in Cyber Security, building the foundation behind a DevSecOps approach to infrastructure: secure network design, least-privilege access, vulnerability assessment and incident response applied to cloud and container platforms.",
  },
  {
    role: "DevSecOps Officer",
    organization: "Google Developer Groups on Campus, FAST Islamabad",
    period: "2025",
    description:
      "Implemented CI/CD workflows and containerized applications using Docker and GitHub Actions for internal projects and community events, standardizing the build-and-deploy process across teams. Automated recurring deployment and environment-setup tasks with Infrastructure as Code, replacing manual steps with repeatable pipelines.",
  },
  {
    role: "AWS Community Leader",
    organization: "AWS Student Builder Community, FAST Islamabad",
    period: "NOW",
    description:
      "Design and lead hands-on workshops on AWS core services, CI/CD pipelines and Infrastructure as Code, training students to deploy cloud-based projects end-to-end. Mentor peers on Docker, Kubernetes and CI/CD automation, guiding them from tutorials to deploying real containerized projects.",
  },
];

export interface Project {
  name: string;
  category: string;
  tools: string;
  image: string;
  link?: string;
}

export const projects: Project[] = [
  {
    name: "SecureKubeOps Pipeline",
    category: "Cloud Engineering",
    tools: "GitHub Actions, Docker, Kubernetes, Minikube, Trivy, Prometheus, Grafana",
    image: "/images/placeholder.webp",
  },
  {
    name: "AwareNet Platform",
    category: "DevSecOps",
    tools: "Docker, Microservices, API Gateway, JWT, RBAC, Postman",
    image: "/images/placeholder.webp",
  },
  {
    name: "AWS Cloud Automation",
    category: "Infrastructure as Code",
    tools: "Terraform, EC2, Lambda, RDS, CloudWatch, IAM, VPC",
    image: "/images/placeholder.webp",
  },
];

export interface SkillCard {
  title: string;
  description: string;
  tags: string[];
}

export const skillCards: SkillCard[] = [
  {
    title: "AUTOMATE",
    description:
      "I build the pipelines that take code from commit to production without anyone touching a server, and the infrastructure they run on.",
    tags: [
      "Docker",
      "Kubernetes",
      "Terraform",
      "AWS",
      "GitHub Actions",
      "Jenkins",
      "Helm",
      "Ansible",
      "GitOps",
      "Python",
    ],
  },
  {
    title: "SECURE",
    description:
      "Security belongs inside the pipeline, not bolted on after it. I scan images before they ship and keep clusters observable.",
    tags: [
      "Trivy",
      "Prometheus",
      "Grafana",
      "RBAC",
      "SAST/DAST",
      "Linux",
      "Nginx",
      "Vulnerability Assessment",
    ],
  },
];
