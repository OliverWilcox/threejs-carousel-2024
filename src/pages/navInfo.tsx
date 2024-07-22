import React from "react";

interface NavProps {
  currentProject: number;
}

export const Nav: React.FC<NavProps> = ({ currentProject }) => {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        color: "white",
        zIndex: 10,
      }}
    >
      <div>Oliver Wilcox</div>
      <div>Info</div>
    </nav>
  );
};

interface InfoProps {
  currentProject: number;
}

export const Info: React.FC<InfoProps> = ({ currentProject }) => {
  const projects = [
    {
      name: "Project 1",
      date: "2021",
      client: "Tech Startup",
      role: "UX Design",
      description: "A cutting-edge mobile app for productivity enhancement.",
    },
    {
      name: "Project 2",
      date: "2022",
      client: "E-commerce Giant",
      role: "UI/UX Design",
      description:
        "Redesigned the user interface for a major e-commerce platform.",
    },
    {
      name: "Project 3",
      date: "2023",
      client: "Financial Institution",
      role: "Product Design",
      description:
        "Developed a new digital banking experience for millennials.",
    },
    // Add more projects as needed
  ];

  const project = projects[currentProject % projects.length];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        color: "white",
        zIndex: 10,
      }}
    >
      <div>
        <h2>{project.name}</h2>
        <p>{project.description}</p>
      </div>
      <div>
        <p>Date: {project.date}</p>
        <p>Client: {project.client}</p>
        <p>Role: {project.role}</p>
      </div>
      <div>Email</div>
    </div>
  );
};
