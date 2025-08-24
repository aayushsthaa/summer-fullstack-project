import { Link } from "react-router-dom";
import GithubIcon from "../icons/GithubIcon";
import LinkedInIcon from "../icons/LinkedInIcon";
import PortfolioIcon from "../icons/PortFolioIcon";

const SocialLink = ({
  href,
  icon,
  text,
}: {
  href: string;
  icon: "github" | "linkedin" | "portfolio";
  text: string;
}) => {
  const icons = {
    github: <GithubIcon />,
    linkedin: <LinkedInIcon />,
    portfolio: <PortfolioIcon />,
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {icons[icon]}
      <span className="truncate">{text}</span>
    </a>
  );
};

export default SocialLink;
